/**
 * Admin Stats API Endpoint
 * GET /api/admin/stats
 * Returns platform-wide statistics (admin only)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "super_admin") {
      return NextResponse.json(
        { error: "Accès refusé - Administrateur requis" },
        { status: 403 }
      );
    }

    // Fetch all stats in parallel
    const [
      usersCount,
      quotesCount,
      subscriptionsData,
      recentSignups,
      activeUsersData,
    ] = await Promise.all([
      // Total users
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),

      // Total quotes
      supabase
        .from("quotes")
        .select("*", { count: "exact", head: true }),

      // Subscriptions breakdown
      supabase
        .from("subscriptions")
        .select("plan_type, status"),

      // Recent signups (last 7 days)
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Active users (logged in last 30 days)
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("updated_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    // Calculate subscription stats
    const subscriptions = subscriptionsData.data || [];
    const activeSubs = subscriptions.filter((s: any) => s.status === "active");

    const proCount = activeSubs.filter((s: any) => s.plan_type === "pro").length;
    const businessCount = activeSubs.filter((s: any) => s.plan_type === "business").length;
    const enterpriseCount = activeSubs.filter((s: any) => s.plan_type === "enterprise").length;

    // Calculate MRR (Monthly Recurring Revenue)
    const MRR_PRICES: Record<string, number> = {
      pro: 29,
      business: 99,
      enterprise: 299,
    };

    const totalMRR = activeSubs.reduce((sum: number, sub: any) => {
      return sum + (MRR_PRICES[sub.plan_type] || 0);
    }, 0);

    const totalUsers = usersCount.count || 0;
    const freeUsers = totalUsers - proCount - businessCount - enterpriseCount;

    const stats = {
      totalUsers,
      activeUsers: activeUsersData.count || 0,
      totalQuotes: quotesCount.count || 0,
      totalRevenue: totalMRR,
      proSubscriptions: proCount,
      businessSubscriptions: businessCount,
      enterpriseSubscriptions: enterpriseCount,
      freeUsers,
      recentSignups: recentSignups.count || 0,
      mrr: totalMRR,
      arr: totalMRR * 12,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
