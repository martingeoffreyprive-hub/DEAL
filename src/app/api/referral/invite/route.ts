/**
 * Referral Invite API
 * Envoi d'invitations de parrainage par email
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// POST - Envoyer une invitation de parrainage
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier si l'utilisateur s'invite lui-même
    if (normalizedEmail === user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas vous inviter vous-même" },
        { status: 400 }
      );
    }

    // Vérifier si cette personne est déjà membre
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Cette personne est déjà membre de DEAL" },
        { status: 409 }
      );
    }

    // Vérifier si une invitation existe déjà
    const { data: existingInvite } = await supabase
      .from("referrals")
      .select("id, status")
      .eq("referrer_id", user.id)
      .eq("referred_email", normalizedEmail)
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: "Une invitation a déjà été envoyée à cette adresse" },
        { status: 409 }
      );
    }

    // Récupérer le code de parrainage de l'utilisateur
    const { data: settings } = await supabase
      .from("user_settings")
      .select("referral_code")
      .eq("user_id", user.id)
      .single();

    // Récupérer le profil pour personnaliser l'email
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, company_name")
      .eq("id", user.id)
      .single();

    const senderName = profile?.full_name || profile?.company_name || "Un membre DEAL";
    const referralCode = settings?.referral_code || "DEAL";

    // Créer l'entrée de parrainage
    const { data: referral, error: createError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: user.id,
        referred_email: normalizedEmail,
        status: "pending",
      })
      .select()
      .single();

    if (createError) {
      console.error("Referral creation error:", createError);
      return NextResponse.json(
        { error: "Erreur lors de la création de l'invitation" },
        { status: 500 }
      );
    }

    // TODO: Intégrer avec un service d'envoi d'emails (Resend, SendGrid, etc.)
    // Pour l'instant, simuler l'envoi
    console.log(`📧 Invitation envoyée à ${normalizedEmail} de la part de ${senderName}`);
    console.log(`   Code de parrainage: ${referralCode}`);
    console.log(`   Lien: https://deal.be/join/${referralCode}`);

    // Enregistrer dans les logs d'audit
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "referral_invite_sent",
      resource_type: "referral",
      resource_id: referral.id,
      details: { invited_email: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: `Invitation envoyée à ${normalizedEmail}`,
      referral_id: referral.id,
    });
  } catch (error: any) {
    console.error("Referral invite API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
