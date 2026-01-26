/**
 * GDPR Data Export Endpoint
 * GET /api/gdpr/export
 *
 * Exports all user data in JSON format (GDPR Article 20 - Right to Data Portability)
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Fetch all user data
    const [
      profileResult,
      quotesResult,
      subscriptionResult,
      usageSatsResult,
      sectorsResult,
    ] = await Promise.all([
      // Profile
      supabase.from("profiles").select("*").eq("id", user.id).single(),

      // Quotes with items
      supabase
        .from("quotes")
        .select("*, quote_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // Subscription
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single(),

      // Usage stats
      supabase
        .from("usage_stats")
        .select("*")
        .eq("user_id", user.id)
        .order("month_year", { ascending: false }),

      // User sectors
      supabase
        .from("user_sectors")
        .select("*")
        .eq("user_id", user.id),
    ]);

    // Compile export data
    const exportData = {
      export_info: {
        user_id: user.id,
        email: user.email,
        exported_at: new Date().toISOString(),
        format_version: "1.0",
        gdpr_article: "Article 20 - Right to Data Portability",
      },
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        email_confirmed: user.email_confirmed_at,
      },
      profile: profileResult.data
        ? {
            company_name: profileResult.data.company_name,
            siret: profileResult.data.siret,
            address: profileResult.data.address,
            city: profileResult.data.city,
            postal_code: profileResult.data.postal_code,
            phone: profileResult.data.phone,
            email: profileResult.data.email,
            website: profileResult.data.website,
            logo_url: profileResult.data.logo_url,
            iban: profileResult.data.iban ? "***REDACTED***" : null,
            bic: profileResult.data.bic,
            bank_name: profileResult.data.bank_name,
            legal_mentions: profileResult.data.legal_mentions,
            default_sector: profileResult.data.default_sector,
            created_at: profileResult.data.created_at,
            updated_at: profileResult.data.updated_at,
          }
        : null,
      subscription: subscriptionResult.data
        ? {
            plan: subscriptionResult.data.plan_name,
            status: subscriptionResult.data.status,
            current_period_start: subscriptionResult.data.current_period_start,
            current_period_end: subscriptionResult.data.current_period_end,
            created_at: subscriptionResult.data.created_at,
          }
        : null,
      quotes: (quotesResult.data || []).map((quote) => ({
        id: quote.id,
        quote_number: quote.quote_number,
        status: quote.status,
        sector: quote.sector,
        client: {
          name: quote.client_name,
          email: quote.client_email,
          phone: quote.client_phone,
          address: quote.client_address,
          city: quote.client_city,
          postal_code: quote.client_postal_code,
        },
        title: quote.title,
        notes: quote.notes,
        valid_until: quote.valid_until,
        subtotal: quote.subtotal,
        tax_rate: quote.tax_rate,
        tax_amount: quote.tax_amount,
        total: quote.total,
        items: (quote.quote_items || []).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
        })),
        created_at: quote.created_at,
        updated_at: quote.updated_at,
      })),
      usage_statistics: usageSatsResult.data || [],
      unlocked_sectors: (sectorsResult.data || []).map((s) => ({
        sector: s.sector,
        is_primary: s.is_primary,
        unlocked_at: s.unlocked_at,
      })),
    };

    // Log the export action
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: "EXPORT",
      resourceType: "user",
      resourceId: user.id,
      details: {
        type: "gdpr_data_export",
        quotes_count: exportData.quotes.length,
      },
    });

    // Return as downloadable JSON
    const filename = `quotevoice-export-${user.id}-${Date.now()}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("GDPR export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    );
  }
}
