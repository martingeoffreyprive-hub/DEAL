/**
 * DealLogoForPDF - React-PDF compatible logo components
 * These components use @react-pdf/renderer primitives for PDF generation
 */

import { View, Text, Svg, Path, Circle, Line, G, Defs, LinearGradient, Stop } from "@react-pdf/renderer";
import { BRAND_COLORS, PDF_CONSTANTS } from "./BrandConstants";

interface LogoForPDFProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white" | "gold";
}

const sizeConfig = {
  sm: { width: 24, height: 24, viewBox: "0 0 64 64" },
  md: { width: 36, height: 36, viewBox: "0 0 64 64" },
  lg: { width: 48, height: 48, viewBox: "0 0 64 64" },
};

const colorConfig = {
  primary: {
    main: BRAND_COLORS.primary.DEFAULT,
    accent: BRAND_COLORS.secondary.DEFAULT,
    text: BRAND_COLORS.primary.DEFAULT,
  },
  white: {
    main: BRAND_COLORS.neutral.white,
    accent: BRAND_COLORS.secondary.DEFAULT,
    text: BRAND_COLORS.neutral.white,
  },
  gold: {
    main: BRAND_COLORS.secondary.DEFAULT,
    accent: BRAND_COLORS.primary.DEFAULT,
    text: BRAND_COLORS.secondary.DEFAULT,
  },
};

/**
 * DealIconForPDF - Simplified D icon for PDF documents
 */
export function DealIconForPDF({ size = "md", variant = "primary" }: LogoForPDFProps) {
  const config = sizeConfig[size];
  const colors = colorConfig[variant];

  return (
    <Svg width={config.width} height={config.height} viewBox={config.viewBox}>
      {/* Background Circle */}
      <Circle cx="32" cy="32" r="30" fill={colors.main} />

      {/* Outer ring */}
      <Circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke={colors.accent}
        strokeWidth="1.5"
      />

      {/* Letter D */}
      <Path
        d="M22 16H34C42.837 16 50 23.163 50 32C50 40.837 42.837 48 34 48H22V16Z"
        fill="none"
        stroke={variant === "primary" ? colors.accent : colors.main === BRAND_COLORS.neutral.white ? "#FFFFFF" : colors.accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vertical line */}
      <Line
        x1="22"
        y1="16"
        x2="22"
        y2="48"
        stroke={variant === "primary" ? colors.accent : colors.main === BRAND_COLORS.neutral.white ? "#FFFFFF" : colors.accent}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Diamond accent */}
      <Path
        d="M38 32L40 30L42 32L40 34L38 32Z"
        fill={variant === "primary" ? colors.accent : colors.main === BRAND_COLORS.neutral.white ? "#FFFFFF" : colors.accent}
      />
    </Svg>
  );
}

/**
 * DealWordmarkForPDF - DEAL text wordmark for PDF header
 */
export function DealWordmarkForPDF({
  fontSize = 16,
  variant = "primary",
}: {
  fontSize?: number;
  variant?: "primary" | "white" | "gold";
}) {
  const colors = colorConfig[variant];

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text
        style={{
          fontFamily: "Helvetica-Bold",
          fontSize,
          color: colors.accent,
          letterSpacing: 1,
        }}
      >
        D
      </Text>
      <Text
        style={{
          fontFamily: "Helvetica-Bold",
          fontSize,
          color: colors.text,
          letterSpacing: 1,
        }}
      >
        EAL
      </Text>
    </View>
  );
}

/**
 * DealLogoFullForPDF - Combined icon + wordmark for PDF headers
 */
