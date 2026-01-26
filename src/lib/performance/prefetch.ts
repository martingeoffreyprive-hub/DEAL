/**
 * Prefetch Utilities for Performance Optimization
 * Implements intelligent resource prefetching
 */

// Routes that should be prefetched on dashboard load
const PREFETCH_ROUTES = [
  "/quotes",
  "/quotes/new",
  "/profile",
  "/analytics",
  "/settings/subscription",
];

// Critical resources to preload
const CRITICAL_RESOURCES = [
  { href: "/fonts/inter-var.woff2", as: "font", type: "font/woff2" },
];

/**
 * Prefetch routes using the Navigation API
 */
export function prefetchRoutes(): void {
  if (typeof window === "undefined") return;

  // Use requestIdleCallback for non-blocking prefetch
  const prefetch = () => {
    PREFETCH_ROUTES.forEach((route) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = route;
      link.as = "document";
      document.head.appendChild(link);
    });
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 1000);
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === "undefined") return;

  CRITICAL_RESOURCES.forEach(({ href, as, type }) => {
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    if (as === "font") link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/**
 * Preconnect to external origins
 */
export function preconnectOrigins(): void {
  if (typeof window === "undefined") return;

  const origins = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ].filter(Boolean);

  origins.forEach((origin) => {
    if (!origin) return;

    const existing = document.querySelector(`link[href="${origin}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/**
 * Intersection Observer for lazy loading
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      });
    },
    {
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    }
  );
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check connection quality for adaptive loading
 */
export function getConnectionQuality(): "slow" | "medium" | "fast" {
  if (typeof navigator === "undefined") return "fast";

  const connection = (navigator as any).connection;
  if (!connection) return "fast";

  const effectiveType = connection.effectiveType;
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "slow";
  if (effectiveType === "3g") return "medium";
  return "fast";
}

/**
 * Should load high quality based on connection
 */
export function shouldLoadHighQuality(): boolean {
  const quality = getConnectionQuality();
  return quality === "fast";
}
