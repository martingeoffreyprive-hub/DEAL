/**
 * Public API v1 - Single Quote Endpoint
 * GET /api/v1/quotes/:id - Get quote
 * PATCH /api/v1/quotes/:id - Update quote
 * DELETE /api/v1/quotes/:id - Delete quote
 */

export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  withApiAuth,
  apiSuccessResponse,
  apiErrorResponse,
  type ApiKeyInfo,
} from "@/lib/api/auth";
import { z } from "zod";

// Validation schema for updates
const updateQuoteSchema = z.object({
  client_name: z.string().min(1).optional(),
  client_email: z.string().email().optional(),
  client_phone: z.string().optional(),
  client_address: z.string().optional(),
  client_city: z.string().optional(),
  client_postal_code: z.string().optional(),
  sector: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  valid_until: z.string().datetime().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "finalized", "exported", "archived"]).optional(),
  items: z.array(z.object({
    id: z.string().uuid().optional(), // Existing item ID for updates
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    unit_price: z.number().min(0),
  })).optional(),
}).strict();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/quotes/:id
 * Get a single quote by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return withApiAuth(request, ["quotes:read"], async (keyInfo: ApiKeyInfo) => {
    const supabase = await createClient();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return apiErrorResponse("INVALID_ID", "Invalid quote ID format", 400);
    }

    // Fetch quote with items
    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("id", id)
      .eq("user_id", keyInfo.userId)
      .single();

    if (error || !quote) {
      return apiErrorResponse("NOT_FOUND", "Quote not found", 404);
    }

    // Transform and return
    return apiSuccessResponse({
      id: quote.id,
      quote_number: quote.quote_number,
      status: quote.status,
      client: {
        name: quote.client_name,
        email: quote.client_email,
        phone: quote.client_phone,
        address: quote.client_address,
        city: quote.client_city,
        postal_code: quote.client_postal_code,
      },
      sector: quote.sector,
      title: quote.title,
      notes: quote.notes,
      transcription: quote.transcription,
      valid_until: quote.valid_until,
      subtotal: quote.subtotal,
      tax_rate: quote.tax_rate,
      tax_amount: quote.tax_amount,
      total: quote.total,
      pdf_url: quote.pdf_url,
      items: (quote.quote_items || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
        })),
      created_at: quote.created_at,
      updated_at: quote.updated_at,
      finalized_at: quote.finalized_at,
    });
  });
}

