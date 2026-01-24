import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { type SectorType, getSectorConfig, SECTORS } from "@/types/database";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate sector-specific prompt dynamically
function getSectorPrompt(sector: SectorType): string {
  const config = getSectorConfig(sector);
  const sectorLabel = SECTORS[sector];

  return `Tu es un expert en devis pour le secteur "${sectorLabel}".
Contexte métier: ${config.aiContext}
Vocabulaire et services courants: ${config.commonServices.join(", ")}
Catégories de matériaux/fournitures: ${config.materialCategories.join(", ")}
Unités de mesure courantes: ${config.units.join(", ")}
Estime des prix réalistes pour le marché belge.`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { transcription, sector } = body;

    if (!transcription || typeof transcription !== "string") {
      return NextResponse.json(
        { message: "Transcription requise" },
        { status: 400 }
      );
    }

    // Get user profile for default sector
    const { data: profile } = await supabase
      .from("profiles")
      .select("default_sector")
      .eq("id", user.id)
      .single();

    const defaultSector = profile?.default_sector || "AUTRE";
    const sectorToUse = (sector || defaultSector) as SectorType;
    const sectorPrompt = getSectorPrompt(sectorToUse);
    const sectorConfig = getSectorConfig(sectorToUse);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `${sectorPrompt}

Analyse cette transcription d'un échange commercial et génère un devis structuré.

TRANSCRIPTION :
"""
${transcription}
"""

IMPORTANT : Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte (sans markdown, sans explication) :

{
  "sector": "${sectorToUse}",
  "client": {
    "name": "Nom du client extrait ou 'Client'",
    "email": "email si mentionné ou null",
    "address": "adresse si mentionnée ou null",
    "phone": "téléphone si mentionné ou null",
    "city": "ville si mentionnée ou null",
    "postalCode": "code postal si mentionné ou null"
  },
  "items": [
    {
      "description": "Description professionnelle et détaillée de la prestation",
      "quantity": 1,
      "unit": "une des unités: ${sectorConfig.units.join(", ")}",
      "unitPrice": 100.00
    }
  ],
  "notes": "Remarques ou conditions particulières extraites de la conversation"
}

Règles :
- Extrais les informations client si mentionnées (nom, adresse, ville, code postal, téléphone, email)
- Crée des lignes de prestation détaillées et professionnelles
- Utilise le vocabulaire technique du secteur "${SECTORS[sectorToUse]}"
- Utilise UNIQUEMENT ces unités: ${sectorConfig.units.join(", ")}
- Estime des prix réalistes pour le marché BELGE (en euros)
- Ajoute des notes si des conditions particulières sont mentionnées`,
        },
      ],
    });

    // Extract text content
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Réponse invalide de l'IA");
    }

    // Parse JSON response
    let generatedQuote;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Pas de JSON trouvé dans la réponse");
      }
      generatedQuote = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      console.error("Raw response:", textContent.text);
      throw new Error("Impossible de parser la réponse de l'IA");
    }

    // Validate and sanitize response
    const validatedQuote = {
      sector: generatedQuote.sector || sectorToUse,
      client: {
        name: generatedQuote.client?.name || "Client",
        email: generatedQuote.client?.email || null,
        address: generatedQuote.client?.address || null,
        phone: generatedQuote.client?.phone || null,
        city: generatedQuote.client?.city || null,
        postalCode: generatedQuote.client?.postalCode || null,
      },
      items: Array.isArray(generatedQuote.items)
        ? generatedQuote.items.map((item: any) => ({
            description: item.description || "Prestation",
            quantity: Number(item.quantity) || 1,
            unit: item.unit || sectorConfig.units[0] || "unité",
            unitPrice: Number(item.unitPrice) || 0,
          }))
        : [],
      notes: generatedQuote.notes || null,
    };

    return NextResponse.json(validatedQuote);
  } catch (error) {
    console.error("Error generating quote:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Erreur lors de la génération du devis";

    return NextResponse.json({ message }, { status: 500 });
  }
}
