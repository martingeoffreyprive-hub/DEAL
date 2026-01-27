/**
 * Human-in-the-Loop API
 * Gestion des demandes de contrôle humain
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getPendingHITLRequests,
  approveHITLRequest,
  rejectHITLRequest,
  HITL_CONFIG,
} from "@/lib/rgpd/human-in-the-loop";

export const dynamic = "force-dynamic";

// GET - Récupérer les demandes en attente
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const requests = await getPendingHITLRequests(user.id);

    // Enrichir avec la configuration
    const enrichedRequests = requests.map(req => ({
      ...req,
      config: HITL_CONFIG[req.action as keyof typeof HITL_CONFIG],
    }));

    return NextResponse.json({ requests: enrichedRequests });
  } catch (error: any) {
    console.error("HITL GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes" },
      { status: 500 }
    );
  }
}

// POST - Approuver ou rejeter une demande
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, action, reason } = body;

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "requestId et action sont requis" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action invalide (approve ou reject)" },
        { status: 400 }
      );
    }

    // Vérifier que la demande appartient à l'utilisateur
    const { data: hitlRequest } = await supabase
      .from("hitl_requests")
      .select("user_id, action, status")
      .eq("id", requestId)
      .single();

    if (!hitlRequest || hitlRequest.user_id !== user.id) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    if (hitlRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Cette demande a déjà été traitée" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      await approveHITLRequest(requestId, user.id, reason);
    } else {
      if (!reason) {
        return NextResponse.json(
          { error: "Une raison est requise pour rejeter" },
          { status: 400 }
        );
      }
      await rejectHITLRequest(requestId, user.id, reason);
    }

    // Log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: `hitl_${action}ed`,
      resource_type: "hitl_request",
      resource_id: requestId,
      details: { reason },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("HITL POST error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors du traitement" },
      { status: 500 }
    );
  }
}
