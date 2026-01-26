"use client";

import { cn } from "@/lib/utils";

interface DealLogoFullProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "white" | "dark" | "gold";
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  xs: { width: 80, height: 24, fontSize: 14, taglineSize: 8 },
  sm: { width: 100, height: 32, fontSize: 18, taglineSize: 9 },
  md: { width: 140, height: 44, fontSize: 24, taglineSize: 10 },
  lg: { width: 180, height: 56, fontSize: 32, taglineSize: 12 },
  xl: { width: 240, height: 72, fontSize: 42, taglineSize: 14 },
};

const colorMap = {
  primary: {
    main: "#1E3A5F",
    accent: "#C9A962",
  },
  white: {
    main: "#FFFFFF",
    accent: "#C9A962",
  },
  dark: {
    main: "#0D1B2A",
    accent: "#C9A962",
  },
  gold: {
    main: "#C9A962",
    accent: "#1E3A5F",
  },
};

export function DealLogoFull({
  size = "md",
  variant = "primary",
  className,
  showTagline = false,
}: DealLogoFullProps) {
  const dimensions = sizeMap[size];
  const colors = colorMap[variant];
  const totalHeight = showTagline ? dimensions.height + dimensions.taglineSize + 4 : dimensions.height;

  return (
    <svg
      width={dimensions.width}
      height={totalHeight}
      viewBox={`0 0 ${dimensions.width} ${totalHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DEAL - Devis Enterprise Automatisés en Ligne"
    >
      <defs>
        <linearGradient id={`wordmarkGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.main} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Main DEAL text */}
      <text
        x="0"
        y={dimensions.height * 0.75}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize={dimensions.fontSize}
        fontWeight="700"
        letterSpacing="0.05em"
        fill={`url(#wordmarkGradient-${variant})`}
      >
        <tspan fill={colors.accent}>D</tspan>
        <tspan fill={colors.main}>EAL</tspan>
      </text>

      {/* Underline accent */}
      <rect
        x="0"
        y={dimensions.height * 0.85}
        width={dimensions.width * 0.3}
        height="2"
        rx="1"
        fill={colors.accent}
      />

      {/* Tagline */}
      {showTagline && (
        <text
          x="0"
          y={dimensions.height + dimensions.taglineSize + 2}
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          fontSize={dimensions.taglineSize}
          fontWeight="400"
          letterSpacing="0.02em"
          fill={colors.main}
          opacity="0.7"
        >
          Devis Enterprise Automatisés
        </text>
      )}
    </svg>
  );
}
