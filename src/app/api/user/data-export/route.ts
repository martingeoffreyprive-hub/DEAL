/**
 * GDPR Data Export Endpoint
 * GET /api/user/data-export
 * Exports all user data in JSON format
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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
      usageResult,
      auditResult,
    ] = await Promise.all([
      // Profile
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single(),

      // All quotes with items
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
        .maybeSingle(),

      // Usage stats
      supabase
        .from("usage_stats")
        .select("*")
        .eq("user_id", user.id)
        .order("month_year", { ascending: false }),

      // Audit logs (last 1000)
      supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: "1.0",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile: profileResult.data || null,
      quotes: (quotesResult.data || []).map((quote) => ({
        ...quote,
        items: quote.quote_items || [],
      })),
      subscription: subscriptionResult.data || null,
      usageStats: usageResult.data || [],
      auditLogs: auditResult.data || [],
      metadata: {
        totalQuotes: quotesResult.data?.length || 0,
        totalAuditLogs: auditResult.data?.length || 0,
      },
    };

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2);
    const filename = `quotevoice-export-${user.id.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des données" },
      { status: 500 }
    );
  }
}
