/**
 * Widget Quote Request API
 * Endpoint pour recevoir les demandes de devis via widget
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeWorkflow, WORKFLOW_TRIGGERS } from "@/lib/workflow/workflow-engine";

export const dynamic = "force-dynamic";

// CORS headers for widget
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

// POST - Recevoir une demande de devis
export async function POST(request: NextRequest) {
  try {
    // Vérifier la clé API
    const apiKey = request.headers.get("X-API-Key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API manquante" },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabase = await createClient();

    // Valider la clé API
    const { data: apiKeyData, error: apiError } = await supabase
      .from("api_keys")
      .select("user_id, permissions, rate_limit_remaining")
      .eq("key_hash", apiKey) // En production, hasher la clé
      .eq("revoked", false)
      .single();

    if (apiError || !apiKeyData) {
      return NextResponse.json(
        { error: "Clé API invalide" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Vérifier le rate limit
    if (apiKeyData.rate_limit_remaining <= 0) {
      return NextResponse.json(
        { error: "Limite de requêtes atteinte" },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Valider les données requises
    if (!body.name || !body.email || !body.description) {
      return NextResponse.json(
        { error: "Champs requis: name, email, description" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Vérification anti-bot basique (human verification field)
    if (!body.humanVerification || body.humanVerification.length < 3) {
      return NextResponse.json(
        { error: "Vérification humaine échouée" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Créer l'entrée de lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        user_id: apiKeyData.user_id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        work_type: body.workType,
        description: body.description,
        source: "widget",
        source_details: {
          company: body.company,
          timestamp: body.timestamp,
          user_agent: request.headers.get("user-agent"),
        },
        status: "new",
      })
      .select()
      .single();

    if (leadError) {
      console.error("Lead creation error:", leadError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Chercher un workflow automatisé
    const { data: workflows } = await supabase
      .from("workflows")
      .select("*")
      .eq("user_id", apiKeyData.user_id)
      .eq("enabled", true)
      .eq("trigger_type", WORKFLOW_TRIGGERS.FORM_SUBMITTED);

    // Exécuter le workflow si trouvé
    if (workflows && workflows.length > 0) {
      try {
        await executeWorkflow(workflows[0].id, {
          lead_id: lead.id,
          client_name: body.name,
          client_email: body.email,
          client_phone: body.phone,
          description: body.description,
          source: "widget",
        });
      } catch (workflowError) {
        console.error("Workflow execution error:", workflowError);
        // Ne pas bloquer la réponse si le workflow échoue
      }
    }

    // Créer une notification pour l'utilisateur
    await supabase.from("notifications").insert({
      user_id: apiKeyData.user_id,
      type: "lead",
      title: "Nouvelle demande de devis",
      message: `${body.name} a soumis une demande via votre widget`,
      data: { lead_id: lead.id },
    });

    // Décrémenter le rate limit
    await supabase
      .from("api_keys")
      .update({ rate_limit_remaining: apiKeyData.rate_limit_remaining - 1 })
      .eq("key_hash", apiKey);

    // Log
    await supabase.from("audit_logs").insert({
      user_id: apiKeyData.user_id,
      action: "widget_quote_request",
      resource_type: "lead",
      resource_id: lead.id,
      details: { source: body.company },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Demande enregistrée avec succès",
        lead_id: lead.id,
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Widget quote request error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500, headers: corsHeaders }
    );
  }
}
