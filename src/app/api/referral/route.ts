/**
 * Referral API
 * Gestion des parrainages
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET - Liste des parrainages de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Referrals fetch error:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      );
    }

    return NextResponse.json({ referrals: referrals || [] });
  } catch (error: any) {
    console.error("Referral API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau parrainage (quand quelqu'un utilise un code)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { referral_code, referred_email } = body;

    if (!referral_code || !referred_email) {
      return NextResponse.json(
        { error: "Code de parrainage et email requis" },
        { status: 400 }
      );
    }

    // Trouver le parrain par son code
    const { data: referrer, error: referrerError } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("referral_code", referral_code.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json(
        { error: "Code de parrainage invalide" },
        { status: 404 }
      );
    }

    // Vérifier si ce parrainage existe déjà
    const { data: existing } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrer.user_id)
      .eq("referred_email", referred_email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Ce parrainage existe déjà" },
        { status: 409 }
      );
    }

    // Créer le parrainage
    const { data: referral, error: createError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrer.user_id,
        referred_email: referred_email.toLowerCase(),
        status: "pending",
      })
      .select()
      .single();

    if (createError) {
      console.error("Referral creation error:", createError);
      return NextResponse.json(
        { error: "Erreur lors de la création" },
        { status: 500 }
      );
    }

    return NextResponse.json({ referral }, { status: 201 });
  } catch (error: any) {
    console.error("Referral API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
