/**
 * Peppol Export API
 * Export de factures au format Peppol BIS 3.0
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exportToPeppolXML } from "@/lib/invoices/invoice-generator";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le plan (Peppol = Pro+)
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    const hasPeppol = ["pro", "business", "enterprise"].includes(
      subscription?.plan_id || ""
    );

    if (!hasPeppol) {
      return NextResponse.json(
        { error: "L'export Peppol n'est pas disponible avec votre plan" },
        { status: 403 }
      );
    }

    // Récupérer la facture
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        items:invoice_items(*)
      `)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: "Facture non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les infos entreprise
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Générer le XML Peppol
    const xml = exportToPeppolXML(invoice, company);

    // Retourner le XML
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoice_number}.xml"`,
      },
    });
  } catch (error: any) {
    console.error("Peppol export error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export Peppol" },
      { status: 500 }
    );
  }
}
