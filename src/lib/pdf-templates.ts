// DEAL Premium PDF Templates
// 6 templates professionnels avec charte graphique DEAL

export type PDFTemplateId =
  | "classic-pro"
  | "corporate"
  | "artisan"
  | "modern"
  | "luxe"
  | "minimal";

export interface PDFTemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  tableBg: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  borderColor: string;
}

export interface PDFTemplateConfig {
  id: PDFTemplateId;
  name: string;
  description: string;
  preview: string;
  colors: PDFTemplateColors;
  fonts: {
    heading: string;
    body: string;
  };
  style: {
    headerStyle: "classic" | "modern" | "minimal" | "split";
    tableStyle: "bordered" | "striped" | "minimal" | "cards";
    logoPosition: "left" | "right" | "center";
    showDecorations: boolean;
    cornerRadius: number;
    shadowIntensity: number;
  };
  features: {
    showGoldAccent: boolean;
    showWatermark: boolean;
    showQRCode: boolean;
    showSignatureBlock: boolean;
    enlargedTotals: boolean;
  };
}

// DEAL Brand Colors
const DEAL_COLORS = {
  navy: "#1E3A5F",
  navyLight: "#2D4A6F",
  navyDark: "#0D1B2A",
  gold: "#C9A962",
  goldLight: "#D4B872",
  goldDark: "#B89952",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  gray: "#64748B",
  grayLight: "#E2E8F0",
};

