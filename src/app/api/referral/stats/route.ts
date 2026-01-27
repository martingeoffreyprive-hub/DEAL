/**
 * Referral Stats API
 * Statistiques du programme de parrainage
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AMBASSADOR_LEVELS } from "@/lib/referral/referral-system";

export const dynamic = "force-dynamic";

// GET - Statistiques de parrainage de l'utilisateur
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

    // Récupérer les paramètres utilisateur (code de parrainage)
    const { data: settings } = await supabase
      .from("user_settings")
      .select("referral_code")
      .eq("user_id", user.id)
      .single();

    // Récupérer tous les parrainages
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select("status, reward_amount")
      .eq("referrer_id", user.id);

    if (referralsError) {
      console.error("Referrals fetch error:", referralsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      );
    }

    // Calculer les statistiques
    const totalReferrals = referrals?.length || 0;
    const pendingReferrals = referrals?.filter(
      (r) => r.status === "pending" || r.status === "signed_up"
    ).length || 0;
    const convertedReferrals = referrals?.filter(
      (r) => r.status === "converted" || r.status === "rewarded"
    ).length || 0;
    const totalEarnings = referrals?.reduce(
      (sum, r) => sum + (r.reward_amount || 0),
      0
    ) || 0;

    // Déterminer le niveau ambassadeur
    let ambassadorLevel: "bronze" | "silver" | "gold" | "platinum" = "bronze";
    if (convertedReferrals >= AMBASSADOR_LEVELS.platinum.min_referrals) {
      ambassadorLevel = "platinum";
    } else if (convertedReferrals >= AMBASSADOR_LEVELS.gold.min_referrals) {
      ambassadorLevel = "gold";
    } else if (convertedReferrals >= AMBASSADOR_LEVELS.silver.min_referrals) {
      ambassadorLevel = "silver";
    }

    // Générer un code si n'existe pas
    let referralCode = settings?.referral_code;
    if (!referralCode) {
      referralCode = generateReferralCode();
      await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          referral_code: referralCode,
        });
    }

    return NextResponse.json({
      totalReferrals,
      pendingReferrals,
      convertedReferrals,
      totalEarnings,
      ambassadorLevel,
      referralCode,
    });
  } catch (error: any) {
    console.error("Referral stats API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// Générer un code de parrainage unique
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DEAL";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
