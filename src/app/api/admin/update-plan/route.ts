import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [
  "admin@dealofficialapp.com",
  "martin.geoffrey.prive@gmail.com",
];

const VALID_PLANS = ["free", "starter", "pro", "ultimate"];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
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

    // Update or create subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingSubscription) {
      // Update existing subscription
      const { error } = await supabase
        .from("subscriptions")
        .update({
          plan_name: planName,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      // Create new subscription
      const { error } = await supabase
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