export const PDF_TEMPLATES: Record<PDFTemplateId, PDFTemplateConfig> = {
  // 1. Classic Pro - Le template par défaut professionnel
  "classic-pro": {
    id: "classic-pro",
    name: "Classic Pro",
    description: "Template professionnel classique avec touches dorées DEAL",
    preview: "/templates/classic-pro.png",
    colors: {
      primary: DEAL_COLORS.navy,
      secondary: DEAL_COLORS.navyLight,
      accent: DEAL_COLORS.gold,
      background: DEAL_COLORS.white,
      text: DEAL_COLORS.navyDark,
      muted: DEAL_COLORS.gray,
      tableBg: DEAL_COLORS.offWhite,
      tableHeaderBg: DEAL_COLORS.navy,
      tableHeaderText: DEAL_COLORS.white,
      borderColor: DEAL_COLORS.grayLight,
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    style: {
      headerStyle: "classic",
      tableStyle: "striped",
      logoPosition: "left",
      showDecorations: true,
      cornerRadius: 4,
      shadowIntensity: 0.1,
    },
    features: {
      showGoldAccent: true,
      showWatermark: false,
      showQRCode: true,
      showSignatureBlock: true,
      enlargedTotals: true,
    },
  },

  // 2. Corporate - Pour les grandes entreprises
  "corporate": {
    id: "corporate",
    name: "Corporate",
    description: "Design formel et institutionnel pour B2B",
    preview: "/templates/corporate.png",
    colors: {
      primary: "#1F2937", // Gray-800
      secondary: "#374151", // Gray-700
      accent: DEAL_COLORS.gold,
      background: DEAL_COLORS.white,
      text: "#111827", // Gray-900
      muted: "#6B7280", // Gray-500
      tableBg: "#F9FAFB", // Gray-50
      tableHeaderBg: "#1F2937",
      tableHeaderText: DEAL_COLORS.white,
      borderColor: "#E5E7EB", // Gray-200
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    style: {
      headerStyle: "split",
      tableStyle: "bordered",
      logoPosition: "left",
      showDecorations: false,
      cornerRadius: 2,
      shadowIntensity: 0.05,
    },
    features: {
      showGoldAccent: true,
      showWatermark: true,
      showQRCode: true,
      showSignatureBlock: true,
      enlargedTotals: true,
    },
  },

  // 3. Artisan - Pour les métiers manuels et créatifs
  "artisan": {
    id: "artisan",
    name: "Artisan",
    description: "Style chaleureux pour artisans et créateurs",
    preview: "/templates/artisan.png",
    colors: {
      primary: "#78350F", // Amber-900
      secondary: "#92400E", // Amber-800
      accent: "#F59E0B", // Amber-500
      background: "#FFFBEB", // Amber-50
      text: "#451A03", // Amber-950
      muted: "#A16207", // Amber-700
      tableBg: "#FEF3C7", // Amber-100
      tableHeaderBg: "#78350F",
      tableHeaderText: "#FFFBEB",
      borderColor: "#FDE68A", // Amber-200
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    style: {
      headerStyle: "classic",
      tableStyle: "cards",
      logoPosition: "center",
      showDecorations: true,
      cornerRadius: 8,
      shadowIntensity: 0.15,
    },
    features: {
      showGoldAccent: false,
      showWatermark: false,
      showQRCode: true,
      showSignatureBlock: true,
      enlargedTotals: false,
    },
  },

  // 4. Modern - Design contemporain et épuré
  "modern": {
    id: "modern",
    name: "Modern",
    description: "Design contemporain avec couleurs vives",
    preview: "/templates/modern.png",
    colors: {
      primary: "#7C3AED", // Violet-600
      secondary: "#8B5CF6", // Violet-500
      accent: "#A78BFA", // Violet-400
      background: DEAL_COLORS.white,
      text: "#1E1B4B", // Indigo-950
      muted: "#6366F1", // Indigo-500
      tableBg: "#F5F3FF", // Violet-50
      tableHeaderBg: "#7C3AED",
      tableHeaderText: DEAL_COLORS.white,
      borderColor: "#DDD6FE", // Violet-200
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    style: {
      headerStyle: "modern",
      tableStyle: "minimal",
      logoPosition: "right",
      showDecorations: true,
      cornerRadius: 12,
      shadowIntensity: 0.2,
    },
    features: {
      showGoldAccent: false,
      showWatermark: false,
      showQRCode: true,
      showSignatureBlock: false,
      enlargedTotals: true,
    },
  },

  // 5. Luxe - Haut de gamme premium
  "luxe": {
    id: "luxe",
    name: "Luxe",
    description: "Premium avec finitions dorées et élégantes",
    preview: "/templates/luxe.png",
    colors: {
      primary: DEAL_COLORS.navyDark,
      secondary: DEAL_COLORS.navy,
      accent: DEAL_COLORS.gold,
      background: "#FEFDFB", // Warm white
      text: DEAL_COLORS.navyDark,
      muted: DEAL_COLORS.gray,
      tableBg: "#FAF9F7",
      tableHeaderBg: DEAL_COLORS.navyDark,
      tableHeaderText: DEAL_COLORS.gold,
      borderColor: DEAL_COLORS.gold,
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    style: {
      headerStyle: "classic",
      tableStyle: "bordered",
      logoPosition: "center",
      showDecorations: true,
      cornerRadius: 0,
      shadowIntensity: 0.08,
    },
    features: {
      showGoldAccent: true,
      showWatermark: true,
      showQRCode: true,
      showSignatureBlock: true,
      enlargedTotals: true,
    },
  },

  // 6. Minimal - Ultra épuré
  "minimal": {
    id: "minimal",
    name: "Minimal",
    description: "Design minimaliste et aéré",
    preview: "/templates/minimal.png",
    colors: {
      primary: "#18181B", // Zinc-900
      secondary: "#27272A", // Zinc-800
      accent: "#71717A", // Zinc-500
      background: DEAL_COLORS.white,
      text: "#09090B", // Zinc-950
      muted: "#A1A1AA", // Zinc-400
      tableBg: DEAL_COLORS.white,
      tableHeaderBg: "#FAFAFA", // Zinc-50
      tableHeaderText: "#18181B",
      borderColor: "#E4E4E7", // Zinc-200
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    style: {
      headerStyle: "minimal",
      tableStyle: "minimal",
      logoPosition: "left",
      showDecorations: false,
      cornerRadius: 0,
      shadowIntensity: 0,
    },
    features: {
      showGoldAccent: false,
      showWatermark: false,
      showQRCode: false,
      showSignatureBlock: false,
      enlargedTotals: false,
    },
  },
};

// Helper to get template by ID
export function getTemplate(id: PDFTemplateId): PDFTemplateConfig {
  return PDF_TEMPLATES[id] || PDF_TEMPLATES["classic-pro"];
}

// Get all templates as array
export function getAllTemplates(): PDFTemplateConfig[] {
  return Object.values(PDF_TEMPLATES);
}

// Suggest template based on sector
export function suggestTemplateForSector(sector: string): PDFTemplateId {
  const sectorTemplateMap: Record<string, PDFTemplateId> = {
    construction: "classic-pro",
    btp: "classic-pro",
    it: "modern",
    tech: "modern",
    conseil: "corporate",
    consulting: "corporate",
    artisan: "artisan",
    artisanat: "artisan",
    luxe: "luxe",
    premium: "luxe",
    design: "minimal",
    architecture: "minimal",
  };

  const lowerSector = sector.toLowerCase();
  for (const [key, template] of Object.entries(sectorTemplateMap)) {
    if (lowerSector.includes(key)) {
      return template;
    }
  }

  return "classic-pro";
}
