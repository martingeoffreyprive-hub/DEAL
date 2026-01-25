import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

// Lazy initialization pour éviter les erreurs au build
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY non configurée");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Prix Stripe pour chaque plan (à créer dans le dashboard Stripe)
function getPlanPrices(): Record<string, { monthly: string; yearly: string }> {
  return {
    starter: {
      monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
      yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
    },
    pro: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "",
    },
    ultimate: {
      monthly: process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID || "",
      yearly: process.env.STRIPE_ULTIMATE_YEARLY_PRICE_ID || "",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const PLAN_PRICES = getPlanPrices();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { planName, billingPeriod } = body;

    if (!planName || !PLAN_PRICES[planName]) {
      return NextResponse.json(
        { error: "Plan invalide" },
        { status: 400 }
      );
    }

    const priceId = billingPeriod === "yearly"
      ? PLAN_PRICES[planName].yearly
      : PLAN_PRICES[planName].monthly;

    if (!priceId) {
      return NextResponse.json(
        { error: "Prix non configuré pour ce plan" },
        { status: 400 }
      );
    }

    // Récupérer ou créer le customer Stripe
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      // Créer un nouveau customer Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Sauvegarder le customer ID
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // Créer la session de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card", "bancontact", "ideal"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_name: planName,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_name: planName,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
