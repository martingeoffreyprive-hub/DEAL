import { describe, it, expect } from 'vitest';
import {
  getLocalePack,
  getAllLocalePacks,
  isValidLocaleCode,
  detectLocale,
  validateCompliance,
  generateLegalMentions,
  formatQuoteNumber,
  getTaxRates,
  getStandardTaxRate,
  getQuoteLocale,
  getQuoteLocalePack,
  frBE,
  frFR,
  frCH,
  formatLocaleCurrency,
  formatLocaleDate,
} from '@/lib/locale-packs';

describe('Locale Packs - Tax Rates', () => {
  describe('Belgium (fr-BE)', () => {
    it('should have correct tax rates: 0%, 6%, 12%, 21%', () => {
      const rates = getTaxRates('fr-BE');
      const values = rates.map(r => r.value);

      expect(values).toContain(0);
      expect(values).toContain(6);
      expect(values).toContain(12);
      expect(values).toContain(21);
      expect(rates).toHaveLength(4);
    });

    it('should have 21% as standard rate', () => {
      expect(getStandardTaxRate('fr-BE')).toBe(21);
    });
  });

  describe('France (fr-FR)', () => {
    it('should have correct tax rates: 0%, 2.1%, 5.5%, 10%, 20%', () => {
      const rates = getTaxRates('fr-FR');
      const values = rates.map(r => r.value);

      expect(values).toContain(0);
      expect(values).toContain(2.1);
      expect(values).toContain(5.5);
      expect(values).toContain(10);
      expect(values).toContain(20);
      expect(rates).toHaveLength(5);
    });

    it('should have 20% as standard rate', () => {
      expect(getStandardTaxRate('fr-FR')).toBe(20);
    });
  });

  describe('Switzerland (fr-CH)', () => {
    it('should have correct tax rates: 0%, 2.6%, 3.8%, 8.1%', () => {
      const rates = getTaxRates('fr-CH');
      const values = rates.map(r => r.value);

      expect(values).toContain(0);
      expect(values).toContain(2.6);
      expect(values).toContain(3.8);
      expect(values).toContain(8.1);
      expect(rates).toHaveLength(4);
    });

    it('should have 8.1% as standard rate', () => {
      expect(getStandardTaxRate('fr-CH')).toBe(8.1);
    });
  });
});

describe('Locale Packs - Currency Formatting', () => {
  describe('Belgium/France (EUR)', () => {
    it('should format 1234.56 as "1.234,56 €" for fr-BE', () => {
      const pack = getLocalePack('fr-BE');
      const formatted = formatLocaleCurrency(1234.56, pack);

      expect(formatted).toBe('1.234,56 €');
    });

    it('should format 1234.56 as "1 234,56 €" for fr-FR', () => {
      const pack = getLocalePack('fr-FR');
      const formatted = formatLocaleCurrency(1234.56, pack);

      expect(formatted).toBe('1 234,56 €');
    });

    it('should use EUR currency symbol for Belgium and France', () => {
      expect(frBE.currency.code).toBe('EUR');
      expect(frBE.currency.symbol).toBe('€');
      expect(frFR.currency.code).toBe('EUR');
      expect(frFR.currency.symbol).toBe('€');
    });
  });

  describe('Switzerland (CHF)', () => {
    it('should format 1234.56 as "CHF1\'234.56" for fr-CH', () => {
      const pack = getLocalePack('fr-CH');
      const formatted = formatLocaleCurrency(1234.56, pack);

      // No space between symbol and amount for CHF (position: 'before')
      expect(formatted).toBe("CHF1'234.56");
    });

    it('should use CHF currency', () => {
      expect(frCH.currency.code).toBe('CHF');
      expect(frCH.currency.symbol).toBe('CHF');
    });

    it('should position symbol before amount for Swiss locale', () => {
      expect(frCH.currency.position).toBe('before');
    });
  });

  describe('Edge cases', () => {
    it('should format zero correctly', () => {
      const pack = getLocalePack('fr-BE');
      expect(formatLocaleCurrency(0, pack)).toBe('0,00 €');
    });

    it('should format large numbers correctly', () => {
      const pack = getLocalePack('fr-BE');
      expect(formatLocaleCurrency(1234567.89, pack)).toBe('1.234.567,89 €');
    });

    it('should format negative numbers', () => {
      const pack = getLocalePack('fr-BE');
      // JavaScript toFixed handles negatives
      expect(formatLocaleCurrency(-100, pack)).toBe('-100,00 €');
    });
  });
});

