import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "admin@dealofficialapp.com",
  "martin.geoffrey.prive@gmail.com",
];

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service role client to bypass RLS
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Parse query params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const from = (page - 1) * pageSize;

    // Fetch profiles with service role (bypasses RLS)
    let query = serviceClient
      .from("profiles")
      .select("id, email, full_name, company_name, role, created_at", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.range(from, from + pageSize - 1);

    const { data: profiles, error, count } = await query;

    if (error) throw error;

    // Fetch subscriptions
    const userIds = (profiles || []).map((p: any) => p.id);
    const { data: subscriptions } = await serviceClient
      .from("subscriptions")
      .select("user_id, plan_name, status")
      .in("user_id", userIds);

    const subMap = new Map(
      (subscriptions || []).map((s: any) => [s.user_id, { plan_type: s.plan_name, status: s.status }])
    );

    // Transform data
    const users = (profiles || []).map((profile: any) => ({
      id: profile.id,
      email: profile.email || "",
      created_at: profile.created_at,
      last_sign_in_at: null,
      profile: {
        full_name: profile.full_name,
        company_name: profile.company_name,
        role: profile.role || "user",
      },
      subscription: subMap.get(profile.id) || { plan_type: "free", status: "active" },
      is_active: true,
    }));

    return NextResponse.json({ users, total: count || 0 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
