// PDF Adaptive System - Type Definitions
// Configuration de densité et branding pour les PDF

export type PDFDensity = 'compact' | 'normal' | 'detailed';

export interface PDFBranding {
  // Couleurs
  primaryColor: string;      // Couleur principale (headers, accents)
  secondaryColor: string;    // Couleur secondaire
  textColor: string;         // Couleur du texte principal
  mutedColor: string;        // Couleur du texte secondaire

  // Logo
  logoUrl?: string;
  logoPosition: 'left' | 'right' | 'center';
  logoSize: 'small' | 'medium' | 'large';

  // Typography
  fontFamily: 'helvetica' | 'times' | 'courier';
  headerSize: number;
  bodySize: number;

  // Layout
  showWatermark?: boolean;
  watermarkText?: string;
  watermarkOpacity?: number;

  // Footer
  customFooterText?: string;
  showPageNumbers?: boolean;
}

export interface PDFDensityConfig {
  // Spacing
  pageMargin: number;
  sectionSpacing: number;
  itemSpacing: number;

  // Font sizes
  titleSize: number;
  headerSize: number;
  bodySize: number;
  smallSize: number;

  // Table
  tablePadding: number;
  showTableBorders: boolean;
  alternateRowColors: boolean;

  // Content
  showItemNumbers: boolean;
  showUnitPrices: boolean;
  showSubtotalPerSection: boolean;
  wrapDescriptions: boolean;
  maxDescriptionLength?: number;

  // Sections visibility
  showCompanyLogo: boolean;
  showClientDetails: boolean;
  showQuoteDetails: boolean;
  showNotes: boolean;
  showLegalMentions: boolean;
  showBankingInfo: boolean;
  showSignatureBlock: boolean;
}

// Configurations par défaut pour chaque densité
export const DENSITY_CONFIGS: Record<PDFDensity, PDFDensityConfig> = {
  compact: {
    pageMargin: 30,
    sectionSpacing: 10,
    itemSpacing: 4,
    titleSize: 18,
    headerSize: 10,
    bodySize: 8,
    smallSize: 7,
    tablePadding: 4,
    showTableBorders: false,
    alternateRowColors: true,
    showItemNumbers: false,
    showUnitPrices: true,
    showSubtotalPerSection: false,
    wrapDescriptions: false,
    maxDescriptionLength: 80,
    showCompanyLogo: true,
    showClientDetails: true,
    showQuoteDetails: true,
    showNotes: true,
    showLegalMentions: false,
    showBankingInfo: false,
    showSignatureBlock: false,
  },
  normal: {
    pageMargin: 40,
    sectionSpacing: 20,
    itemSpacing: 6,
    titleSize: 24,
    headerSize: 12,
    bodySize: 10,
    smallSize: 8,
    tablePadding: 8,
    showTableBorders: true,
    alternateRowColors: true,
    showItemNumbers: true,
    showUnitPrices: true,
    showSubtotalPerSection: true,
    wrapDescriptions: true,
    showCompanyLogo: true,
    showClientDetails: true,
    showQuoteDetails: true,
    showNotes: true,
    showLegalMentions: true,
    showBankingInfo: true,
    showSignatureBlock: false,
  },
  detailed: {
    pageMargin: 40,
    sectionSpacing: 25,
    itemSpacing: 8,
    titleSize: 28,
    headerSize: 14,
    bodySize: 11,
    smallSize: 9,
    tablePadding: 10,
    showTableBorders: true,
    alternateRowColors: true,
    showItemNumbers: true,
    showUnitPrices: true,
    showSubtotalPerSection: true,
    wrapDescriptions: true,
    showCompanyLogo: true,
    showClientDetails: true,
    showQuoteDetails: true,
    showNotes: true,
    showLegalMentions: true,
    showBankingInfo: true,
    showSignatureBlock: true,
  },
};

// Branding par défaut
export const DEFAULT_BRANDING: PDFBranding = {
  primaryColor: '#2563eb',      // Blue
  secondaryColor: '#64748b',    // Slate
  textColor: '#1e293b',         // Slate-800
  mutedColor: '#94a3b8',        // Slate-400
  logoPosition: 'left',
  logoSize: 'medium',
  fontFamily: 'helvetica',
  headerSize: 12,
  bodySize: 10,
  showWatermark: false,
  showPageNumbers: true,
};

// Helper pour merger les configs
export function mergeBranding(
  base: PDFBranding,
  override?: Partial<PDFBranding>
): PDFBranding {
  return { ...base, ...override };
}

export function getDensityConfig(density: PDFDensity): PDFDensityConfig {
  return DENSITY_CONFIGS[density];
}

// Calcul automatique de la densité basée sur le nombre d'items
export function suggestDensity(itemCount: number): PDFDensity {
  if (itemCount <= 5) return 'detailed';
  if (itemCount <= 15) return 'normal';
  return 'compact';
}
