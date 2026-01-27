"use client";

/**
 * Branding Context - Dynamic Branding System
 * Controls branding features based on subscription tier
 *
 * Tiers:
 * - Freemium: DEAL branding, watermark on PDFs, no customization
 * - Pro: Basic customization (logo, colors), no watermark
 * - Business: Full customization, white-label option
 * - Corporate: Complete white-label, custom domain support
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { BRAND_COLORS, TIER_BRANDING } from "@/components/brand/BrandConstants";
import type { SubscriptionPlan } from "@/types/database";

// Branding configuration per tier
export interface BrandingConfig {
  // Company Information
  companyName: string;
  companyLogo?: string;
  companyLogoLight?: string; // For dark backgrounds

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;

  // PDF Settings
  showDealWatermark: boolean;
  showDealFooter: boolean;
  customFooterText?: string;

  // White-label Settings
  isWhiteLabel: boolean;
  customDomain?: string;
  customFavicon?: string;

  // Feature Flags
  canCustomizeLogo: boolean;
  canCustomizeColors: boolean;
  canRemoveWatermark: boolean;
  canWhiteLabel: boolean;
}

// Default DEAL branding
const DEFAULT_BRANDING: BrandingConfig = {
  companyName: "DEAL",
  primaryColor: BRAND_COLORS.primary.DEFAULT,
  secondaryColor: BRAND_COLORS.secondary.DEFAULT,
  accentColor: BRAND_COLORS.secondary.DEFAULT,
  showDealWatermark: true,
  showDealFooter: true,
  isWhiteLabel: false,
  canCustomizeLogo: false,
  canCustomizeColors: false,
  canRemoveWatermark: false,
  canWhiteLabel: false,
};

// Tier-specific branding capabilities
const TIER_CAPABILITIES: Record<SubscriptionPlan, Partial<BrandingConfig>> = {
  free: {
    showDealWatermark: true,
    showDealFooter: true,
    isWhiteLabel: false,
    canCustomizeLogo: false,
    canCustomizeColors: false,
    canRemoveWatermark: false,
    canWhiteLabel: false,
  },
  pro: {
    showDealWatermark: false,
    showDealFooter: true,
    isWhiteLabel: false,
    canCustomizeLogo: true,
    canCustomizeColors: true,
    canRemoveWatermark: true,
    canWhiteLabel: false,
  },
  business: {
    showDealWatermark: false,
    showDealFooter: false,
    isWhiteLabel: false,
    canCustomizeLogo: true,
    canCustomizeColors: true,
    canRemoveWatermark: true,
    canWhiteLabel: true,
  },
  corporate: {
    showDealWatermark: false,
    showDealFooter: false,
    isWhiteLabel: true,
    canCustomizeLogo: true,
    canCustomizeColors: true,
    canRemoveWatermark: true,
    canWhiteLabel: true,
  },
};

interface BrandingContextValue {
  // Current branding configuration
  branding: BrandingConfig;

  // Subscription tier
  tier: SubscriptionPlan;
  tierInfo: typeof TIER_BRANDING[keyof typeof TIER_BRANDING];

  // Update functions (only work if tier allows)
  setCompanyName: (name: string) => boolean;
  setCompanyLogo: (logoUrl: string, lightLogoUrl?: string) => boolean;
  setColors: (primary: string, secondary?: string, accent?: string) => boolean;
  setCustomFooter: (text: string) => boolean;
  enableWhiteLabel: (enabled: boolean) => boolean;

  // Utility functions
  canCustomize: (feature: keyof BrandingConfig) => boolean;
  resetToDefault: () => void;
  exportBranding: () => BrandingConfig;

  // PDF-specific helpers
  getPDFBranding: () => {
    logo: string | undefined;
    watermark: boolean;
    footer: string;
    colors: { primary: string; secondary: string; accent: string };
  };
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

interface BrandingProviderProps {
  children: React.ReactNode;
  initialTier?: SubscriptionPlan;
  initialBranding?: Partial<BrandingConfig>;
}

export function BrandingProvider({
  children,
  initialTier = "free",
  initialBranding,
}: BrandingProviderProps) {
  const [tier, setTier] = useState<SubscriptionPlan>(initialTier);
  const [customBranding, setCustomBranding] = useState<Partial<BrandingConfig>>(
    initialBranding || {}
  );
  const [mounted, setMounted] = useState(false);

  // Load saved branding from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("deal-branding");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomBranding(parsed);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save branding to localStorage when it changes
  useEffect(() => {
    if (mounted && Object.keys(customBranding).length > 0) {
      localStorage.setItem("deal-branding", JSON.stringify(customBranding));
    }
  }, [customBranding, mounted]);

  // Compute final branding config
  const branding = useMemo<BrandingConfig>(() => {
    const tierCapabilities = TIER_CAPABILITIES[tier];
    return {
      ...DEFAULT_BRANDING,
      ...tierCapabilities,
      // Apply custom branding only if tier allows
      ...(tierCapabilities.canCustomizeLogo && customBranding.companyLogo
        ? { companyLogo: customBranding.companyLogo }
        : {}),
      ...(tierCapabilities.canCustomizeLogo && customBranding.companyLogoLight
        ? { companyLogoLight: customBranding.companyLogoLight }
        : {}),
      ...(tierCapabilities.canCustomizeLogo && customBranding.companyName
        ? { companyName: customBranding.companyName }
        : {}),
      ...(tierCapabilities.canCustomizeColors && customBranding.primaryColor
        ? { primaryColor: customBranding.primaryColor }
        : {}),
      ...(tierCapabilities.canCustomizeColors && customBranding.secondaryColor
        ? { secondaryColor: customBranding.secondaryColor }
        : {}),
      ...(tierCapabilities.canCustomizeColors && customBranding.accentColor
        ? { accentColor: customBranding.accentColor }
        : {}),
      ...(tierCapabilities.canWhiteLabel && customBranding.customFooterText
        ? { customFooterText: customBranding.customFooterText }
        : {}),
    };
  }, [tier, customBranding]);

  // Get tier info
  const tierInfo = useMemo(() => {
    const tierMap: Record<SubscriptionPlan, keyof typeof TIER_BRANDING> = {
      free: "freemium",
      pro: "pro",
      business: "enterprise",
      corporate: "enterprise",
    };
    return TIER_BRANDING[tierMap[tier]];
  }, [tier]);

  // Check if a feature can be customized
  const canCustomize = useCallback(
    (feature: keyof BrandingConfig): boolean => {
      const capabilities = TIER_CAPABILITIES[tier];
      switch (feature) {
        case "companyLogo":
        case "companyLogoLight":
        case "companyName":
          return capabilities.canCustomizeLogo || false;
        case "primaryColor":
        case "secondaryColor":
        case "accentColor":
          return capabilities.canCustomizeColors || false;
        case "showDealWatermark":
          return capabilities.canRemoveWatermark || false;
        case "isWhiteLabel":
        case "customFooterText":
        case "customDomain":
          return capabilities.canWhiteLabel || false;
        default:
          return false;
      }
    },
    [tier]
  );

  // Update company name
  const setCompanyName = useCallback(
    (name: string): boolean => {
      if (!canCustomize("companyName")) return false;
      setCustomBranding((prev) => ({ ...prev, companyName: name }));
      return true;
    },
    [canCustomize]
  );

  // Update company logo
  const setCompanyLogo = useCallback(
    (logoUrl: string, lightLogoUrl?: string): boolean => {
      if (!canCustomize("companyLogo")) return false;
      setCustomBranding((prev) => ({
        ...prev,
        companyLogo: logoUrl,
        ...(lightLogoUrl ? { companyLogoLight: lightLogoUrl } : {}),
      }));
      return true;
    },
    [canCustomize]
  );

  // Update colors
  const setColors = useCallback(
    (primary: string, secondary?: string, accent?: string): boolean => {
      if (!canCustomize("primaryColor")) return false;
      setCustomBranding((prev) => ({
        ...prev,
        primaryColor: primary,
        ...(secondary ? { secondaryColor: secondary } : {}),
        ...(accent ? { accentColor: accent } : {}),
      }));
      return true;
    },
    [canCustomize]
  );

  // Update custom footer
  const setCustomFooter = useCallback(
    (text: string): boolean => {
      if (!canCustomize("customFooterText")) return false;
      setCustomBranding((prev) => ({ ...prev, customFooterText: text }));
      return true;
    },
    [canCustomize]
  );

  // Enable/disable white-label
  const enableWhiteLabel = useCallback(
    (enabled: boolean): boolean => {
      if (!canCustomize("isWhiteLabel")) return false;
      setCustomBranding((prev) => ({ ...prev, isWhiteLabel: enabled }));
      return true;
    },
    [canCustomize]
  );

  // Reset to default branding
  const resetToDefault = useCallback(() => {
    setCustomBranding({});
    localStorage.removeItem("deal-branding");
  }, []);

  // Export current branding
  const exportBranding = useCallback((): BrandingConfig => {
    return { ...branding };
  }, [branding]);

  // Get PDF-specific branding
  const getPDFBranding = useCallback(() => {
    return {
      logo: branding.companyLogo,
      watermark: branding.showDealWatermark,
      footer: branding.customFooterText || (branding.showDealFooter ? "Powered by DEAL" : ""),
      colors: {
        primary: branding.primaryColor,
        secondary: branding.secondaryColor,
        accent: branding.accentColor,
      },
    };
  }, [branding]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <BrandingContext.Provider
      value={{
        branding,
        tier,
        tierInfo,
        setCompanyName,
        setCompanyLogo,
        setColors,
        setCustomFooter,
        enableWhiteLabel,
        canCustomize,
        resetToDefault,
        exportBranding,
        getPDFBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}

/**
 * Hook for PDF-specific branding
 */
export function usePDFBranding() {
  const { getPDFBranding, branding, tier } = useBranding();
  return {
    ...getPDFBranding(),
    tierBadge: tier !== "free" ? tier.toUpperCase() : null,
    showTierBadge: tier !== "corporate", // Corporate = full white-label
  };
}

/**
 * Hook to check if current tier supports a feature
 */
export function useCanBrand(feature: keyof BrandingConfig) {
  const { canCustomize } = useBranding();
  return canCustomize(feature);
}
