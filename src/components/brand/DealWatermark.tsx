"use client";

import { cn } from "@/lib/utils";
import { BRAND_COLORS } from "./BrandConstants";

interface DealWatermarkProps {
  opacity?: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "primary" | "gold" | "gray";
}

const sizeMap = {
  sm: { width: 200, height: 200 },
  md: { width: 300, height: 300 },
  lg: { width: 400, height: 400 },
  xl: { width: 600, height: 600 },
};

const colorMap = {
  primary: BRAND_COLORS.primary.DEFAULT,
  gold: BRAND_COLORS.secondary.DEFAULT,
  gray: BRAND_COLORS.neutral.gray400,
};

/**
 * DealWatermark - Transparent watermark component for documents and PDFs
 * Use with absolute positioning overlaid on content
 */
export function DealWatermark({
  opacity = 0.08,
  size = "lg",
  className,
  variant = "primary",
}: DealWatermarkProps) {
  const dimensions = sizeMap[size];
  const color = colorMap[variant];

  return (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none select-none", className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Background Circle */}
      <circle cx="256" cy="256" r="240" fill={color} fillOpacity="0.3" />

      {/* Outer Ring */}
      <circle
        cx="256"
        cy="256"
        r="230"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeOpacity="0.5"
      />

      {/* Letter D - Outline */}
      <path
        d="M176 128H272C326.772 128 370 171.228 370 226V286C370 340.772 326.772 384 272 384H176V128Z"
        fill="none"
        stroke={color}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vertical line */}
      <line
        x1="176"
        y1="128"
        x2="176"
        y2="384"
        stroke={color}
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* Diamond accent */}
      <path
        d="M300 256L320 236L340 256L320 276L300 256Z"
        fill={color}
        fillOpacity="0.8"
      />
    </svg>
  );
}

/**
 * DealWatermarkOverlay - Full page watermark overlay
 * Use as a positioned container that covers the entire page
 */
export function DealWatermarkOverlay({
  opacity = 0.05,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      <DealWatermark opacity={opacity} size="xl" variant="primary" />
    </div>
  );
}

/**
 * DealWatermarkPattern - Repeating pattern watermark
 * Creates a tiled pattern across the container
 */
export function DealWatermarkPattern({
  opacity = 0.03,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
      aria-hidden="true"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231E3A5F' fill-opacity='${opacity}'%3E%3Cpath d='M35 25H50C58 25 65 32 65 40V60C65 68 58 75 50 75H35V25Z'/%3E%3Cline x1='35' y1='25' x2='35' y2='75' stroke='%231E3A5F' stroke-width='4'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "100px 100px",
      }}
    />
  );
}

export default DealWatermark;
