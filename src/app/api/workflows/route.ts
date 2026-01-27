/**
 * Workflows API
 * CRUD pour les workflows automatisés
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWorkflow, getUserWorkflows, WORKFLOW_TEMPLATES } from "@/lib/workflow/workflow-engine";

export const dynamic = "force-dynamic";

// GET - Liste des workflows
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const workflows = await getUserWorkflows(user.id);

    return NextResponse.json({
      workflows,
      templates: WORKFLOW_TEMPLATES,
    });
  } catch (error: any) {
    console.error("Workflows GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des workflows" },
      { status: 500 }
    );
  }
}

// POST - Créer un workflow
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le plan de l'utilisateur
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Vérifier le nombre de workflows existants
    const { count } = await supabase
      .from("workflows")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const maxWorkflows = subscription?.plan_id === "business" ? Infinity :
                         subscription?.plan_id === "pro" ? Infinity :
                         subscription?.plan_id === "starter" ? 1 :
                         0;

    if (count && count >= maxWorkflows) {
      return NextResponse.json(
        { error: "Limite de workflows atteinte pour votre plan" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const workflow = await createWorkflow(user.id, {
      name: body.name,
      description: body.description,
      enabled: body.enabled ?? true,
      trigger: body.trigger,
      steps: body.steps,
      human_review: body.human_review ?? {
        enabled: true,
        required_for: ["create_quote", "send_email"],
      },
    });

    // Log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "workflow_created",
      resource_type: "workflow",
      resource_id: workflow.id,
    });

    return NextResponse.json({ workflow });
  } catch (error: any) {
    console.error("Workflows POST error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du workflow" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour un workflow
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const { error } = await supabase
      .from("workflows")
      .update({
        name: updates.name,
        description: updates.description,
        enabled: updates.enabled,
        trigger_type: updates.trigger?.type,
        trigger_config: updates.trigger?.config,
        steps: updates.steps,
        human_review: updates.human_review,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Workflows PATCH error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du workflow" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un workflow
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const { error } = await supabase
      .from("workflows")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Workflows DELETE error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du workflow" },
      { status: 500 }
    );
  }
}
