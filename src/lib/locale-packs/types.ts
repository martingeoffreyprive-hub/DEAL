// Locale Pack Type Definitions
// Système de localisation pour FR-BE, FR-FR, FR-CH

export type LocaleCode = 'fr-BE' | 'fr-FR' | 'fr-CH' | 'nl-BE' | 'de-BE';

export interface TaxConfig {
  standard: number;
  reduced: number;
  superReduced?: number;
  zero: number;
  label: string;
  rates: { value: number; label: string; description?: string }[];
}

export interface LegalMentions {
  quoteValidity: string;
  paymentTerms: string;
  latePaymentPenalties: string;
  withdrawalRight?: string;
  jurisdiction: string;
  dataProtection: string;
  professionalInsurance?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  position: 'before' | 'after';
  decimalSeparator: string;
  thousandsSeparator: string;
  decimals: number;
}

export interface DateConfig {
  format: string;
  locale: string;
}

export interface VocabularyOverrides {
  // Termes généraux
  quote: string;
  invoice: string;
  client: string;
  provider: string;
  vat: string;
  vatNumber: string;

  // Termes financiers
  subtotal: string;
  total: string;
  deposit: string;
  balance: string;

  // Termes légaux
  terms: string;
  conditions: string;
  validity: string;

  // Termes de paiement
  paymentDue: string;
  bankTransfer: string;
  cash: string;

  // Termes spécifiques au secteur (optionnels)
  [key: string]: string;
}

export interface ComplianceRequirements {
  // Informations obligatoires sur les devis
  requiredFields: string[];

  // Mentions légales obligatoires
  mandatoryMentions: string[];

  // Règles spécifiques
  rules: {
    id: string;
    description: string;
    check: (data: any) => boolean;
    severity: 'error' | 'warning' | 'info';
  }[];
}

export interface LocalePack {
  code: LocaleCode;
  name: string;
  country: string;
  flag: string;

  // Configuration fiscale
  tax: TaxConfig;

  // Monnaie
  currency: CurrencyConfig;

  // Date
  date: DateConfig;

  // Mentions légales
  legal: LegalMentions;

  // Vocabulaire
  vocabulary: VocabularyOverrides;

  // Conformité
  compliance: ComplianceRequirements;

  // Formats de numérotation
  numberFormats: {
    quote: string; // ex: "DEV-{YYYY}-{NNNN}"
    invoice: string;
  };

  // Contact officiel pour les litiges
  officialContacts: {
    consumerProtection?: string;
    tradeRegister?: string;
    taxAuthority?: string;
  };
}

// Helper pour formater la monnaie selon la locale
export function formatLocaleCurrency(
  amount: number,
  pack: LocalePack
): string {
  const { symbol, position, decimalSeparator, thousandsSeparator, decimals } = pack.currency;

  const formatted = amount
    .toFixed(decimals)
    .replace('.', decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  return position === 'before'
    ? `${symbol}${formatted}`
    : `${formatted} ${symbol}`;
}

// Helper pour formater les dates selon la locale
export function formatLocaleDate(
  date: Date | string,
  pack: LocalePack
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(pack.date.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
