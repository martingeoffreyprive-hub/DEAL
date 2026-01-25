// Legal Risk Detection Engine
// Moteur de détection silencieuse des risques juridiques

import type {
  RiskEngineConfig,
  DetectedRisk,
  RiskAnalysisResult,
  RiskSeverity,
  RiskSensitivity,
} from './types';
import { SENSITIVITY_FILTERS } from './types';
import { getPatternsForLocale, getMandatoryMentions } from './patterns';
import type { LocaleCode } from '../locale-packs/types';

// Poids des sévérités pour le calcul du score
const SEVERITY_WEIGHTS: Record<RiskSeverity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  info: 0,
};

/**
 * Moteur de détection des risques juridiques
 */
export class LegalRiskEngine {
  private config: RiskEngineConfig;

  constructor(config: Partial<RiskEngineConfig> = {}) {
    this.config = {
      locale: 'fr-BE',
      sensitivity: 'normal',
      enableAutoFix: true,
      fieldsToAnalyze: ['notes', 'description', 'title'],
      ...config,
    };
  }

  /**
   * Analyse un texte pour détecter les risques
   */
  analyzeText(text: string, field: string = 'unknown'): DetectedRisk[] {
    const risks: DetectedRisk[] = [];
    const patterns = getPatternsForLocale(this.config.locale);

    for (const pattern of patterns) {
      for (const regex of pattern.patterns) {
        // Reset du regex pour chaque texte
        regex.lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
          // Vérifier si ce n'est pas un faux positif
          if (this.config.excludePatterns?.some((p) => match![0].includes(p))) {
            continue;
          }

          // Extraire le contexte (50 caractères avant et après)
          const start = Math.max(0, match.index - 50);
          const end = Math.min(text.length, match.index + match[0].length + 50);
          const context = text.slice(start, end);

          risks.push({
            id: `${pattern.id}-${match.index}`,
            riskId: pattern.id,
            category: pattern.category,
            severity: pattern.severity,
            text: match[0],
            context: context,
            position: {
              field,
              start: match.index,
              end: match.index + match[0].length,
            },
            description: pattern.description,
            explanation: pattern.explanation,
            suggestion: pattern.suggestion,
            autoFix: this.generateAutoFix(pattern, match[0]),
          });
        }
      }
    }

