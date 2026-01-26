"use client";

import { cn } from "@/lib/utils";
import { DealIconD } from "./DealIconD";
import { DealLogoFull } from "./DealLogoFull";

interface DealLogoProps {
  type?: "icon" | "wordmark" | "combined";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "primary" | "white" | "dark" | "gold";
  className?: string;
  animated?: boolean;
  showTagline?: boolean;
}

export function DealLogo({
  type = "combined",
  size = "md",
  variant = "primary",
  className,
  animated = false,
  showTagline = false,
}: DealLogoProps) {
  // Icon only
  if (type === "icon") {
    return (
      <DealIconD
        size={size}
        variant={variant}
        className={className}
        animated={animated}
      />
    );
  }

  // Wordmark only
  if (type === "wordmark") {
    return (
      <DealLogoFull
        size={size === "2xl" ? "xl" : size}
        variant={variant}
        className={className}
        showTagline={showTagline}
      />
    );
  }

  // Combined (icon + wordmark)
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        animated && "transition-all duration-300 hover:opacity-90",
        className
      )}
    >
      <DealIconD
        size={size}
        variant={variant}
        animated={animated}
      />
      <DealLogoFull
        size={size === "2xl" ? "xl" : size}
        variant={variant}
        showTagline={showTagline}
      />
    </div>
  );
}

// Re-export individual components
export { DealIconD } from "./DealIconD";
export { DealLogoFull } from "./DealLogoFull";