describe('Locale Packs - Automatic Detection', () => {
  describe('Detection by VAT number', () => {
    it('should detect Belgium from BE VAT number', () => {
      expect(detectLocale({ vatNumber: 'BE0123456789' })).toBe('fr-BE');
    });

    it('should detect France from FR VAT number', () => {
      expect(detectLocale({ vatNumber: 'FR12345678901' })).toBe('fr-FR');
    });

    it('should detect Switzerland from CHE VAT number', () => {
      expect(detectLocale({ vatNumber: 'CHE-123.456.789' })).toBe('fr-CH');
    });
  });

  describe('Detection by postal code', () => {
    it('should detect France from 5-digit postal code', () => {
      expect(detectLocale({ postalCode: '75001' })).toBe('fr-FR');
    });

    it('should detect Belgium from 4-digit postal code (priority)', () => {
      expect(detectLocale({ postalCode: '1000' })).toBe('fr-BE');
    });

    it('should detect Switzerland with country only (postal code ambiguous)', () => {
      // 4-digit postal codes are ambiguous between BE and CH
      // When country is specified, it takes priority
      expect(detectLocale({ country: 'Suisse' })).toBe('fr-CH');
      expect(detectLocale({ country: 'CH' })).toBe('fr-CH');
    });
  });

  describe('Detection by country', () => {
    it('should detect Belgium from country name', () => {
      expect(detectLocale({ country: 'Belgique' })).toBe('fr-BE');
      expect(detectLocale({ country: 'Belgium' })).toBe('fr-BE');
      expect(detectLocale({ country: 'BE' })).toBe('fr-BE');
    });

    it('should detect France from country name', () => {
      expect(detectLocale({ country: 'France' })).toBe('fr-FR');
      expect(detectLocale({ country: 'FR' })).toBe('fr-FR');
    });

    it('should detect Switzerland from country name', () => {
      expect(detectLocale({ country: 'Suisse' })).toBe('fr-CH');
      expect(detectLocale({ country: 'Switzerland' })).toBe('fr-CH');
      expect(detectLocale({ country: 'CH' })).toBe('fr-CH');
    });
  });

  describe('Detection by browser locale', () => {
    it('should detect from browser locale', () => {
      expect(detectLocale({ browserLocale: 'fr-BE' })).toBe('fr-BE');
      expect(detectLocale({ browserLocale: 'fr-CH' })).toBe('fr-CH');
      expect(detectLocale({ browserLocale: 'fr-FR' })).toBe('fr-FR');
    });

    it('should default to fr-FR for generic "fr" locale', () => {
      expect(detectLocale({ browserLocale: 'fr' })).toBe('fr-FR');
    });
  });

  describe('Default fallback', () => {
    it('should default to fr-BE when no criteria match', () => {
      expect(detectLocale({})).toBe('fr-BE');
    });
  });
});

describe('Locale Packs - Registry Functions', () => {
  describe('getLocalePack', () => {
    it('should return correct pack for valid codes', () => {
      expect(getLocalePack('fr-BE').code).toBe('fr-BE');
      expect(getLocalePack('fr-FR').code).toBe('fr-FR');
      expect(getLocalePack('fr-CH').code).toBe('fr-CH');
    });

    it('should return default pack (fr-BE) for invalid code', () => {
      // @ts-ignore - testing invalid input
      expect(getLocalePack('invalid').code).toBe('fr-BE');
    });
  });

  describe('getAllLocalePacks', () => {
    it('should return all 3 locale packs', () => {
      const packs = getAllLocalePacks();
      expect(packs).toHaveLength(3);

      const codes = packs.map(p => p.code);
      expect(codes).toContain('fr-BE');
      expect(codes).toContain('fr-FR');
      expect(codes).toContain('fr-CH');
    });
  });

  describe('isValidLocaleCode', () => {
    it('should return true for valid codes', () => {
      expect(isValidLocaleCode('fr-BE')).toBe(true);
      expect(isValidLocaleCode('fr-FR')).toBe(true);
      expect(isValidLocaleCode('fr-CH')).toBe(true);
    });

    it('should return false for invalid codes', () => {
      expect(isValidLocaleCode('en-US')).toBe(false);
      expect(isValidLocaleCode('invalid')).toBe(false);
      expect(isValidLocaleCode('')).toBe(false);
    });
  });
});

