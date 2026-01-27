/**
 * API Keys Management
 * Gestion des clés API pour les intégrations widget
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET - Liste des clés API
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

    const { data: apiKeys, error } = await supabase
      .from("api_keys")
      .select("id, name, permissions, rate_limit_per_hour, last_used_at, revoked, created_at, expires_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("API keys fetch error:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      );
    }

    return NextResponse.json({ api_keys: apiKeys || [] });
  } catch (error: any) {
    console.error("API Keys API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle clé API
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
    const { name, permissions, rate_limit_per_hour, expires_in_days } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la clé est requis" },
        { status: 400 }
      );
    }

    // Générer une clé API unique
    const apiKey = `deal_${crypto.randomBytes(32).toString("hex")}`;

    // Hasher la clé pour le stockage (en production, utiliser bcrypt ou argon2)
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    const expiresAt = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: newKey, error: createError } = await supabase
      .from("api_keys")
      .insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        permissions: permissions || ["widget:create_lead"],
        rate_limit_per_hour: rate_limit_per_hour || 100,
        rate_limit_remaining: rate_limit_per_hour || 100,
        expires_at: expiresAt,
      })
      .select("id, name, permissions, rate_limit_per_hour, created_at, expires_at")
      .single();

    if (createError) {
      console.error("API key creation error:", createError);
      return NextResponse.json(
        { error: "Erreur lors de la création" },
        { status: 500 }
      );
    }

    // Enregistrer dans les logs d'audit
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "api_key_created",
      resource_type: "api_key",
      resource_id: newKey.id,
      details: { name },
    });

    // Retourner la clé en clair (une seule fois!)
    return NextResponse.json({
      api_key: {
        ...newKey,
        key: apiKey, // Clé en clair, ne sera plus affichée après
      },
      warning: "Conservez cette clé en lieu sûr. Elle ne sera plus affichée.",
    }, { status: 201 });
  } catch (error: any) {
    console.error("API Keys API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Révoquer une clé API
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json(
        { error: "ID de la clé requis" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("api_keys")
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", keyId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("API key revoke error:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de la révocation" },
        { status: 500 }
      );
    }

    // Enregistrer dans les logs d'audit
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "api_key_revoked",
      resource_type: "api_key",
      resource_id: keyId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API Keys API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
