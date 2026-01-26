"use client";

// Skip Navigation Link for Accessibility (WCAG 2.1 AA)
// Allows keyboard users to skip directly to main content

import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SkipLink({
  href = "#main-content",
  className,
  children = "Aller au contenu principal",
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Visually hidden by default
        "sr-only",
        // Visible when focused
        "focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "font-medium text-sm",
        className
      )}
    >
      {children}
    </a>
  );
}

// Multiple skip links for complex layouts
export function SkipLinks() {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">
        Aller au contenu principal
      </SkipLink>
      <SkipLink href="#navigation" className="focus:top-14">
        Aller à la navigation
      </SkipLink>
    </div>
  );
}
