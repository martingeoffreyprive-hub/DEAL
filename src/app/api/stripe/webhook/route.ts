import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Client Supabase avec service role pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const PLAN_MAPPING: Record<string, string> = {
  [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || ""]: "starter",
  [process.env.STRIPE_STARTER_YEARLY_PRICE_ID || ""]: "starter",
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || ""]: "pro",
  [process.env.STRIPE_PRO_YEARLY_PRICE_ID || ""]: "pro",
  [process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID || ""]: "ultimate",
  [process.env.STRIPE_ULTIMATE_YEARLY_PRICE_ID || ""]: "ultimate",
};

// Idempotency: Check if event was already processed
async function isEventProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("processed_stripe_events")
    .select("id")
    .eq("event_id", eventId)
    .single();

  return !!data;
}

// Mark event as processed for idempotency
async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  await supabaseAdmin.from("processed_stripe_events").insert({
    event_id: eventId,
    event_type: eventType,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  // Security: Reject requests without signature header
  if (!signature) {
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    console.warn(`[SECURITY] Webhook request without signature from IP: ${ip}`);
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    console.error(`[SECURITY] Webhook signature verification failed from IP ${ip}:`, err.message);
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 400 }
    );
  }

  // Idempotency check: Skip if already processed (replay attack protection)
  try {
    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`[IDEMPOTENCY] Skipping already processed event: ${event.id}`);
      return NextResponse.json({ received: true, skipped: true });
    }
  } catch (error) {
    // If idempotency check fails, continue processing but log warning
    console.warn("[IDEMPOTENCY] Could not check event status, proceeding:", error);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed for idempotency
    try {
      await markEventProcessed(event.id, event.type);
    } catch (error) {
      console.warn("[IDEMPOTENCY] Could not mark event as processed:", error);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const planName = session.metadata?.plan_name;

  if (!userId || !planName) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Récupérer les détails de l'abonnement
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

  // Mettre à jour l'abonnement dans Supabase
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_name: planName,
      status: "active",
      stripe_subscription_id: subscription.id,
      stripe_customer_id: session.customer as string,
      current_period_start: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000).toISOString()
        : null,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }

  console.log(`Subscription activated for user ${userId}: ${planName}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = subscription as any;

  // Essayer de trouver l'utilisateur via le customer ID
  const { data } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (!data) {
    console.error("User not found for subscription:", subscription.id);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planName = PLAN_MAPPING[priceId] || "free";

  const status = subscription.status === "active" || subscription.status === "trialing"
    ? "active"
    : subscription.status === "past_due"
    ? "past_due"
    : "cancelled";

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_name: planName,
      status,
      current_period_start: sub.current_period_start
        ? new Date(sub.current_period_start * 1000).toISOString()
        : null,
      current_period_end: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Error updating subscription:", error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_name: "free",
      status: "cancelled",
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    console.error("Error canceling subscription:", error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const inv = invoice as any;
  const subscriptionId = inv.subscription as string;

  if (!subscriptionId) return;

  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Error updating subscription status:", error);
  }
}
