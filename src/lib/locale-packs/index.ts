// Locale Packs Manager
// Gestion centralisée des packs de localisation

import { frBE } from './fr-be';
import { frFR } from './fr-fr';
import { frCH } from './fr-ch';
import type { LocalePack, LocaleCode } from './types';

export * from './types';
export { frBE } from './fr-be';
export { frFR } from './fr-fr';
export { frCH } from './fr-ch';

// Registry de tous les packs disponibles
const LOCALE_PACKS: Record<LocaleCode, LocalePack> = {
  'fr-BE': frBE,
  'fr-FR': frFR,
  'fr-CH': frCH,
};

// Pack par défaut
const DEFAULT_LOCALE: LocaleCode = 'fr-BE';

/**
 * Récupère un pack de localisation par son code
 */
export function getLocalePack(code: LocaleCode): LocalePack {
  return LOCALE_PACKS[code] || LOCALE_PACKS[DEFAULT_LOCALE];
}

/**
 * Liste tous les packs disponibles
 */
export function getAllLocalePacks(): LocalePack[] {
  return Object.values(LOCALE_PACKS);
}

/**
 * Vérifie si un code de locale est valide
 */
export function isValidLocaleCode(code: string): code is LocaleCode {
  return code in LOCALE_PACKS;
}

/**
 * Détecte automatiquement la locale basée sur différents critères
 */
export function detectLocale(options: {
  vatNumber?: string;
  postalCode?: string;
  country?: string;
  browserLocale?: string;
}): LocaleCode {
  const { vatNumber, postalCode, country, browserLocale } = options;

  // Détection par numéro de TVA
  if (vatNumber) {
    if (vatNumber.startsWith('BE')) return 'fr-BE';
    if (vatNumber.startsWith('FR')) return 'fr-FR';
    if (vatNumber.startsWith('CHE')) return 'fr-CH';
  }

  // Détection par code postal
  if (postalCode) {
    const code = parseInt(postalCode, 10);
    // Codes postaux belges: 1000-9999
    if (code >= 1000 && code <= 9999 && postalCode.length === 4) return 'fr-BE';
    // Codes postaux français: 01000-98999
    if (code >= 1000 && code <= 98999 && postalCode.length === 5) return 'fr-FR';
    // Codes postaux suisses: 1000-9999
    if (code >= 1000 && code <= 9999 && postalCode.length === 4) {
      // Distinction BE/CH par le contexte
      if (country?.toLowerCase().includes('suisse') || country?.toLowerCase().includes('swiss')) {
        return 'fr-CH';
      }
    }
  }

  // Détection par pays explicite
  if (country) {
    const c = country.toLowerCase();
    if (c.includes('belgique') || c.includes('belgium') || c === 'be') return 'fr-BE';
    if (c.includes('france') || c === 'fr') return 'fr-FR';
    if (c.includes('suisse') || c.includes('switzerland') || c === 'ch') return 'fr-CH';
  }

  // Détection par locale du navigateur
  if (browserLocale) {
    const locale = browserLocale.toLowerCase();
    if (locale.includes('be')) return 'fr-BE';
    if (locale.includes('ch')) return 'fr-CH';
    if (locale.includes('fr')) return 'fr-FR'; // France par défaut pour fr
  }

  return DEFAULT_LOCALE;
}

/**
 * Valide les données d'un devis selon les règles de conformité de la locale
 */
export function validateCompliance(
  data: any,
  localeCode: LocaleCode
): { valid: boolean; errors: string[]; warnings: string[]; info: string[] } {
  const pack = getLocalePack(localeCode);
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];

  for (const rule of pack.compliance.rules) {
    const passed = rule.check(data);
    if (!passed) {
      switch (rule.severity) {
        case 'error':
          errors.push(rule.description);
          break;
        case 'warning':
          warnings.push(rule.description);
          break;
        case 'info':
          info.push(rule.description);
          break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Génère les mentions légales complètes pour un devis
 */
export function generateLegalMentions(
  localeCode: LocaleCode,
  options: {
    includeDataProtection?: boolean;
    includeInsurance?: boolean;
    customTerms?: string;
  } = {}
): string {
  const pack = getLocalePack(localeCode);
  const { includeDataProtection = true, includeInsurance = true, customTerms } = options;

  const mentions: string[] = [
    pack.legal.quoteValidity,
    pack.legal.paymentTerms,
    pack.legal.latePaymentPenalties,
  ];

  if (pack.legal.withdrawalRight) {
    mentions.push(pack.legal.withdrawalRight);
  }

  mentions.push(pack.legal.jurisdiction);

  if (includeDataProtection) {
    mentions.push(pack.legal.dataProtection);
  }

  if (includeInsurance && pack.legal.professionalInsurance) {
    mentions.push(pack.legal.professionalInsurance);
  }

  if (customTerms) {
    mentions.push(customTerms);
  }

  return mentions.join('\n\n');
}

/**
 * Formate un numéro de devis selon le format de la locale
 */
export function formatQuoteNumber(
  localeCode: LocaleCode,
  number: number,
  date: Date = new Date()
): string {
  const pack = getLocalePack(localeCode);
  let format = pack.numberFormats.quote;

  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const paddedNumber = number.toString().padStart(4, '0');
  const shortNumber = number.toString().padStart(3, '0');

  return format
    .replace('{YYYY}', year)
    .replace('{YY}', year.slice(-2))
    .replace('{MM}', month)
    .replace('{NNNN}', paddedNumber)
    .replace('{NNN}', shortNumber);
}

/**
 * Récupère les taux de TVA disponibles pour une locale
 */
export function getTaxRates(localeCode: LocaleCode) {
  const pack = getLocalePack(localeCode);
  return pack.tax.rates;
}

/**
 * Récupère le taux de TVA standard pour une locale
 */
export function getStandardTaxRate(localeCode: LocaleCode): number {
  const pack = getLocalePack(localeCode);
  return pack.tax.standard;
}

/**
 * Récupère la locale d'un devis avec fallback vers fr-BE
 * Utilisé pour préserver le formatage historique des devis existants
 */
export function getQuoteLocale(quoteLocale: string | null | undefined): LocaleCode {
  if (quoteLocale && isValidLocaleCode(quoteLocale)) {
    return quoteLocale;
  }
  // Fallback to fr-BE for existing quotes without locale
  return DEFAULT_LOCALE;
}

/**
 * Récupère le pack de locale pour un devis
 */
export function getQuoteLocalePack(quoteLocale: string | null | undefined): LocalePack {
  return getLocalePack(getQuoteLocale(quoteLocale));
}
