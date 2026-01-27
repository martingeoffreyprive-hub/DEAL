/**
 * DEAL Brand Constants
 * Centralized brand tokens for consistent styling across the application
 */

// Color Palette - Primary (DEAL Official Brand)
export const BRAND_COLORS = {
  primary: {
    DEFAULT: "#1E2144",
    light: "#2A2D52",
    dark: "#151833",
  },
  secondary: {
    DEFAULT: "#E85A5A",
    light: "#F07070",
    dark: "#D04040",
  },
  accent: {
    red: "#E85A5A",
    redLight: "#F07070",
    redDark: "#D04040",
  },
  neutral: {
    white: "#FFFFFF",
    gray100: "#F8FAFC",
    gray200: "#E2E8F0",
    gray300: "#CBD5E1",
    gray400: "#94A3B8",
    gray500: "#64748B",
    gray600: "#475569",
    gray700: "#334155",
    gray800: "#1E293B",
    gray900: "#0F172A",
    black: "#000000",
  },
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
} as const;

// Typography Scale
export const TYPOGRAPHY = {
  fontFamily: {
    primary: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
    wider: "0.05em",
  },
} as const;

// Spacing (8px grid system)
export const SPACING = {
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
} as const;

// Border Radius
export const BORDER_RADIUS = {
  none: "0",
  sm: "0.125rem", // 2px
  DEFAULT: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// Box Shadows
export const BOX_SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  gold: `0 4px 14px 0 ${BRAND_COLORS.secondary.DEFAULT}40`,
  primary: `0 4px 14px 0 ${BRAND_COLORS.primary.DEFAULT}40`,
} as const;

// PDF-specific constants
export const PDF_CONSTANTS = {
  page: {
    width: 595.28, // A4 in points
    height: 841.89,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 40,
    marginRight: 40,
  },
  header: {
    height: 80,
    logoWidth: 120,
    logoHeight: 40,
  },
  footer: {
    height: 60,
    qrCodeSize: 40,
  },
  table: {
    headerHeight: 32,
    rowHeight: 28,
    cellPadding: 8,
  },
  typography: {
    title: 18,
    subtitle: 14,
    body: 10,
    small: 8,
    label: 9,
  },
  colors: {
    headerBg: BRAND_COLORS.primary.DEFAULT,
    headerText: BRAND_COLORS.neutral.white,
    rowAltBg: BRAND_COLORS.neutral.gray100,
    borderColor: BRAND_COLORS.neutral.gray200,
    accentColor: BRAND_COLORS.secondary.DEFAULT,
  },
} as const;

// Animation durations
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    spring: [0.34, 1.56, 0.64, 1],
  },
} as const;

// Z-index scale
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  drawer: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  splash: 9999,
} as const;

// Mode Chantier (Accessibility Mode) overrides
export const MODE_CHANTIER = {
  fontSize: {
    base: "1.125rem", // 18px
    button: "1.125rem", // 18px
  },
  touchTarget: {
    minHeight: "56px",
    minWidth: "56px",
  },
  spacing: {
    button: "1rem", // 16px padding
  },
  contrast: {
    ratio: 4.5, // WCAG AA standard
  },
} as const;

// Subscription tier branding
export const TIER_BRANDING = {
  freemium: {
    name: "Freemium",
    badge: null,
    watermark: true,
    color: BRAND_COLORS.neutral.gray500,
  },
  starter: {
    name: "Starter",
    badge: "Starter",
    watermark: false,
    color: BRAND_COLORS.semantic.info,
  },
  pro: {
    name: "Pro",
    badge: "Pro",
    watermark: false,
    color: BRAND_COLORS.secondary.DEFAULT,
  },
  enterprise: {
    name: "Enterprise",
    badge: "Enterprise",
    watermark: false,
    color: BRAND_COLORS.primary.DEFAULT,
  },
} as const;

// Export all as default object for convenience
const BrandConstants = {
  colors: BRAND_COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: BOX_SHADOWS,
  pdf: PDF_CONSTANTS,
  animation: ANIMATION,
  zIndex: Z_INDEX,
  modeChantier: MODE_CHANTIER,
  tierBranding: TIER_BRANDING,
};

export default BrandConstants;
