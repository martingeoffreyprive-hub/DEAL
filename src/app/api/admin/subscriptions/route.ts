import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "admin@dealofficialapp.com",
  "martin.geoffrey.prive@gmail.com",
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const planFilter = searchParams.get("plan") || "all";
    const statusFilter = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const from = (page - 1) * pageSize;

    // Fetch subscriptions
    let query = serviceClient
      .from("subscriptions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (planFilter !== "all") {
      query = query.eq("plan_name", planFilter);
    }
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    query = query.range(from, from + pageSize - 1);

    const { data: subs, error, count } = await query;
    if (error) throw error;

    // Fetch profiles for these users
    const userIds = (subs || []).map((s: any) => s.user_id);
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("id, full_name, company_name, email")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    );

    // Fetch all subs for stats
    const { data: allSubs } = await serviceClient
      .from("subscriptions")
      .select("plan_name, status");

    const activeSubs = (allSubs || []).filter((s: any) => s.status === "active");
    const PLAN_PRICES: Record<string, number> = {
      free: 0, pro: 29, business: 99, corporate: 299,
    };
    const mrr = activeSubs.reduce((sum: number, s: any) => sum + (PLAN_PRICES[s.plan_name] || 0), 0);

    const subscriptions = (subs || []).map((sub: any) => {
      const profile = profileMap.get(sub.user_id);
      return {
        ...sub,
        plan_type: sub.plan_name, // alias for frontend compatibility
        profile: profile ? {
          full_name: profile.full_name,
          company_name: profile.company_name,
          email: profile.email,
        } : null,
      };
    });

    return NextResponse.json({
      subscriptions,
      total: count || 0,
      stats: {
        totalMRR: mrr,
        activeSubscriptions: activeSubs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
