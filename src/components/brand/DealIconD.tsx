"use client";

import { cn } from "@/lib/utils";

interface DealIconDProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "primary" | "white" | "dark" | "gold";
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
      {/* Background Circle with gradient */}
      <defs>
        <linearGradient id={`dealGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.main} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`accentGradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.accent} />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Main Circle */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={`url(#dealGradient-${variant})`}
        stroke={colors.accent}
        strokeWidth="1.5"
      />

      {/* Letter D - Stylized */}
      <path
        d="M22 16H34C42.837 16 50 23.163 50 32C50 40.837 42.837 48 34 48H22V16Z"
        fill="none"
        stroke={variant === "white" ? "#FFFFFF" : colors.accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner D curve */}
      <path
        d="M26 20H34C40.627 20 46 25.373 46 32C46 38.627 40.627 44 34 44H26V20Z"
        fill={`url(#accentGradient-${variant})`}
        opacity="0.15"
      />

      {/* Vertical line accent */}
      <line
        x1="22"
        y1="16"
        x2="22"
        y2="48"
        stroke={variant === "white" ? "#FFFFFF" : colors.accent}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Small diamond accent */}
      <path
        d="M38 32L40 30L42 32L40 34L38 32Z"
        fill={variant === "white" ? "#FFFFFF" : colors.accent}
      />
    </svg>
  );
}
