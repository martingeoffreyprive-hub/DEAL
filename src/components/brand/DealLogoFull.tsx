"use client";

import { cn } from "@/lib/utils";

interface DealLogoFullProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "white" | "dark" | "light";
  className?: string;
  showTagline?: boolean;
}

const sizeMap = {
  xs: { width: 180, height: 24, fontSize: 14, taglineSize: 8, dotSize: 4 },
  sm: { width: 220, height: 32, fontSize: 18, taglineSize: 9, dotSize: 5 },
  md: { width: 280, height: 44, fontSize: 24, taglineSize: 10, dotSize: 6 },
  lg: { width: 340, height: 56, fontSize: 32, taglineSize: 12, dotSize: 8 },
  xl: { width: 420, height: 72, fontSize: 42, taglineSize: 14, dotSize: 10 },
};

// New DEAL brand colors
const colorMap = {
  primary: {
    text: "#FFFFFF",
    accent: "#E85A5A",
  },
  white: {
    text: "#FFFFFF",
    accent: "#E85A5A",
  },
  dark: {
    text: "#151833",
    accent: "#E85A5A",
  },
  light: {
    text: "#252B4A",
    accent: "#E85A5A",
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
  const totalHeight = showTagline ? dimensions.height + dimensions.taglineSize + 8 : dimensions.height;

  // Calculate dot position based on font size
  const dotX = dimensions.fontSize * 3.2; // After "DEAL" text
  const dotY = dimensions.height * 0.55;

  return (
    <svg
      width={dimensions.width}
      height={totalHeight}
      viewBox={`0 0 ${dimensions.width} ${totalHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DEAL - Votre voix a de la valeur"
    >
      {/* Main DEAL text - all same color */}
      <text
        x="0"
        y={dimensions.height * 0.75}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize={dimensions.fontSize}
        fontWeight="800"
        letterSpacing="0.08em"
        fill={colors.text}
      >
        DEAL
      </text>

      {/* Red dot after DEAL */}
      <circle
        cx={dotX}
        cy={dotY}
        r={dimensions.dotSize / 2}
        fill={colors.accent}
      />

      {/* Tagline */}
      {showTagline && (
        <text
          x="0"
          y={dimensions.height + dimensions.taglineSize + 4}
          fontFamily="Inter, system-ui, -apple-system, sans-serif"
          fontSize={dimensions.taglineSize}
          fontWeight="400"
          letterSpacing="0.02em"
          fill={colors.text}
          opacity="0.7"
        >
          Votre voix a de la valeur, Deal lui donne un prix
        </text>
      )}
    </svg>
  );
}
