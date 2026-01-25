// Legal Risk Engine - Type Definitions
// Détection silencieuse des termes engageants et risques juridiques

import type { LocaleCode } from '../locale-packs/types';

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type RiskCategory =
  | 'binding_commitment'    // Engagement ferme
  | 'price_guarantee'       // Garantie de prix
  | 'timeline_guarantee'    // Garantie de délai
  | 'warranty'              // Garantie/Responsabilité
  | 'penalty_clause'        // Clause pénale
  | 'liability'             // Responsabilité
  | 'cancellation'          // Annulation
  | 'intellectual_property' // Propriété intellectuelle
  | 'confidentiality'       // Confidentialité
  | 'payment_terms'         // Conditions de paiement
  | 'scope_creep'           // Dérapage de périmètre
  | 'ambiguity'             // Ambiguïté
  | 'missing_info';         // Information manquante

export interface RiskPattern {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  patterns: RegExp[];
  description: string;
  explanation: string;
  suggestion?: string;
  locales?: LocaleCode[]; // Si vide, applicable à toutes les locales
}

export interface DetectedRisk {
  id: string;
  riskId: string;
  category: RiskCategory;
  severity: RiskSeverity;
  text: string;          // Le texte problématique
  context: string;       // Le contexte autour du texte
  position: {
    field: string;       // Champ où le risque a été détecté
    start: number;
    end: number;
  };
  description: string;
  explanation: string;
  suggestion?: string;
  autoFix?: {
    type: 'replace' | 'append' | 'remove' | 'add_mention';
    value: string;
  };
}

export interface RiskAnalysisResult {
  hasRisks: boolean;
  totalRisks: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  risks: DetectedRisk[];
  score: number;         // Score de risque global 0-100
  recommendations: string[];
  autoFixAvailable: boolean;
}

export interface LegalMention {
  id: string;
  category: RiskCategory;
  locale: LocaleCode;
  text: string;
  mandatory: boolean;
  condition?: (data: any) => boolean;
}

// Niveau de sensibilité du moteur
export type RiskSensitivity = 'strict' | 'normal' | 'permissive';

// Configuration du moteur
export interface RiskEngineConfig {
  locale: LocaleCode;
  sensitivity: RiskSensitivity; // Niveau de sensibilité (strict/normal/permissive)
  enableAutoFix: boolean;       // Proposer des corrections auto
  fieldsToAnalyze: string[];    // Champs à analyser
  excludePatterns?: string[];   // Patterns à ignorer
}

// Mapping sensibilité -> sévérités à afficher
export const SENSITIVITY_FILTERS: Record<RiskSensitivity, RiskSeverity[]> = {
  strict: ['critical', 'high', 'medium', 'low', 'info'],
  normal: ['critical', 'high', 'medium'],
  permissive: ['critical'],
};

export const DEFAULT_CONFIG: RiskEngineConfig = {
  locale: 'fr-BE',
  sensitivity: 'normal',
  enableAutoFix: true,
  fieldsToAnalyze: [
    'notes',
    'description',
    'client_address',
    'title',
  ],
};
