/**
 * Analytics Configuration
 * Sprint 8 - Epic 13: Analytics PostHog
 */

// PostHog-like analytics interface
// Replace with actual posthog-js when installed

type Properties = Record<string, unknown>;

interface UserProperties {
  id: string;
  email?: string;
  name?: string;
  plan?: string;
  sector?: string;
  company?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface AnalyticsConfig {
  apiKey: string;
  apiHost?: string;
  autocapture?: boolean;
  persistence?: "localStorage" | "sessionStorage" | "memory";
  debug?: boolean;
}

class AnalyticsService {
  private isInitialized = false;
  private apiKey: string | null = null;
  private apiHost: string = "https://app.posthog.com";
  private debug = false;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private queue: Array<{ event: string; properties: Properties }> = [];

  /**
   * Initialize analytics
   */
  init(config: AnalyticsConfig) {
    if (this.isInitialized) {
      console.warn("[Analytics] Already initialized");
      return;
    }

    this.apiKey = config.apiKey;
    this.apiHost = config.apiHost || "https://app.posthog.com";
    this.debug = config.debug || false;
    this.sessionId = this.generateSessionId();
    this.isInitialized = true;

    if (this.debug) {
      console.log("[Analytics] Initialized", { apiHost: this.apiHost });
    }

    // Process queued events
    this.flushQueue();

    // Set up page view tracking
    if (typeof window !== "undefined" && config.autocapture !== false) {
      this.trackPageView();

      // Track navigation changes
      window.addEventListener("popstate", () => this.trackPageView());
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, properties?: UserProperties) {
    this.userId = userId;

    const event = {
      event: "$identify",
      properties: {
        distinct_id: userId,
        $set: properties,
        ...this.getDefaultProperties(),
      },
    };

    this.track("$identify", event.properties);

    if (this.debug) {
      console.log("[Analytics] User identified:", userId, properties);
    }
  }

  /**
   * Reset user (on logout)
   */
  reset() {
    this.userId = null;
    this.sessionId = this.generateSessionId();

    if (this.debug) {
      console.log("[Analytics] User reset");
    }
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Properties) {
    const eventData = {
      event: eventName,
      properties: {
        ...this.getDefaultProperties(),
        ...properties,
      },
    };

    if (!this.isInitialized) {
      this.queue.push(eventData);
      return;
    }

    if (this.debug) {
      console.log("[Analytics] Event tracked:", eventName, eventData.properties);
    }

    // Send to backend
    this.sendEvent(eventData);
  }

  /**
   * Track a page view
   */
  trackPageView(path?: string) {
    const currentPath = path || (typeof window !== "undefined" ? window.location.pathname : "/");

    this.track("$pageview", {
      $current_url: typeof window !== "undefined" ? window.location.href : undefined,
      $pathname: currentPath,
      $referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }

  /**
   * Capture feature flag evaluation
   */
  captureFeatureFlag(flagKey: string, value: boolean | string) {
    this.track("$feature_flag_called", {
      $feature_flag: flagKey,
      $feature_flag_response: value,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Properties) {
    if (!this.userId) {
      console.warn("[Analytics] Cannot set properties without identifying user first");
      return;
    }

    this.track("$set", {
      $set: properties,
    });
  }

  /**
   * Group users (for B2B)
   */
  group(groupType: string, groupKey: string, properties?: Properties) {
    this.track("$groupidentify", {
      $group_type: groupType,
      $group_key: groupKey,
      $group_set: properties,
    });
  }

  // ============================================
  // DEAL-Specific Event Helpers
  // ============================================

  /**
   * Track quote creation
   */
  trackQuoteCreated(quoteData: {
    quoteId: string;
    sector: string;
    itemCount: number;
    total: number;
    creationMethod: "manual" | "ai" | "template" | "scanner";
  }) {
    this.track("quote_created", {
      quote_id: quoteData.quoteId,
      sector: quoteData.sector,
      item_count: quoteData.itemCount,
      total_amount: quoteData.total,
      creation_method: quoteData.creationMethod,
    });
  }

  /**
   * Track quote sent
   */
  trackQuoteSent(quoteData: {
    quoteId: string;
    sendMethod: "email" | "link" | "pdf";
    total: number;
  }) {
    this.track("quote_sent", {
      quote_id: quoteData.quoteId,
      send_method: quoteData.sendMethod,
      total_amount: quoteData.total,
    });
  }

  /**
   * Track quote signed
   */
  trackQuoteSigned(quoteData: {
    quoteId: string;
    total: number;
    daysToSign: number;
  }) {
    this.track("quote_signed", {
      quote_id: quoteData.quoteId,
      total_amount: quoteData.total,
      days_to_sign: quoteData.daysToSign,
    });
  }

  /**
   * Track AI generation
   */
  trackAIGeneration(data: {
    type: "quote" | "description" | "price";
    sector: string;
    tokensUsed: number;
    success: boolean;
  }) {
    this.track("ai_generation", {
      generation_type: data.type,
      sector: data.sector,
      tokens_used: data.tokensUsed,
      success: data.success,
    });
  }

  /**
   * Track subscription event
   */
  trackSubscription(data: {
    action: "started" | "upgraded" | "downgraded" | "cancelled";
    plan: string;
    previousPlan?: string;
    mrr?: number;
  }) {
    this.track("subscription_" + data.action, {
      plan: data.plan,
      previous_plan: data.previousPlan,
      mrr: data.mrr,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, details?: Properties) {
    this.track("feature_used", {
      feature_name: feature,
      ...details,
    });
  }

  /**
   * Track onboarding progress
   */
  trackOnboarding(step: string, completed: boolean) {
    this.track("onboarding_step", {
      step_name: step,
      completed,
    });
  }

  // ============================================
  // Internal Methods
  // ============================================

  private getDefaultProperties(): Properties {
    return {
      distinct_id: this.userId || this.sessionId,
      $session_id: this.sessionId,
      $lib: "deal-analytics",
      $lib_version: "1.0.0",
      timestamp: new Date().toISOString(),
      ...(typeof window !== "undefined" && {
        $screen_height: window.screen.height,
        $screen_width: window.screen.width,
        $viewport_height: window.innerHeight,
        $viewport_width: window.innerWidth,
        $browser: this.getBrowser(),
        $device_type: this.getDeviceType(),
      }),
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getBrowser(): string {
    if (typeof navigator === "undefined") return "unknown";
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Other";
  }

  private getDeviceType(): string {
    if (typeof window === "undefined") return "unknown";
    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  private flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  private async sendEvent(eventData: { event: string; properties: Properties }) {
    if (!this.apiKey) return;

    try {
      // In production, send to PostHog
      if (process.env.NODE_ENV === "production") {
        await fetch(`${this.apiHost}/capture/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: this.apiKey,
            ...eventData,
          }),
        }).catch(() => {
          // Silent fail for analytics
        });
      }
    } catch {
      // Silent fail
    }
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    track: (event: string, properties?: Properties) => analytics.track(event, properties),
    identify: (userId: string, properties?: UserProperties) => analytics.identify(userId, properties),
    trackPageView: (path?: string) => analytics.trackPageView(path),
    trackQuoteCreated: analytics.trackQuoteCreated.bind(analytics),
    trackQuoteSent: analytics.trackQuoteSent.bind(analytics),
    trackQuoteSigned: analytics.trackQuoteSigned.bind(analytics),
    trackAIGeneration: analytics.trackAIGeneration.bind(analytics),
    trackSubscription: analytics.trackSubscription.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackOnboarding: analytics.trackOnboarding.bind(analytics),
  };
}

// Export for direct use
export const {
  track,
  identify,
  trackPageView,
} = {
  track: analytics.track.bind(analytics),
  identify: analytics.identify.bind(analytics),
  trackPageView: analytics.trackPageView.bind(analytics),
};
