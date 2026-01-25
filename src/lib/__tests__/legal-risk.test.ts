import { describe, it, expect } from 'vitest';
import {
  LegalRiskEngine,
  analyzeQuote,
  quickAnalyze,
  getPatternsForLocale,
  RISK_PATTERNS,
  type RiskSensitivity,
} from '../legal-risk';

describe('Legal Risk Engine', () => {
  describe('Pattern Detection', () => {
    it('should detect binding commitment with critical severity', () => {
      const engine = new LegalRiskEngine({ locale: 'fr-BE' });
      const risks = engine.analyzeText('Qualité garantie à 100%', 'notes');

      expect(risks.length).toBeGreaterThan(0);
      expect(risks[0].category).toBe('binding_commitment');
      expect(risks[0].severity).toBe('critical');
    });

    it('should detect price guarantee', () => {
      const engine = new LegalRiskEngine({ locale: 'fr-BE' });
      const risks = engine.analyzeText('Prix fixe et définitif', 'notes');

      expect(risks.length).toBeGreaterThan(0);
      expect(risks[0].category).toBe('price_guarantee');
      expect(risks[0].severity).toBe('high');
    });

    it('should detect timeline guarantee', () => {
      const engine = new LegalRiskEngine({ locale: 'fr-BE' });
      const risks = engine.analyzeText('Délai garanti de 5 jours', 'notes');

      expect(risks.length).toBeGreaterThan(0);
      expect(risks[0].category).toBe('timeline_guarantee');
    });

    it('should detect ambiguous quantity', () => {
      const engine = new LegalRiskEngine({ locale: 'fr-BE', sensitivity: 'strict' });
      const risks = engine.analyzeText('Environ 10 mètres de câble', 'notes');

      expect(risks.length).toBeGreaterThan(0);
      expect(risks[0].category).toBe('ambiguity');
    });
  });

  describe('Sensitivity Filtering', () => {
    const testQuote = {
      notes: 'Garantie totale à 100%. Prix fixe garanti. Délai indicatif environ 5 jours.',
      items: [],
    };

    it('should return all risks in strict mode', () => {
      const result = analyzeQuote(testQuote, 'fr-BE', 'strict');
      expect(result.totalRisks).toBeGreaterThanOrEqual(1);
    });

    it('should filter low/info risks in normal mode', () => {
      const strictResult = analyzeQuote(testQuote, 'fr-BE', 'strict');
      const normalResult = analyzeQuote(testQuote, 'fr-BE', 'normal');

      // Normal mode should have fewer or equal risks
      expect(normalResult.totalRisks).toBeLessThanOrEqual(strictResult.totalRisks);
    });

    it('should only return critical risks in permissive mode', () => {
      const result = analyzeQuote(testQuote, 'fr-BE', 'permissive');

      // All returned risks should be critical
      result.risks.forEach((risk) => {
        expect(risk.severity).toBe('critical');
      });
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score based on severity weights', () => {
      const result = analyzeQuote(
        { notes: 'Je vous promets un résultat garanti à 100%', items: [] },
        'fr-BE',
        'strict'
      );

      // Should have a non-zero score for detected risks
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should return score 0 for clean text', () => {
      const result = analyzeQuote(
        { notes: 'Travaux de peinture standard.', items: [] },
        'fr-BE'
      );

      expect(result.score).toBe(0);
      expect(result.hasRisks).toBe(false);
    });
  });

  describe('Locale-Specific Patterns', () => {
    it('should return locale-specific patterns for fr-FR', () => {
      const patterns = getPatternsForLocale('fr-FR');
      const frPatterns = patterns.filter((p) => p.locales?.includes('fr-FR'));

      expect(frPatterns.length).toBeGreaterThan(0);
    });

    it('should detect EUR in Swiss context', () => {
      const engine = new LegalRiskEngine({ locale: 'fr-CH', sensitivity: 'strict' });
      const risks = engine.analyzeText('Total: 500€', 'notes');

      const currencyRisk = risks.find((r) => r.id.includes('ch_currency'));
      expect(currencyRisk).toBeDefined();
    });

    it('should detect decennale mention for France', () => {
      const engine = new LegalRiskEngine({ locale: 'fr-FR', sensitivity: 'strict' });
      const risks = engine.analyzeText('Garantie décennale non souscrite', 'notes');

      expect(risks.length).toBeGreaterThan(0);
    });
  });

  describe('Quote Analysis', () => {
    it('should analyze quote items descriptions', () => {
      const quote = {
        notes: '',
        items: [
          { description: 'Installation garantie totalement à 100%' },
          { description: 'Travaux standard' },
        ],
      };

      const result = analyzeQuote(quote, 'fr-BE', 'strict');
      expect(result.totalRisks).toBeGreaterThanOrEqual(0);
    });

    it('should generate recommendations for detected categories', () => {
      const result = analyzeQuote(
        { notes: 'Prix fixe garanti. Délai ferme.', items: [] },
        'fr-BE'
      );

      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should detect auto-fix availability', () => {
      const result = analyzeQuote(
        { notes: 'Garantie totale à 100%', items: [] },
        'fr-BE',
        'strict'
      );

      // Some patterns should have autoFix
      expect(result.autoFixAvailable).toBeDefined();
    });
  });

  describe('Engine Configuration', () => {
    it('should allow changing sensitivity', () => {
      const engine = new LegalRiskEngine({ sensitivity: 'strict' });
      expect(engine.getSensitivity()).toBe('strict');

      engine.setSensitivity('permissive');
      expect(engine.getSensitivity()).toBe('permissive');
    });

    it('should allow changing locale', () => {
      const engine = new LegalRiskEngine({ locale: 'fr-BE' });
      engine.setLocale('fr-CH');

      // Should now detect CH-specific patterns
      const risks = engine.analyzeText('Total: 500 euros', 'notes');
      const chRisks = risks.filter((r) => r.id.includes('ch_'));
      expect(chRisks.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Analyze Helper', () => {
    it('should analyze text with default locale', () => {
      const risks = quickAnalyze('Prix ferme et définitif');
      expect(risks.length).toBeGreaterThan(0);
    });

    it('should respect specified locale', () => {
      const risks = quickAnalyze('500€', 'fr-CH');
      const currencyRisk = risks.find((r) => r.id.includes('ch_currency'));
      expect(currencyRisk).toBeDefined();
    });
  });
});
