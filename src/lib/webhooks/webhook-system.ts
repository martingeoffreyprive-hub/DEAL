/**
 * Outgoing Webhook System
 * Sprint 19 — Story 11-4
 *
 * Dispatches events to user-configured webhook URLs with HMAC signing,
 * retry logic, and delivery logging.
 */

import { createHmac } from "crypto";

// ============================================================================
// Types
// ============================================================================

export type WebhookEventType =
  | "quote.created"
  | "quote.sent"
  | "quote.accepted"
  | "quote.rejected"
  | "quote.signed"
  | "lead.created"
  | "lead.updated"
  | "payment.received"
  | "subscription.changed";

export interface WebhookConfig {
  id: string;
  user_id: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: WebhookEventType;
  payload: unknown;
  status_code: number | null;
  response_body: string | null;
  success: boolean;
  attempt: number;
  delivered_at: string;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: unknown;
}

// ============================================================================
// HMAC Signature
// ============================================================================

export function generateWebhookSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateWebhookSignature(payload, secret);
  return expected === signature;
}

// ============================================================================
// Webhook Delivery
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s

export async function deliverWebhook(
  config: WebhookConfig,
  event: WebhookEventType,
  data: unknown
): Promise<WebhookDelivery> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);
  const signature = generateWebhookSignature(body, config.secret);

  let lastError: Error | null = null;
  let statusCode: number | null = null;
  let responseBody: string | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DEAL-Signature": `sha256=${signature}`,
          "X-DEAL-Event": event,
          "X-DEAL-Delivery": crypto.randomUUID(),
          "User-Agent": "DEAL-Webhooks/1.0",
        },
        body,
        signal: AbortSignal.timeout(10000),
      });

      statusCode = response.status;
      responseBody = await response.text().catch(() => null);

      if (response.ok) {
        return {
          id: crypto.randomUUID(),
          webhook_id: config.id,
          event_type: event,
          payload,
          status_code: statusCode,
          response_body: responseBody,
          success: true,
          attempt,
          delivered_at: new Date().toISOString(),
        };
      }

      lastError = new Error(`HTTP ${statusCode}`);
    } catch (error: any) {
      lastError = error;
    }

    // Wait before retry (except on last attempt)
    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt - 1]));
    }
  }

  return {
    id: crypto.randomUUID(),
    webhook_id: config.id,
    event_type: event,
    payload,
    status_code: statusCode,
    response_body: responseBody || lastError?.message || null,
    success: false,
    attempt: MAX_RETRIES,
    delivered_at: new Date().toISOString(),
  };
}

// ============================================================================
// Event Dispatcher
// ============================================================================

export async function dispatchWebhookEvent(
  webhooks: WebhookConfig[],
  event: WebhookEventType,
  data: unknown
): Promise<WebhookDelivery[]> {
  const activeWebhooks = webhooks.filter(
    (w) => w.active && w.events.includes(event)
  );

  if (activeWebhooks.length === 0) return [];

  const deliveries = await Promise.allSettled(
    activeWebhooks.map((w) => deliverWebhook(w, event, data))
  );

  return deliveries
    .filter((d): d is PromiseFulfilledResult<WebhookDelivery> => d.status === "fulfilled")
    .map((d) => d.value);
}

// ============================================================================
// Secret Generation
// ============================================================================

export function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
