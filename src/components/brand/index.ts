/**
 * DEAL Brand Components
 * Central export point for all brand-related components and constants
 */

// Core Logo Components
export { DealIconD } from "./DealIconD";
export { DealLogoFull } from "./DealLogoFull";
export { DealLogo } from "./DealLogo";

// UI Components
export { SplashScreen } from "./SplashScreen";
export { DealLoadingSpinner, DealLoadingPage } from "./DealLoadingSpinner";
export { DealEmptyState } from "./DealEmptyState";

// Watermark Components
export {
  DealWatermark,
  DealWatermarkOverlay,
  DealWatermarkPattern,
} from "./DealWatermark";

// PDF Components (for react-pdf usage)
export {
  DealIconForPDF,
  DealWordmarkForPDF,
  DealLogoFullForPDF,
  DealWatermarkForPDF,
  DealFooterBadgeForPDF,
  DealSubscriptionBadgeForPDF,
} from "./DealLogoForPDF";

// Brand Constants
export {
  default as BrandConstants,
  BRAND_COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  BOX_SHADOWS,
  PDF_CONSTANTS,
  ANIMATION,
  Z_INDEX,
  MODE_CHANTIER,
  TIER_BRANDING,
} from "./BrandConstants";
