/**
 * Invoices API
 * Conversion devis → factures, gestion des factures
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  convertQuoteToInvoice,
  generateBalanceInvoice,
  markInvoiceAsPaid,
  exportToPeppolXML,
} from "@/lib/invoices/invoice-generator";

export const dynamic = "force-dynamic";

// GET - Liste des factures
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const quoteId = searchParams.get("quote_id");

    let query = supabase
      .from("invoices")
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (quoteId) {
      query = query.eq("quote_id", quoteId);
    }

    const { data: invoices, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Invoices GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des factures" },
      { status: 500 }
    );
  }
}

// POST - Créer une facture (depuis un devis)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le plan
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    const hasBilling = ["starter", "pro", "business", "enterprise"].includes(
      subscription?.plan_id || ""
    );

    if (!hasBilling) {
      return NextResponse.json(
        { error: "La facturation n'est pas disponible avec votre plan" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { quoteId, type, depositPercentage, dueInDays } = body;

    if (!quoteId) {
      return NextResponse.json(
        { error: "quoteId est requis" },
        { status: 400 }
      );
    }

    // Vérifier que le devis appartient à l'utilisateur
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("user_id")
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote || quote.user_id !== user.id) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    let invoice;

    if (type === "balance") {
      invoice = await generateBalanceInvoice(quoteId, dueInDays);
    } else {
      invoice = await convertQuoteToInvoice(quoteId, {
        type: type || "standard",
        depositPercentage: depositPercentage || 30,
        dueInDays: dueInDays || 30,
      });
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error("Invoices POST error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de la facture" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une facture
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, amount } = body;

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Vérifier que la facture appartient à l'utilisateur
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("user_id, status")
      .eq("id", id)
      .single();

    if (invoiceError || !invoice || invoice.user_id !== user.id) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    if (action === "mark_paid") {
      await markInvoiceAsPaid(id, amount);
      return NextResponse.json({ success: true });
    }

    if (action === "send") {
      await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", id);
      return NextResponse.json({ success: true });
    }

    if (action === "cancel") {
      await supabase
        .from("invoices")
        .update({ status: "cancelled" })
        .eq("id", id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  } catch (error: any) {
    console.error("Invoices PATCH error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
