// Legal Risk Patterns
// Patterns de détection des risques juridiques

import type { RiskPattern, LegalMention } from './types';
import type { LocaleCode } from '../locale-packs/types';

// Patterns de risque universels (toutes locales)
export const RISK_PATTERNS: RiskPattern[] = [
  // === ENGAGEMENTS FERMES ===
  {
    id: 'binding_guarantee',
    category: 'binding_commitment',
    severity: 'critical',
    patterns: [
      /\bgaranti[es]?\s+(à\s+100%|totale?ment|absolument|sans\s+réserve)/gi,
      /\bje\s+m'engage\s+(fermement|définitivement|irrévocablement)/gi,
      /\bengagement\s+(ferme|définitif|irrévocable)/gi,
    ],
    description: 'Engagement ferme détecté',
    explanation: 'Cette formulation constitue un engagement contractuel fort qui peut être difficile à honorer dans tous les cas.',
    suggestion: 'Préférez "sous réserve des conditions habituelles" ou "dans la mesure du possible".',
  },
  {
    id: 'absolute_promise',
    category: 'binding_commitment',
    severity: 'high',
    patterns: [
      /\bje\s+vous\s+promets/gi,
      /\bpromesse\s+de\s+résultat/gi,
      /\brésultat\s+garanti/gi,
      /\bsatisfaction\s+garantie\s+ou\s+remboursé/gi,
    ],
    description: 'Promesse absolue détectée',
    explanation: 'Les promesses de résultat engagent votre responsabilité de manière importante.',
    suggestion: 'Reformulez en "nous nous efforcerons de" ou "notre objectif est de".',
  },

  // === GARANTIES DE PRIX ===
  {
    id: 'fixed_price_guarantee',
    category: 'price_guarantee',
    severity: 'high',
    patterns: [
      /\bprix\s+(fixe|ferme|définitif|garanti|bloqué)/gi,
      /\baucune\s+modification\s+de\s+prix/gi,
      /\bprix\s+non\s+(révisable|modifiable)/gi,
    ],
    description: 'Garantie de prix fixe',
    explanation: 'Un prix fixe garanti vous empêche de répercuter les hausses de coûts imprévues.',
    suggestion: 'Ajoutez "hors variations exceptionnelles des matières premières" ou prévoyez une clause de révision.',
  },
  {
    id: 'best_price_guarantee',
    category: 'price_guarantee',
    severity: 'medium',
    patterns: [
      /\bmeilleur\s+prix(\s+garanti)?/gi,
      /\bprix\s+(imbattable|le\s+plus\s+bas)/gi,
      /\bon\s+s'aligne\s+sur\s+la\s+concurrence/gi,
    ],
    description: 'Garantie de meilleur prix',
    explanation: 'Cette mention peut être considérée comme une pratique commerciale engageante.',
  },

  // === GARANTIES DE DÉLAIS ===
  {
    id: 'deadline_guarantee',
    category: 'timeline_guarantee',
    severity: 'high',
    patterns: [
      /\bdélai\s+(garanti|ferme|impératif)/gi,
      /\blivraison\s+garantie\s+(le|avant)/gi,
      /\bterminé\s+(au\s+plus\s+tard|obligatoirement)\s+le/gi,
      /\brespect\s+absolu\s+des\s+délais/gi,
    ],
    description: 'Garantie de délai ferme',
    explanation: 'Les délais garantis peuvent entraîner des pénalités si non respectés.',
    suggestion: 'Utilisez "délai indicatif" ou "sous réserve de conditions météo/approvisionnement".',
  },
  {
    id: 'express_delivery',
    category: 'timeline_guarantee',
    severity: 'medium',
    patterns: [
      /\blivrais?on\s+express/gi,
      /\b(24|48|72)\s*h(eures)?\s+chrono/gi,
      /\bintervention\s+immédiate/gi,
    ],
    description: 'Engagement de rapidité',
    explanation: 'Les engagements de délais courts peuvent être difficiles à tenir.',
    suggestion: 'Précisez les conditions (jours ouvrés, disponibilité, etc.).',
  },

  // === CLAUSES PÉNALES ===
  {
    id: 'penalty_clause',
    category: 'penalty_clause',
    severity: 'critical',
    patterns: [
      /\bpénalité\s+de\s+\d+/gi,
      /\bpénalités?\s+de\s+retard/gi,
      /\bastreinte\s+de\s+\d+/gi,
      /\b\d+\s*[€%]\s*(par\s+jour|\/jour)\s+de\s+retard/gi,
    ],
    description: 'Clause pénale détectée',
    explanation: 'Les clauses pénales créent des engagements financiers en cas de non-respect.',
    suggestion: 'Assurez-vous que ces pénalités sont réciproques ou négociez-les.',
  },

  // === RESPONSABILITÉ ===
  {
    id: 'unlimited_liability',
    category: 'liability',
    severity: 'critical',
    patterns: [
      /\bresponsabilité\s+(totale|illimitée|entière)/gi,
      /\bje\s+(prends|assume)\s+toute\s+(la\s+)?responsabilité/gi,
      /\baucune\s+limite\s+de\s+responsabilité/gi,
    ],
    description: 'Responsabilité non plafonnée',
    explanation: 'Engager une responsabilité illimitée est très risqué juridiquement.',
    suggestion: 'Limitez votre responsabilité au montant du devis ou à vos garanties d\'assurance.',
  },
  {
    id: 'result_obligation',
    category: 'liability',
    severity: 'high',
    patterns: [
      /\bobligation\s+de\s+résultat/gi,
      /\bnous\s+garantissons\s+le\s+résultat/gi,
    ],
    description: 'Obligation de résultat',
    explanation: 'L\'obligation de résultat est plus contraignante que l\'obligation de moyens.',
    suggestion: 'Préférez "obligation de moyens" avec une description claire des efforts fournis.',
  },

  // === ANNULATION ===
  {
    id: 'no_cancellation',
    category: 'cancellation',
    severity: 'medium',
    patterns: [
      /\baucune\s+annulation\s+possible/gi,
      /\bcommande\s+(ferme|non\s+annulable)/gi,
      /\bsans\s+possibilité\s+d'annulation/gi,
    ],
    description: 'Clause d\'annulation restrictive',
    explanation: 'L\'impossibilité d\'annuler peut poser problème avec les droits des consommateurs.',
    suggestion: 'Prévoyez des conditions d\'annulation avec préavis raisonnable.',
  },

  // === PÉRIMÈTRE / SCOPE CREEP ===
  {
    id: 'vague_scope',
    category: 'scope_creep',
    severity: 'medium',
    patterns: [
      /\bet\s+autres\s+travaux/gi,
      /\btous\s+travaux\s+nécessaires/gi,
      /\by\s+compris\s+ce\s+qui\s+sera\s+nécessaire/gi,
      /\bainsi\s+que\s+tout\s+ce\s+qui/gi,
    ],
    description: 'Périmètre flou détecté',
    explanation: 'Les formulations vagues peuvent mener à des demandes additionnelles non chiffrées.',
    suggestion: 'Soyez précis dans la description des prestations incluses.',
  },
  {
    id: 'all_inclusive',
    category: 'scope_creep',
    severity: 'high',
    patterns: [
      /\btout\s+compris/gi,
      /\bclé\s+en\s+main\s+complet/gi,
      /\baucun\s+supplément/gi,
      /\bsans\s+frais\s+supplémentaires/gi,
    ],
    description: 'Engagement "tout compris"',
    explanation: 'Le "tout compris" peut inclure des imprévus coûteux.',
    suggestion: 'Listez explicitement ce qui est inclus et ce qui ne l\'est pas.',
  },

  // === AMBIGUÏTÉS ===
  {
    id: 'ambiguous_quantity',
    category: 'ambiguity',
    severity: 'medium',
    patterns: [
      /\benviron\s+\d+/gi,
      /\bà\s+peu\s+près\s+\d+/gi,
      /\bplus\s+ou\s+moins\s+\d+/gi,
      /\bquelques/gi,
      /\bcertains/gi,
    ],
    description: 'Quantité imprécise',
    explanation: 'Les quantités approximatives peuvent créer des litiges.',
    suggestion: 'Indiquez des quantités précises ou une fourchette claire.',
  },
  {
    id: 'ambiguous_timeline',
    category: 'ambiguity',
    severity: 'low',
    patterns: [
      /\bdans\s+les\s+meilleurs\s+délais/gi,
      /\brapidement/gi,
      /\bdès\s+que\s+possible/gi,
      /\bprochainement/gi,
    ],
    description: 'Délai imprécis',
    explanation: 'Les délais vagues peuvent créer des attentes irréalistes.',
    suggestion: 'Indiquez une date ou une fourchette de dates précise.',
  },

  // === CONDITIONS DE PAIEMENT ===
  {
    id: 'payment_on_completion',
    category: 'payment_terms',
    severity: 'info',
    patterns: [
      /\bpaiement\s+à\s+la\s+livraison/gi,
      /\bsolde\s+à\s+réception/gi,
    ],
    description: 'Paiement à la livraison',
    explanation: 'Information sur les conditions de paiement détectée.',
  },
  {
    id: 'full_prepayment',
    category: 'payment_terms',
    severity: 'medium',
    patterns: [
      /\bpaiement\s+(intégral\s+)?à\s+la\s+commande/gi,
      /\b100\s*%\s*(d')?acompte/gi,
      /\bpaiement\s+total\s+avant/gi,
    ],
    description: 'Paiement intégral anticipé',
    explanation: 'Demander 100% à la commande peut être perçu négativement par les clients.',
    suggestion: 'Proposez un échéancier (ex: 30% à la commande, solde à la livraison).',
  },
];

// Mentions légales auto-injectées selon la locale
export const AUTO_LEGAL_MENTIONS: LegalMention[] = [
  // Belgique
  {
    id: 'be_vat_renovation',
    category: 'binding_commitment',
    locale: 'fr-BE',
    text: 'Taux de TVA de 6% applicable sous réserve que le logement ait plus de 10 ans et soit utilisé principalement comme habitation privée. Une attestation sera à signer par le client.',
    mandatory: true,
    condition: (data) => data.tax_rate === 6 && data.sector === 'RENOVATION',
  },
  {
    id: 'be_consumer_withdrawal',
    category: 'cancellation',
    locale: 'fr-BE',
    text: 'Conformément au Code de droit économique, le consommateur dispose d\'un délai de 14 jours pour exercer son droit de rétractation pour tout contrat conclu à distance ou hors établissement.',
    mandatory: true,
    condition: (data) => data.is_consumer && data.is_remote_contract,
  },

  // France
  {
    id: 'fr_decennale',
    category: 'warranty',
    locale: 'fr-FR',
    text: 'Entreprise titulaire d\'une garantie décennale souscrite auprès de {insurance_company}.',
    mandatory: true,
    condition: (data) => ['CONSTRUCTION', 'RENOVATION', 'TOITURE', 'ELECTRICITE', 'PLOMBERIE'].includes(data.sector),
  },
  {
    id: 'fr_auto_entrepreneur',
    category: 'binding_commitment',
    locale: 'fr-FR',
    text: 'TVA non applicable, art. 293 B du Code général des impôts.',
    mandatory: true,
    condition: (data) => data.is_auto_entrepreneur && data.tax_rate === 0,
  },

  // Suisse
  {
    id: 'ch_vat_small_business',
    category: 'binding_commitment',
    locale: 'fr-CH',
    text: 'Entreprise non assujettie à la TVA (chiffre d\'affaires inférieur à CHF 100\'000).',
    mandatory: true,
    condition: (data) => data.annual_revenue < 100000 && !data.vat_number,
  },
];

/**
 * Récupère les patterns applicables à une locale
 */
export function getPatternsForLocale(locale: LocaleCode): RiskPattern[] {
  return RISK_PATTERNS.filter(
    (p) => !p.locales || p.locales.length === 0 || p.locales.includes(locale)
  );
}

/**
 * Récupère les mentions légales obligatoires pour une locale et des données
 */
export function getMandatoryMentions(
  locale: LocaleCode,
  data: any
): LegalMention[] {
  return AUTO_LEGAL_MENTIONS.filter(
    (m) =>
      m.locale === locale &&
      m.mandatory &&
      (!m.condition || m.condition(data))
  );
}
