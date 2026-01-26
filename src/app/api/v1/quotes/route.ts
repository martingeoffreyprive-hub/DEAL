/**
 * Public API v1 - Quotes Endpoint
 * GET /api/v1/quotes - List quotes
 * POST /api/v1/quotes - Create quote
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

// Validation schemas
const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["draft", "sent", "accepted", "rejected", "finalized", "exported", "archived"]).optional(),
  sector: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["created_at", "updated_at", "total", "quote_number"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const createQuoteSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  client_email: z.string().email().optional(),
  client_phone: z.string().optional(),
  client_address: z.string().optional(),
  client_city: z.string().optional(),
  client_postal_code: z.string().optional(),
  sector: z.string().min(1, "Sector is required"),
  title: z.string().optional(),
  notes: z.string().optional(),
  valid_until: z.string().datetime().optional(),
  tax_rate: z.number().min(0).max(100).default(21),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    unit_price: z.number().min(0),
  })).min(1, "At least one item is required"),
});

/**
 * GET /api/v1/quotes
 * List quotes with pagination, filtering, and sorting
 */
export async function GET(request: NextRequest) {
  return withApiAuth(request, ["quotes:read"], async (keyInfo: ApiKeyInfo) => {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const queryResult = listQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize") || searchParams.get("page_size"),
      status: searchParams.get("status"),
      sector: searchParams.get("sector"),
      search: searchParams.get("search") || searchParams.get("q"),
      sortBy: searchParams.get("sortBy") || searchParams.get("sort_by"),
      sortOrder: searchParams.get("sortOrder") || searchParams.get("sort_order"),
    });

    if (!queryResult.success) {
      return apiErrorResponse(
        "VALIDATION_ERROR",
        "Invalid query parameters",
        400,
        { errors: queryResult.error.flatten().fieldErrors }
      );
    }

    const { page, pageSize, status, sector, search, sortBy, sortOrder } = queryResult.data;

    // Build query
    let query = supabase
      .from("quotes")
      .select("*, quote_items(*)", { count: "exact" })
      .eq("user_id", keyInfo.userId);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (sector) {
      query = query.eq("sector", sector);
    }
    if (search) {
      query = query.or(
        `client_name.ilike.%${search}%,quote_number.ilike.%${search}%,title.ilike.%${search}%`
      );
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data: quotes, error, count } = await query;

    if (error) {
      return apiErrorResponse("DATABASE_ERROR", "Failed to fetch quotes", 500);
    }

    // Transform response
    const transformedQuotes = (quotes || []).map((quote) => ({
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
      valid_until: quote.valid_until,
      subtotal: quote.subtotal,
      tax_rate: quote.tax_rate,
      tax_amount: quote.tax_amount,
      total: quote.total,
      items: (quote.quote_items || []).map((item: any) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.total,
      })),
      created_at: quote.created_at,
      updated_at: quote.updated_at,
    }));

    return apiSuccessResponse(transformedQuotes, {
      page,
      pageSize,
      total: count || 0,
      hasMore: count ? from + quotes.length < count : false,
    });
  });
}

/**
 * POST /api/v1/quotes
 * Create a new quote
 */
export async function POST(request: NextRequest) {
  return withApiAuth(request, ["quotes:write"], async (keyInfo: ApiKeyInfo) => {
    const supabase = await createClient();

    // Parse and validate body
    let body;
    try {
      body = await request.json();
    } catch {
      return apiErrorResponse("INVALID_JSON", "Request body must be valid JSON", 400);
    }

    const validationResult = createQuoteSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrorResponse(
        "VALIDATION_ERROR",
        "Invalid quote data",
        400,
        { errors: validationResult.error.flatten().fieldErrors }
      );
    }

    const data = validationResult.data;

    // Get user's profile for quote number
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("quote_prefix, next_quote_number")
      .eq("id", keyInfo.userId)
      .single();

    if (profileError) {
      return apiErrorResponse("PROFILE_ERROR", "Failed to fetch user profile", 500);
    }

    // Generate quote number
    const quotePrefix = profile?.quote_prefix || "DEV";
    const nextNumber = profile?.next_quote_number || 1;
    const quoteNumber = `${quotePrefix}-${String(nextNumber).padStart(5, "0")}`;

    // Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const taxAmount = subtotal * (data.tax_rate / 100);
    const total = subtotal + taxAmount;

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        user_id: keyInfo.userId,
        quote_number: quoteNumber,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_address: data.client_address,
        client_city: data.client_city,
        client_postal_code: data.client_postal_code,
        sector: data.sector,
        title: data.title,
        notes: data.notes,
        valid_until: data.valid_until,
        subtotal,
        tax_rate: data.tax_rate,
        tax_amount: taxAmount,
        total,
        status: "draft",
      })
      .select()
      .single();

    if (quoteError) {
      return apiErrorResponse("CREATE_ERROR", "Failed to create quote", 500);
    }

    // Create quote items
    const itemsToInsert = data.items.map((item, index) => ({
      quote_id: quote.id,
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
      // Rollback quote creation
      await supabase.from("quotes").delete().eq("id", quote.id);
      return apiErrorResponse("CREATE_ERROR", "Failed to create quote items", 500);
    }

    // Update next quote number
    await supabase
      .from("profiles")
      .update({ next_quote_number: nextNumber + 1 })
      .eq("id", keyInfo.userId);

    // Return created quote
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
      valid_until: quote.valid_until,
      subtotal: quote.subtotal,
      tax_rate: quote.tax_rate,
      tax_amount: quote.tax_amount,
      total: quote.total,
      items: data.items.map((item, i) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      })),
      created_at: quote.created_at,
    });
  });
}