/**
 * PATCH /api/v1/quotes/:id
 * Update a quote
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return withApiAuth(request, ["quotes:write"], async (keyInfo: ApiKeyInfo) => {
    const supabase = await createClient();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return apiErrorResponse("INVALID_ID", "Invalid quote ID format", 400);
    }

    // Parse and validate body
    let body;
    try {
      body = await request.json();
    } catch {
      return apiErrorResponse("INVALID_JSON", "Request body must be valid JSON", 400);
    }

    const validationResult = updateQuoteSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrorResponse(
        "VALIDATION_ERROR",
        "Invalid update data",
        400,
        { errors: validationResult.error.flatten().fieldErrors }
      );
    }

    const data = validationResult.data;

    // Check quote exists and belongs to user
    const { data: existingQuote, error: fetchError } = await supabase
      .from("quotes")
      .select("id, status")
      .eq("id", id)
      .eq("user_id", keyInfo.userId)
      .single();

    if (fetchError || !existingQuote) {
      return apiErrorResponse("NOT_FOUND", "Quote not found", 404);
    }

    // Check if quote can be modified (not finalized/exported)
    if (["finalized", "exported", "archived"].includes(existingQuote.status)) {
      return apiErrorResponse(
        "IMMUTABLE",
        "Cannot modify a finalized, exported, or archived quote",
        400
      );
    }

    // Prepare quote update
    const quoteUpdate: Record<string, any> = {};
    const fieldMapping: Record<string, string> = {
      client_name: "client_name",
      client_email: "client_email",
      client_phone: "client_phone",
      client_address: "client_address",
      client_city: "client_city",
      client_postal_code: "client_postal_code",
      sector: "sector",
      title: "title",
      notes: "notes",
      valid_until: "valid_until",
      tax_rate: "tax_rate",
      status: "status",
    };

    for (const [key, dbField] of Object.entries(fieldMapping)) {
      if (data[key as keyof typeof data] !== undefined) {
        quoteUpdate[dbField] = data[key as keyof typeof data];
      }
    }

    // Handle items update if provided
    if (data.items) {
      // Delete existing items
      await supabase.from("quote_items").delete().eq("quote_id", id);

      // Insert new items
      const itemsToInsert = data.items.map((item, index) => ({
        quote_id: id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
        order_index: index,
      }));

      const { error: itemsError } = await supabase
        .from("quote_items")
        .insert(itemsToInsert);

      if (itemsError) {
        return apiErrorResponse("UPDATE_ERROR", "Failed to update quote items", 500);
      }

      // Recalculate totals
      const subtotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const taxRate = data.tax_rate ?? 21;
      const taxAmount = subtotal * (taxRate / 100);

      quoteUpdate.subtotal = subtotal;
      quoteUpdate.tax_amount = taxAmount;
      quoteUpdate.total = subtotal + taxAmount;
    }

    // Update quote
    if (Object.keys(quoteUpdate).length > 0) {
      quoteUpdate.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("quotes")
        .update(quoteUpdate)
        .eq("id", id);

      if (updateError) {
        return apiErrorResponse("UPDATE_ERROR", "Failed to update quote", 500);
      }
    }

    // Fetch and return updated quote
    const { data: updatedQuote, error: refetchError } = await supabase
      .from("quotes")
      .select("*, quote_items(*)")
      .eq("id", id)
      .single();

    if (refetchError || !updatedQuote) {
      return apiErrorResponse("FETCH_ERROR", "Failed to fetch updated quote", 500);
    }

    return apiSuccessResponse({
      id: updatedQuote.id,
      quote_number: updatedQuote.quote_number,
      status: updatedQuote.status,
      client: {
        name: updatedQuote.client_name,
        email: updatedQuote.client_email,
        phone: updatedQuote.client_phone,
        address: updatedQuote.client_address,
        city: updatedQuote.client_city,
        postal_code: updatedQuote.client_postal_code,
      },
      sector: updatedQuote.sector,
      title: updatedQuote.title,
      notes: updatedQuote.notes,
      valid_until: updatedQuote.valid_until,
      subtotal: updatedQuote.subtotal,
      tax_rate: updatedQuote.tax_rate,
      tax_amount: updatedQuote.tax_amount,
      total: updatedQuote.total,
      items: (updatedQuote.quote_items || [])
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
        })),
      updated_at: updatedQuote.updated_at,
    });
  });
}

/**
 * DELETE /api/v1/quotes/:id
 * Delete a quote
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return withApiAuth(request, ["quotes:delete"], async (keyInfo: ApiKeyInfo) => {
    const supabase = await createClient();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return apiErrorResponse("INVALID_ID", "Invalid quote ID format", 400);
    }

    // Check quote exists and belongs to user
    const { data: existingQuote, error: fetchError } = await supabase
      .from("quotes")
      .select("id, status")
      .eq("id", id)
      .eq("user_id", keyInfo.userId)
      .single();

    if (fetchError || !existingQuote) {
      return apiErrorResponse("NOT_FOUND", "Quote not found", 404);
    }

    // Check if quote can be deleted
    if (["finalized", "exported"].includes(existingQuote.status)) {
      return apiErrorResponse(
        "IMMUTABLE",
        "Cannot delete a finalized or exported quote. Archive it instead.",
        400
      );
    }

    // Delete quote items first (cascade should handle this, but be explicit)
    await supabase.from("quote_items").delete().eq("quote_id", id);

    // Delete quote
    const { error: deleteError } = await supabase
      .from("quotes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return apiErrorResponse("DELETE_ERROR", "Failed to delete quote", 500);
    }

    return apiSuccessResponse({ deleted: true, id });
  });
}
