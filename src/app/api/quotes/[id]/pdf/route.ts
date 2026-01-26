/**
 * PDF Download Redirect Endpoint
 * GET /api/quotes/[id]/pdf
 * Redirects to client-side PDF generation (more reliable)
 *
 * Note: Server-side PDF generation with @react-pdf/renderer has
 * compatibility issues. The client-side approach is more stable.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const quoteId = params.id;

    // Verify quote exists and belongs to user
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("id, quote_number")
      .eq("id", quoteId)
      .eq("user_id", user.id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: "Devis non trouvé" },
        { status: 404 }
      );
    }

    // Redirect to client-side quote page with download flag
    const template = request.nextUrl.searchParams.get("template") || "classic-pro";
    const redirectUrl = new URL(`/quotes/${quoteId}`, request.url);
    redirectUrl.searchParams.set("download", "true");
    redirectUrl.searchParams.set("template", template);

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("PDF route error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'accès au PDF" },
      { status: 500 }
    );
  }
}
