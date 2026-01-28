/**
 * Monitoring & Error Tracking Configuration
 * Sprint 8 - Epic 13: Monitoring Sentry
 */

// Sentry-like error tracking interface
// Replace with actual @sentry/nextjs when installed

interface ErrorContext {
  user?: {
    id: string;
    email?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
}

interface PerformanceSpan {
  name: string;
  op: string;
  startTime: number;
  endTime?: number;
  status?: string;
  data?: Record<string, unknown>;
}

class MonitoringService {
  private isInitialized = false;
  private dsn: string | null = null;
  private environment: string = "development";
  private release: string | null = null;
  private userId: string | null = null;
  private spans: Map<string, PerformanceSpan> = new Map();

  /**
   * Initialize monitoring
   */
  init(config: {
    dsn: string;
    environment?: string;
    release?: string;
    debug?: boolean;
  }) {
    if (this.isInitialized) {
      console.warn("[Monitoring] Already initialized");
      return;
    }

    this.dsn = config.dsn;
    this.environment = config.environment || process.env.NODE_ENV || "development";
    this.release = config.release || process.env.NEXT_PUBLIC_APP_VERSION || null;
    this.isInitialized = true;

    if (config.debug) {
      console.log("[Monitoring] Initialized", {
        environment: this.environment,
        release: this.release,
      });
    }

    // Set up global error handler
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        this.captureException(event.error);
      });

      window.addEventListener("unhandledrejection", (event) => {
        this.captureException(event.reason);
      });
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: { id: string; email?: string; name?: string } | null) {
    this.userId = user?.id || null;
    if (process.env.NODE_ENV === "development") {
      console.log("[Monitoring] User set:", user?.id);
    }
  }

  /**
   * Capture an exception
   */
  captureException(error: Error | unknown, context?: ErrorContext) {
    if (!this.isInitialized) return;

    const errorData = {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      user: context?.user || (this.userId ? { id: this.userId } : undefined),
      tags: context?.tags,
      extra: context?.extra,
      level: context?.level || "error",
    };

    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.error("[Monitoring] Exception captured:", errorData);
    }

    // TODO: Send to Sentry when configured
    // Sentry.captureException(error, { contexts: context });

    // For now, send to custom endpoint (can be replaced)
    this.sendToBackend("/api/monitoring/errors", errorData);
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, context?: ErrorContext) {
    if (!this.isInitialized) return;

    const messageData = {
      message,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      release: this.release,
      user: context?.user || (this.userId ? { id: this.userId } : undefined),
      tags: context?.tags,
      extra: context?.extra,
      level: context?.level || "info",
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[Monitoring] Message captured:", messageData);
    }

    this.sendToBackend("/api/monitoring/messages", messageData);
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: {
    category: string;
    message: string;
    level?: string;
    data?: Record<string, unknown>;
  }) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Monitoring] Breadcrumb:", breadcrumb);
    }
    // TODO: Add to Sentry breadcrumbs
  }

  /**
   * Start a performance span
   */
  startSpan(name: string, op: string): string {
    const spanId = `${name}-${Date.now()}`;
    this.spans.set(spanId, {
      name,
      op,
      startTime: performance.now(),
    });
    return spanId;
  }

  /**
   * End a performance span
   */
  endSpan(spanId: string, status = "ok", data?: Record<string, unknown>) {
    const span = this.spans.get(spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.status = status;
    span.data = data;

    const duration = span.endTime - span.startTime;

    if (process.env.NODE_ENV === "development") {
      console.log("[Monitoring] Span completed:", {
        name: span.name,
        op: span.op,
        duration: `${duration.toFixed(2)}ms`,
        status,
      });
    }

    // Report slow operations
    if (duration > 3000) {
      this.captureMessage(`Slow operation: ${span.name}`, {
        level: "warning",
        tags: { op: span.op },
        extra: { duration, ...data },
      });
    }

    this.spans.delete(spanId);
  }

  /**
   * Track a page view (for SPA navigation)
   */
  trackPageView(path: string) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Monitoring] Page view:", path);
    }
    // TODO: Send to Sentry transaction
  }

  /**
   * Send data to backend
   */
  private async sendToBackend(endpoint: string, data: unknown) {
    if (!this.dsn) return;

    try {
      // In production, this would send to Sentry
      // For now, we could send to our own API
      if (process.env.NODE_ENV === "production") {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {
          // Silent fail for monitoring
        });
      }
    } catch {
      // Silent fail
    }
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

// Note: React Error Boundary helper should be in a .tsx file
// Use monitoring.captureException() directly in your error boundaries

// Hook for tracking component errors
export function useErrorTracking() {
  return {
    captureException: (error: Error, context?: ErrorContext) => {
      monitoring.captureException(error, context);
    },
    captureMessage: (message: string, context?: ErrorContext) => {
      monitoring.captureMessage(message, context);
    },
    addBreadcrumb: (breadcrumb: {
      category: string;
      message: string;
      level?: string;
      data?: Record<string, unknown>;
    }) => {
      monitoring.addBreadcrumb(breadcrumb);
    },
  };
}

// Utility for wrapping async functions with error tracking
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  name: string
): T {
  return (async (...args: Parameters<T>) => {
    const spanId = monitoring.startSpan(name, "function");
    try {
      const result = await fn(...args);
      monitoring.endSpan(spanId, "ok");
      return result;
    } catch (error) {
      monitoring.endSpan(spanId, "error");
      monitoring.captureException(error, { tags: { function: name } });
      throw error;
    }
  }) as T;
}