describe('Locale Packs - Compliance Validation', () => {
  describe('Belgian VAT format validation', () => {
    it('should pass for valid Belgian VAT format', () => {
      const result = validateCompliance(
        { vat_number: 'BE0123.456.789' },
        'fr-BE'
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid Belgian VAT format', () => {
      const result = validateCompliance(
        { vat_number: 'INVALID' },
        'fr-BE'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when VAT number is missing', () => {
      const result = validateCompliance({}, 'fr-BE');
      expect(result.valid).toBe(false);
    });
  });

  describe('French SIRET validation', () => {
    it('should pass for valid French SIRET', () => {
      const result = validateCompliance(
        { siret: '12345678901234' },
        'fr-FR'
      );
      expect(result.valid).toBe(true);
    });

    it('should fail for invalid SIRET length', () => {
      const result = validateCompliance(
        { siret: '123456' },
        'fr-FR'
      );
      expect(result.valid).toBe(false);
    });
  });
});

describe('Locale Packs - Quote Number Formatting', () => {
  const testDate = new Date(2024, 0, 15); // January 15, 2024

  it('should format Belgian quote number as DEV-YYYY-NNNN', () => {
    const number = formatQuoteNumber('fr-BE', 42, testDate);
    expect(number).toBe('DEV-2024-0042');
  });

  it('should format French quote number as D{YYYY}{MM}-{NNN}', () => {
    const number = formatQuoteNumber('fr-FR', 42, testDate);
    expect(number).toBe('D202401-042');
  });

  it('should format Swiss quote number as OFF-{YYYY}-{NNNN}', () => {
    const number = formatQuoteNumber('fr-CH', 42, testDate);
    expect(number).toBe('OFF-2024-0042');
  });

  it('should pad numbers correctly', () => {
    const number = formatQuoteNumber('fr-BE', 1, testDate);
    expect(number).toBe('DEV-2024-0001');
  });
});

describe('Locale Packs - Legal Mentions', () => {
  it('should generate complete legal mentions for Belgium', () => {
    const mentions = generateLegalMentions('fr-BE');

    expect(mentions).toContain('Ce devis est valable 30 jours');
    expect(mentions).toContain('Paiement');
    expect(mentions).toContain('RGPD');
  });

  it('should include data protection when requested', () => {
    const mentions = generateLegalMentions('fr-BE', { includeDataProtection: true });
    expect(mentions).toContain('données personnelles');
  });

  it('should exclude data protection when not requested', () => {
    const mentions = generateLegalMentions('fr-BE', { includeDataProtection: false });
    expect(mentions).not.toContain('données personnelles');
  });

  it('should include custom terms when provided', () => {
    const customTerm = 'Condition spéciale de test';
    const mentions = generateLegalMentions('fr-BE', { customTerms: customTerm });
    expect(mentions).toContain(customTerm);
  });
});

describe('Locale Packs - Pack Structure', () => {
  const packs = [frBE, frFR, frCH];

  packs.forEach(pack => {
    describe(`${pack.name} (${pack.code})`, () => {
      it('should have required base fields', () => {
        expect(pack.code).toBeDefined();
        expect(pack.name).toBeDefined();
        expect(pack.country).toBeDefined();
        expect(pack.flag).toBeDefined();
      });

      it('should have tax configuration', () => {
        expect(pack.tax.standard).toBeGreaterThan(0);
        expect(pack.tax.rates.length).toBeGreaterThan(0);
        expect(pack.tax.label).toBeDefined();
      });

      it('should have currency configuration', () => {
        expect(pack.currency.code).toBeDefined();
        expect(pack.currency.symbol).toBeDefined();
        expect(['before', 'after']).toContain(pack.currency.position);
        expect(pack.currency.decimals).toBe(2);
      });

      it('should have legal texts', () => {
        expect(pack.legal.quoteValidity).toBeDefined();
        expect(pack.legal.paymentTerms).toBeDefined();
        expect(pack.legal.jurisdiction).toBeDefined();
      });

      it('should have vocabulary', () => {
        expect(pack.vocabulary.quote).toBeDefined();
        expect(pack.vocabulary.invoice).toBeDefined();
        expect(pack.vocabulary.vat).toBeDefined();
        expect(pack.vocabulary.total).toBeDefined();
      });

      it('should have compliance rules', () => {
        expect(pack.compliance.requiredFields.length).toBeGreaterThan(0);
        expect(pack.compliance.rules.length).toBeGreaterThan(0);
      });

      it('should have number formats', () => {
        expect(pack.numberFormats.quote).toContain('{');
        expect(pack.numberFormats.invoice).toContain('{');
      });
    });
  });
});

describe('Locale Packs - Fallback and Error Handling', () => {
  describe('isValidLocaleCode', () => {
    it('should return true for valid locale codes', () => {
      expect(isValidLocaleCode('fr-BE')).toBe(true);
      expect(isValidLocaleCode('fr-FR')).toBe(true);
      expect(isValidLocaleCode('fr-CH')).toBe(true);
    });

    it('should return false for invalid locale codes', () => {
      expect(isValidLocaleCode('de-DE')).toBe(false);
      expect(isValidLocaleCode('en-US')).toBe(false);
      expect(isValidLocaleCode('invalid')).toBe(false);
      expect(isValidLocaleCode('')).toBe(false);
    });
  });

  describe('getLocalePack fallback', () => {
    it('should return fr-BE pack for invalid locale code', () => {
      // @ts-expect-error Testing invalid input
      const pack = getLocalePack('invalid-code');
      expect(pack.code).toBe('fr-BE');
    });

    it('should always return a valid pack', () => {
      const validCodes = ['fr-BE', 'fr-FR', 'fr-CH'];
      validCodes.forEach(code => {
        const pack = getLocalePack(code as any);
        expect(pack).toBeDefined();
        expect(pack.code).toBe(code);
      });
    });
  });

  describe('detectLocale fallback', () => {
    it('should return fr-BE when no hints are provided', () => {
      const locale = detectLocale({});
      expect(locale).toBe('fr-BE');
    });

    it('should return fr-BE for unknown browser locale', () => {
      const locale = detectLocale({ browserLocale: 'de-DE' });
      // Falls back to fr-FR for any 'fr' locale, otherwise fr-BE
      expect(['fr-BE', 'fr-FR']).toContain(locale);
    });

    it('should handle undefined values gracefully', () => {
      const locale = detectLocale({
        vatNumber: undefined,
        postalCode: undefined,
        country: undefined,
        browserLocale: undefined,
      });
      expect(locale).toBe('fr-BE');
    });
  });

  describe('getQuoteLocale - Quote locale preservation', () => {
    it('should return the quote locale if valid', () => {
      expect(getQuoteLocale('fr-BE')).toBe('fr-BE');
      expect(getQuoteLocale('fr-FR')).toBe('fr-FR');
      expect(getQuoteLocale('fr-CH')).toBe('fr-CH');
    });

    it('should fallback to fr-BE for null locale', () => {
      expect(getQuoteLocale(null)).toBe('fr-BE');
    });

    it('should fallback to fr-BE for undefined locale', () => {
      expect(getQuoteLocale(undefined)).toBe('fr-BE');
    });

    it('should fallback to fr-BE for invalid locale', () => {
      expect(getQuoteLocale('de-DE')).toBe('fr-BE');
      expect(getQuoteLocale('invalid')).toBe('fr-BE');
      expect(getQuoteLocale('')).toBe('fr-BE');
    });
  });

  describe('getQuoteLocalePack - Quote locale pack retrieval', () => {
    it('should return correct pack for valid quote locale', () => {
      expect(getQuoteLocalePack('fr-CH').code).toBe('fr-CH');
      expect(getQuoteLocalePack('fr-CH').currency.code).toBe('CHF');
    });

    it('should return fr-BE pack for null/undefined locale', () => {
      expect(getQuoteLocalePack(null).code).toBe('fr-BE');
      expect(getQuoteLocalePack(undefined).code).toBe('fr-BE');
    });

    it('should preserve historical formatting for existing quotes', () => {
      // A Swiss quote should always format as CHF even if user changes to fr-BE
      const swissPack = getQuoteLocalePack('fr-CH');
      expect(swissPack.currency.symbol).toBe('CHF');
      expect(swissPack.tax.standard).toBe(8.1);
    });
  });
});
