"use client";

import { useEffect } from "react";

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  navigationType: string;
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 200, poor: 500 },  // Time to First Byte
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint
};

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

export function WebVitals() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Dynamically import web-vitals to avoid SSR issues
    import("web-vitals").then(({ onCLS, onFID, onLCP, onFCP, onTTFB, onINP }) => {
      const handleMetric = (metric: any) => {
        const rating = getRating(metric.name, metric.value);

        // Log to console in development
        if (process.env.NODE_ENV === "development") {
          const color = rating === "good" ? "green" : rating === "needs-improvement" ? "orange" : "red";
          console.log(
            `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`,
            `color: ${color}; font-weight: bold;`
          );
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === "production") {
          sendToAnalytics({
            id: metric.id,
            name: metric.name,
            value: metric.value,
            rating,
            delta: metric.delta,
            navigationType: metric.navigationType || "navigate",
          });
        }
      };

      // Register all vital metrics
      onCLS(handleMetric);
      onFID(handleMetric);
      onLCP(handleMetric);
      onFCP(handleMetric);
      onTTFB(handleMetric);
      onINP(handleMetric);
    }).catch(() => {
      // web-vitals not available, skip silently
    });
  }, []);

  return null;
}

async function sendToAnalytics(metric: WebVitalsMetric) {
  try {
    // Beacon API for reliable delivery even on page unload
    const body = JSON.stringify({
      ...metric,
      url: window.location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType || "unknown",
    });

    // Use sendBeacon for non-blocking delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/vitals", body);
    } else {
      // Fallback to fetch
      fetch("/api/analytics/vitals", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Silently fail - analytics shouldn't break the app
  }
}

// Hook for programmatic access to performance metrics
export function usePerformanceMetrics() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Track Long Tasks (tasks > 50ms that block main thread)
    if ("PerformanceObserver" in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              console.warn(`[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ["longtask"] });

        return () => longTaskObserver.disconnect();
      } catch {
        // Long task observation not supported
      }
    }
  }, []);
}

// Component to show performance overlay in development
export function PerformanceOverlay() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs p-2 rounded font-mono">
      <div className="text-[#C9A962] font-bold mb-1">Performance Monitor</div>
      <div id="perf-lcp">LCP: --</div>
      <div id="perf-fid">FID: --</div>
      <div id="perf-cls">CLS: --</div>
      <div id="perf-ttfb">TTFB: --</div>
    </div>
  );
}