    return risks;
  }

  /**
   * Analyse un objet devis complet
   */
  analyzeQuote(quoteData: any): RiskAnalysisResult {
    const allRisks: DetectedRisk[] = [];

    // Analyser chaque champ configuré
    for (const field of this.config.fieldsToAnalyze) {
      const value = this.getNestedValue(quoteData, field);
      if (typeof value === 'string' && value.trim()) {
        const fieldRisks = this.analyzeText(value, field);
        allRisks.push(...fieldRisks);
      }
    }

    // Analyser les descriptions des items
    if (quoteData.items && Array.isArray(quoteData.items)) {
      for (let i = 0; i < quoteData.items.length; i++) {
        const item = quoteData.items[i];
        if (item.description) {
          const itemRisks = this.analyzeText(
            item.description,
            `items[${i}].description`
          );
          allRisks.push(...itemRisks);
        }
      }
    }

    // Vérifier les mentions légales manquantes
    const missingMentions = this.checkMissingMentions(quoteData);
    allRisks.push(...missingMentions);

    // Filtrer les risques selon la sensibilité
    const allowedSeverities = SENSITIVITY_FILTERS[this.config.sensitivity];
    const filteredRisks = allRisks.filter((r) => allowedSeverities.includes(r.severity));

    // Calculer les statistiques sur les risques filtrés
    const criticalCount = filteredRisks.filter((r) => r.severity === 'critical').length;
    const highCount = filteredRisks.filter((r) => r.severity === 'high').length;
    const mediumCount = filteredRisks.filter((r) => r.severity === 'medium').length;
    const lowCount = filteredRisks.filter((r) => r.severity === 'low').length;

    // Calculer le score de risque (0 = aucun risque, 100 = très risqué)
    const score = Math.min(
      100,
      filteredRisks.reduce((acc, risk) => acc + SEVERITY_WEIGHTS[risk.severity], 0)
    );

    // Générer les recommandations
    const recommendations = this.generateRecommendations(filteredRisks);

    return {
      hasRisks: filteredRisks.length > 0,
      totalRisks: filteredRisks.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      risks: filteredRisks,
      score,
      recommendations,
      autoFixAvailable: filteredRisks.some((r) => r.autoFix !== undefined),
    };
  }

  /**
   * Vérifie les mentions légales manquantes
   */
  private checkMissingMentions(quoteData: any): DetectedRisk[] {
    const risks: DetectedRisk[] = [];
    const mandatoryMentions = getMandatoryMentions(this.config.locale, quoteData);

    const notes = (quoteData.notes || '').toLowerCase();

    for (const mention of mandatoryMentions) {
      // Vérifier si une forme de la mention est présente
      const mentionKeywords = this.extractKeywords(mention.text);
      const hasKeywords = mentionKeywords.some((kw) =>
        notes.includes(kw.toLowerCase())
      );

      if (!hasKeywords) {
        risks.push({
          id: `missing-${mention.id}`,
          riskId: mention.id,
          category: mention.category,
          severity: 'high',
          text: '',
          context: '',
          position: {
            field: 'notes',
            start: 0,
            end: 0,
          },
          description: `Mention légale manquante`,
          explanation: `La mention suivante est requise mais n'a pas été détectée dans les notes.`,
          suggestion: mention.text,
          autoFix: {
            type: 'add_mention',
            value: mention.text,
          },
        });
      }
    }

    return risks;
  }

  /**
   * Génère une correction automatique si possible
   */
  private generateAutoFix(
    pattern: any,
    matchedText: string
  ): DetectedRisk['autoFix'] | undefined {
    if (!this.config.enableAutoFix) return undefined;

    // Corrections automatiques par type de risque
    const autoFixes: Record<string, DetectedRisk['autoFix']> = {
      binding_guarantee: {
        type: 'replace',
        value: matchedText.replace(
          /garanti[es]?\s+(à\s+100%|totale?ment|absolument)/gi,
          'prévu sous réserve des conditions habituelles'
        ),
      },
      fixed_price_guarantee: {
        type: 'append',
        value: ' (hors variations exceptionnelles des prix des matières premières)',
      },
      deadline_guarantee: {
        type: 'replace',
        value: matchedText.replace(
          /garanti/gi,
          'indicatif, sous réserve de disponibilité'
        ),
      },
    };

    return autoFixes[pattern.id];
  }

  /**
   * Génère des recommandations basées sur les risques détectés
   */
  private generateRecommendations(risks: DetectedRisk[]): string[] {
    const recommendations: string[] = [];
    const categories = new Set(risks.map((r) => r.category));

    if (categories.has('binding_commitment')) {
      recommendations.push(
        'Revoyez les formulations d\'engagement pour éviter les promesses absolues.'
      );
    }

    if (categories.has('price_guarantee')) {
      recommendations.push(
        'Ajoutez une clause de révision des prix en cas de variation importante des coûts.'
      );
    }

    if (categories.has('timeline_guarantee')) {
      recommendations.push(
        'Précisez que les délais sont indicatifs et soumis à conditions.'
      );
    }

    if (categories.has('liability')) {
      recommendations.push(
        'Limitez votre responsabilité au montant du devis ou à vos couvertures d\'assurance.'
      );
    }

    if (categories.has('scope_creep')) {
      recommendations.push(
        'Définissez précisément le périmètre inclus et les exclusions.'
      );
    }

    if (categories.has('ambiguity')) {
      recommendations.push(
        'Précisez les quantités, dates et conditions pour éviter les malentendus.'
      );
    }

    if (risks.some((r) => r.autoFix)) {
      recommendations.push(
        'Des corrections automatiques sont disponibles pour certains risques.'
      );
    }

    return recommendations;
  }

  /**
   * Extrait les mots-clés d'une mention pour la recherche
   */
  private extractKeywords(text: string): string[] {
    // Extraire les mots significatifs (> 4 caractères)
    return text
      .replace(/[.,;:!?()]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 5);
  }

  /**
   * Récupère une valeur imbriquée dans un objet
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  /**
   * Change la locale du moteur
   */
  setLocale(locale: LocaleCode): void {
    this.config.locale = locale;
  }

  /**
   * Change la sensibilité du moteur
   */
  setSensitivity(sensitivity: RiskSensitivity): void {
    this.config.sensitivity = sensitivity;
  }

  /**
   * Récupère la sensibilité actuelle
   */
  getSensitivity(): RiskSensitivity {
    return this.config.sensitivity;
  }
}

/**
 * Instance singleton du moteur
 */
let engineInstance: LegalRiskEngine | null = null;

/**
 * Récupère l'instance du moteur (singleton)
 */
export function getRiskEngine(config?: Partial<RiskEngineConfig>): LegalRiskEngine {
  if (!engineInstance || config) {
    engineInstance = new LegalRiskEngine(config);
  }
  return engineInstance;
}

/**
 * Analyse rapide d'un texte
 */
export function quickAnalyze(
  text: string,
  locale: LocaleCode = 'fr-BE'
): DetectedRisk[] {
  const engine = new LegalRiskEngine({ locale });
  return engine.analyzeText(text);
}

/**
 * Analyse complète d'un devis
 */
export function analyzeQuote(
  quoteData: any,
  locale: LocaleCode = 'fr-BE',
  sensitivity: RiskSensitivity = 'normal'
): RiskAnalysisResult {
  const engine = new LegalRiskEngine({ locale, sensitivity });
  return engine.analyzeQuote(quoteData);
}
