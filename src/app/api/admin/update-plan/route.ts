import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = [
  "admin@dealofficialapp.com",
  "martin.geoffrey.prive@gmail.com",
];

const VALID_PLANS = ["free", "pro", "business", "corporate"];

export async function POST(request: NextRequest) {
  try {
    // Verify admin access with user's auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, planName } = await request.json();

    if (!userId || !planName) {
      return NextResponse.json({ error: "Missing userId or planName" }, { status: 400 });
    }

    if (!VALID_PLANS.includes(planName)) {
      return NextResponse.json({ error: "Invalid plan name" }, { status: 400 });
    }

    // Use service role to bypass RLS
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update or create subscription
    const { data: existingSubscription } = await serviceClient
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingSubscription) {
      const { error } = await serviceClient
        .from("subscriptions")
        .update({
          plan_name: planName,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      const { error } = await serviceClient
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_name: planName,
          status: "active",
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true, planName });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