export function DealLogoFullForPDF({
  size = "md",
  variant = "primary",
  showTagline = false,
}: LogoForPDFProps & { showTagline?: boolean }) {
  const iconSize = sizeConfig[size];
  const colors = colorConfig[variant];
  const fontSize = size === "sm" ? 12 : size === "md" ? 16 : 20;
  const taglineSize = size === "sm" ? 6 : size === "md" ? 8 : 10;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <DealIconForPDF size={size} variant={variant} />
      <View style={{ flexDirection: "column", gap: 2 }}>
        <DealWordmarkForPDF fontSize={fontSize} variant={variant} />
        {showTagline && (
          <Text
            style={{
              fontFamily: "Helvetica",
              fontSize: taglineSize,
              color: colors.text,
              opacity: 0.7,
              letterSpacing: 0.5,
            }}
          >
            Digital Estimate Platform
          </Text>
        )}
      </View>
    </View>
  );
}

/**
 * DealWatermarkForPDF - Watermark for PDF background
 * Use with absolute positioning on the Page component
 */
export function DealWatermarkForPDF({
  opacity = 0.05,
  size = 300,
}: {
  opacity?: number;
  size?: number;
}) {
  const viewBoxSize = 512;
  const color = BRAND_COLORS.primary.DEFAULT;

  return (
    <View
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-${size / 2}px, -${size / 2}px)`,
        opacity,
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
        {/* Background Circle */}
        <Circle cx="256" cy="256" r="240" fill={color} fillOpacity={0.3} />

        {/* Outer Ring */}
        <Circle
          cx="256"
          cy="256"
          r="230"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeOpacity={0.5}
        />

        {/* Letter D */}
        <Path
          d="M176 128H272C326.772 128 370 171.228 370 226V286C370 340.772 326.772 384 272 384H176V128Z"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vertical line */}
        <Line
          x1="176"
          y1="128"
          x2="176"
          y2="384"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Diamond */}
        <Path
          d="M300 256L320 236L340 256L320 276L300 256Z"
          fill={color}
          fillOpacity={0.8}
        />
      </Svg>
    </View>
  );
}

/**
 * DealFooterBadgeForPDF - "Powered by DEAL" badge for PDF footers
 */
export function DealFooterBadgeForPDF({
  variant = "primary",
}: {
  variant?: "primary" | "gold";
}) {
  const colors = colorConfig[variant];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: colors.main,
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          fontFamily: "Helvetica",
          fontSize: 7,
          color: BRAND_COLORS.neutral.white,
        }}
      >
        Powered by
      </Text>
      <Text
        style={{
          fontFamily: "Helvetica-Bold",
          fontSize: 8,
          color: colors.accent === BRAND_COLORS.primary.DEFAULT ? BRAND_COLORS.neutral.white : colors.accent,
        }}
      >
        DEAL
      </Text>
    </View>
  );
}

/**
 * DealSubscriptionBadgeForPDF - Subscription tier badge for PDFs
 */
export function DealSubscriptionBadgeForPDF({
  tier,
}: {
  tier: "freemium" | "starter" | "pro" | "enterprise";
}) {
  const tierColors = {
    freemium: { bg: BRAND_COLORS.neutral.gray200, text: BRAND_COLORS.neutral.gray600 },
    starter: { bg: "#DBEAFE", text: "#1D4ED8" },
    pro: { bg: "#FEF3C7", text: "#B45309" },
    enterprise: { bg: BRAND_COLORS.primary.DEFAULT, text: BRAND_COLORS.neutral.white },
  };

  const tierLabels = {
    freemium: "Freemium",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
  };

  const colors = tierColors[tier];

  return (
    <View
      style={{
        paddingHorizontal: 6,
        paddingVertical: 2,
        backgroundColor: colors.bg,
        borderRadius: 3,
      }}
    >
      <Text
        style={{
          fontFamily: "Helvetica-Bold",
          fontSize: 6,
          color: colors.text,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {tierLabels[tier]}
      </Text>
    </View>
  );
}

export default {
  Icon: DealIconForPDF,
  Wordmark: DealWordmarkForPDF,
  LogoFull: DealLogoFullForPDF,
  Watermark: DealWatermarkForPDF,
  FooterBadge: DealFooterBadgeForPDF,
  SubscriptionBadge: DealSubscriptionBadgeForPDF,
};
