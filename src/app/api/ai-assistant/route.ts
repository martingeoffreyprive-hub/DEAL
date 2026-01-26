export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitedResponse, addRateLimitHeaders } from "@/lib/rate-limit";
import { logQuoteAction } from "@/lib/audit";
import { withAICache, isCachingEnabled } from "@/lib/ai/cache";
import { Quote, QuoteItem, SectorType, getSectorConfig, SECTORS } from "@/types/database";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AssistantRequest {
  action: string;
  quoteId: string;
  quote?: Quote;
  items?: QuoteItem[];
}

// Get sector context for AI prompts
function getSectorContext(sector: SectorType): string {
  const config = getSectorConfig(sector);
  const sectorLabel = SECTORS[sector];
  return `
**CONTEXTE MÉTIER:**
Tu es un expert du secteur "${sectorLabel}".
Contexte: ${config.aiContext}
Catégories de matériaux typiques: ${config.materialCategories.join(", ")}
Services courants: ${config.commonServices.join(", ")}
Unités de mesure habituelles: ${config.units.join(", ")}
`;
}

// Prompts for each action - now sector-aware
const ACTION_PROMPTS: Record<string, (quote: Quote, items: QuoteItem[]) => string> = {
  audit: (quote, items) => {
    const sectorContext = getSectorContext(quote.sector as SectorType);
    return `
${sectorContext}

Tu es un expert en analyse de devis et tarification pour ce secteur spécifique.

Analyse ce devis et fournis un audit détaillé :

**Client:** ${quote.client_name}
**Secteur:** ${SECTORS[quote.sector as SectorType]}
**Total:** ${quote.total}€ TTC

**Prestations:**
${items.map((item, i) => `${i + 1}. ${item.description} - ${item.quantity} ${item.unit} × ${item.unit_price}€ = ${item.quantity * item.unit_price}€`).join("\n")}

Analyse en tenant compte des spécificités du métier:
1. La cohérence des prix par rapport au marché belge pour ce secteur
2. Les éventuelles anomalies ou erreurs (tarifs trop bas/hauts pour ce métier)
3. Les points d'attention spécifiques à ce type de travaux
4. Les suggestions d'amélioration adaptées au secteur

Utilise le vocabulaire technique approprié à ce métier. Réponds en français de manière structurée.
`;
  },

  optimize: (quote, items) => {
    const sectorContext = getSectorContext(quote.sector as SectorType);
    return `
${sectorContext}

Tu es un expert en tarification et stratégie commerciale pour ce secteur.

Analyse ce devis et suggère des optimisations de prix basées sur les pratiques du marché belge :

**Secteur:** ${SECTORS[quote.sector as SectorType]}
**Prestations:**
${items.map((item, i) => `${i + 1}. ${item.description} - PU: ${item.unit_price}€/${item.unit}`).join("\n")}

Pour chaque prestation, en tenant compte des tarifs habituels de ce métier:
1. Prix minimum (marge faible, pour rester compétitif)
2. Prix recommandé (marge normale pour ce secteur)
3. Prix premium (haute qualité, garanties étendues)

Justifie tes recommandations en te basant sur les pratiques du secteur. Réponds en français.
`;
  },

  email: (quote, items) => {
    const config = getSectorConfig(quote.sector as SectorType);
    return `
Tu es un assistant commercial pour un professionnel du secteur "${SECTORS[quote.sector as SectorType]}".

Rédige un email professionnel adapté à ce métier pour envoyer ce devis :

**Client:** ${quote.client_name}
**Numéro devis:** ${quote.quote_number}
**Secteur:** ${SECTORS[quote.sector as SectorType]}
**Montant:** ${quote.total}€ TTC

**Prestations:**
${items.map((item, i) => `- ${item.description}`).join("\n")}

L'email doit être:
- Adapté au ton et vocabulaire du secteur (${config.aiContext})
- Professionnel mais chaleureux
- Concis et clair
- Mentionner les garanties et certifications si pertinent
- Inciter à l'action
- Mentionner la validité du devis

Réponds uniquement avec l'email, prêt à être copié.
`;
  },

  materials: (quote, items) => {
    const config = getSectorConfig(quote.sector as SectorType);
    return `
Tu es un expert en estimation de matériaux pour le secteur "${SECTORS[quote.sector as SectorType]}".
Contexte: ${config.aiContext}

Génère une liste de matériaux/fournitures nécessaires pour ces prestations :

${items.map((item, i) => `${i + 1}. ${item.description} (Qté: ${item.quantity} ${item.unit})`).join("\n")}

Catégories de matériaux typiques pour ce secteur: ${config.materialCategories.join(", ")}

Pour chaque matériau/fourniture, indique:
- Nom du matériau (avec marques si pertinent)
- Catégorie parmi: ${config.materialCategories.join(", ")}
- Quantité estimée
- Unité (parmi: ${config.units.join(", ")})
- Prix unitaire estimé en Belgique (€)

Présente sous forme de tableau. Sois précis et réaliste pour ce métier. Réponds en français.
`;
  },

  planning: (quote, items) => {
    const config = getSectorConfig(quote.sector as SectorType);
    return `
Tu es un expert en planification et estimation de main d'oeuvre pour le secteur "${SECTORS[quote.sector as SectorType]}".
Contexte: ${config.aiContext}

Estime le temps de travail nécessaire pour ces prestations :

${items.map((item, i) => `${i + 1}. ${item.description} (Qté: ${item.quantity} ${item.unit})`).join("\n")}

Pour chaque tâche principale, en tenant compte des réalités du métier:
- Description de la tâche
- Nombre d'heures estimées (réaliste pour ce secteur)
- Nombre de personnes nécessaires
- Taux horaire conseillé en Belgique (€/h) - typique pour ce métier
- Compétences/qualifications requises (spécifiques au secteur)

Réponds en français avec un planning structuré et réaliste.
`;
  },

  improve: (quote, items) => {
    const config = getSectorConfig(quote.sector as SectorType);
    return `
Tu es un rédacteur technique spécialisé dans le secteur "${SECTORS[quote.sector as SectorType]}".
Contexte: ${config.aiContext}

Améliore ces descriptions de prestations pour les rendre plus professionnelles et adaptées au secteur :

${items.map((item, i) => `${i + 1}. "${item.description}"`).join("\n")}

Services courants dans ce secteur: ${config.commonServices.join(", ")}

Pour chaque description:
1. Version améliorée (vocabulaire technique du métier, plus professionnelle)
2. Points clés à mettre en avant (garanties, normes, certifications spécifiques au secteur)

Les descriptions doivent être:
- Précises avec le vocabulaire technique du métier
- Professionnelles et rassurantes
- Mentionner les normes/certifications si pertinent (ex: RGIE pour électricité, PEB pour rénovation, etc.)

Réponds en français.
`;
  },

  suggest: (quote, items) => {
    const config = getSectorConfig(quote.sector as SectorType);
    return `
Tu es un expert du secteur "${SECTORS[quote.sector as SectorType]}".
Contexte: ${config.aiContext}

En te basant sur les prestations déjà présentes dans ce devis:
${items.map((item, i) => `${i + 1}. ${item.description}`).join("\n")}

Suggère des prestations complémentaires ou options que le client pourrait apprécier.

Services courants dans ce secteur: ${config.commonServices.join(", ")}

Pour chaque suggestion:
- Nom de la prestation
- Description courte
- Fourchette de prix typique en Belgique
- Pourquoi c'est pertinent (valeur ajoutée)

Limite-toi à 5 suggestions maximum, les plus pertinentes. Réponds en français.
`;
  },
};

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Check rate limit (5 requests per minute for AI)
    const rateLimitResult = await checkRateLimit(user.id, "ai");
    if (!rateLimitResult.success) {
      return rateLimitedResponse(
        rateLimitResult,
        "Limite de requêtes IA atteinte. Veuillez réessayer dans une minute."
      );
    }

    const body: AssistantRequest = await req.json();
    const { action, quoteId, quote: clientQuote, items: clientItems } = body;

    if (!action || !quoteId) {
      return NextResponse.json(
        { error: "Action et ID du devis requis" },
        { status: 400 }
      );
    }

    // 3. Verify quote ownership - fetch from database
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .eq("user_id", user.id) // Critical: verify ownership
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: "Devis non trouvé ou accès non autorisé" },
        { status: 403 }
      );
    }

    // 4. Fetch quote items from database
    const { data: items, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quoteId)
      .order("order_index");

    if (itemsError) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des éléments du devis" },
        { status: 500 }
      );
    }

    const promptGenerator = ACTION_PROMPTS[action];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: "Action non reconnue" },
        { status: 400 }
      );
    }

    const prompt = promptGenerator(quote as Quote, (items || []) as QuoteItem[]);

    // 5. Use AI cache to reduce costs and improve response time
    const cacheParams = {
      quoteId,
      sector: quote.sector,
      itemCount: items?.length || 0,
      total: quote.total,
    };

    const { result, cached } = await withAICache(
      action,
      prompt,
      cacheParams,
      async () => {
        const message = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const textContent = message.content.find((block) => block.type === "text");
        return textContent ? textContent.text : "";
      }
    );

    // 6. Log AI usage for analytics (only if not cached)
    if (!cached) {
      try {
        await supabase.rpc("increment_ai_usage", { p_user_id: user.id });
      } catch {
        // Non-blocking: don't fail if usage tracking fails
        console.warn("Failed to increment AI usage stats");
      }
    }

    // Log audit trail
    await logQuoteAction(user.id, "API_CALL", quoteId, {
      action,
      sector: quote.sector,
      itemCount: items?.length || 0,
      cached,
    }, req);

    // 7. Return response with rate limit headers and cache info
    const response = NextResponse.json({
      result,
      cached,
      cacheEnabled: isCachingEnabled(),
    });
    return addRateLimitHeaders(response, rateLimitResult);
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'exécution de l'IA" },
      { status: 500 }
    );
  }
}
