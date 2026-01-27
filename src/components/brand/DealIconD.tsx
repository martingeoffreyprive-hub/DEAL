"use client";

import { cn } from "@/lib/utils";

interface DealIconDProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "primary" | "white" | "dark" | "light";
  className?: string;
  animated?: boolean;
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  "2xl": 96,
};

// New DEAL brand colors
const colorMap = {
  primary: {
    background: "#252B4A",
    letter: "#FFFFFF",
    accent: "#E85A5A",
  },
  white: {
    background: "#FFFFFF",
    letter: "#252B4A",
    accent: "#E85A5A",
  },
  dark: {
    background: "#151833",
    letter: "#FFFFFF",
    accent: "#E85A5A",
  },
  light: {
    background: "#F8FAFC",
    letter: "#252B4A",
    accent: "#E85A5A",
  },
};

export function DealIconD({
  size = "md",
  variant = "primary",
  className,
  animated = false,
}: DealIconDProps) {
  const dimension = sizeMap[size];
  const colors = colorMap[variant];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "shrink-0",
        animated && "transition-transform duration-300 hover:scale-110",
        className
      )}
      aria-label="DEAL Logo"
    >
      {/* Rounded square background */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill={colors.background}
      />

      {/* Letter D - main shape */}
      <path
        d="M18 16H32C41.941 16 50 24.059 50 34V34C50 43.941 41.941 52 32 52H18V16Z"
        fill="none"
        stroke={colors.letter}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vertical line of D */}
      <line
        x1="18"
        y1="16"
        x2="18"
        y2="52"
        stroke={colors.letter}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Red/Coral accent stripe */}
      <path
        d="M44 26C46.5 29 48 32 48 34C48 36 46.5 39 44 42"
        fill="none"
        stroke={colors.accent}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
