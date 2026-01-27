/**
 * TokenDEAL API
 * Gestion de la monnaie interne TokenDEAL
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET - Obtenir le solde et l'historique des tokens
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

    // Récupérer le solde
    const { data: profile } = await supabase
      .from("profiles")
      .select("token_balance")
      .eq("id", user.id)
      .single();

    // Récupérer l'historique des transactions
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: transactions, error: txError } = await supabase
      .from("token_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (txError) {
      console.error("Transactions fetch error:", txError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: profile?.token_balance || 0,
      transactions: transactions || [],
    });
  } catch (error: any) {
    console.error("Tokens API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Effectuer une transaction (achat ou dépense)
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
    const { amount, type, source, description, reference_id } = body;

    if (!amount || !type || !source) {
      return NextResponse.json(
        { error: "Champs requis: amount, type, source" },
        { status: 400 }
      );
    }

    // Vérifier le solde pour les dépenses
    if (amount < 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("token_balance")
        .eq("id", user.id)
        .single();

      const currentBalance = profile?.token_balance || 0;
      if (currentBalance + amount < 0) {
        return NextResponse.json(
          { error: "Solde insuffisant" },
          { status: 400 }
        );
      }
    }

    // Utiliser la fonction SQL pour ajouter les tokens
    const { data, error } = await supabase.rpc("add_tokens", {
      p_user_id: user.id,
      p_amount: amount,
      p_type: type,
      p_source: source,
      p_description: description || null,
    });

    if (error) {
      console.error("Token transaction error:", error);
      return NextResponse.json(
        { error: "Erreur lors de la transaction" },
        { status: 500 }
      );
    }

    // Enregistrer dans les logs d'audit
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: type === "spend" ? "tokens_spent" : "tokens_earned",
      resource_type: "token",
      details: { amount, source, description },
    });

    return NextResponse.json({
      success: true,
      new_balance: data,
    });
  } catch (error: any) {
    console.error("Tokens API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
