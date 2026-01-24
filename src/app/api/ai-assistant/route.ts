import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Quote, QuoteItem, SectorType, getSectorConfig, SECTORS } from "@/types/database";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AssistantRequest {
  action: string;
  quote: Quote;
  items: QuoteItem[];
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
    const body: AssistantRequest = await req.json();
    const { action, quote, items } = body;

    if (!action || !quote) {
      return NextResponse.json(
        { error: "Action et devis requis" },
        { status: 400 }
      );
    }

    const promptGenerator = ACTION_PROMPTS[action];
    if (!promptGenerator) {
      return NextResponse.json(
        { error: "Action non reconnue" },
        { status: 400 }
      );
    }

    const prompt = promptGenerator(quote, items);

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
    const result = textContent ? textContent.text : "";

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'exécution de l'IA" },
      { status: 500 }
    );
  }
}
