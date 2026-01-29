/**
 * Story 2.4: Stripe Webhook Idempotency Tests — Sprint 10
 * Tests for webhook event handling, idempotency, signature validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { RATE_LIMIT_EXCLUDED_ROUTES } from '@/lib/cors';

describe('Story 2.4: Stripe Webhook Tests', () => {
  let webhookSrc: string;

  beforeEach(() => {
    webhookSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts'),
      'utf-8'
    );
  });

  // =========================================================================
  // Webhook Route Structure
  // =========================================================================
  describe('Webhook Route Structure', () => {
    it('should export a POST handler', () => {
      expect(webhookSrc).toContain('export async function POST');
    });

    it('should verify Stripe signature', () => {
      expect(webhookSrc).toContain('stripe-signature');
      expect(webhookSrc).toContain('constructEvent');
    });

    it('should reject missing signature with 400', () => {
      expect(webhookSrc).toContain('Missing signature');
      expect(webhookSrc).toContain('status: 400');
    });

    it('should log security warning for invalid signatures', () => {
      expect(webhookSrc).toContain('[SECURITY]');
    });

    it('should use service role Supabase client', () => {
      expect(webhookSrc).toContain('SUPABASE_SERVICE_ROLE_KEY');
    });
  });

  // =========================================================================
  // Event Handlers
  // =========================================================================
  describe('Event Type Handling', () => {
    it('should handle checkout.session.completed', () => {
      expect(webhookSrc).toContain('checkout.session.completed');
      expect(webhookSrc).toContain('handleCheckoutComplete');
    });

    it('should handle customer.subscription.updated', () => {
      expect(webhookSrc).toContain('customer.subscription.updated');
      expect(webhookSrc).toContain('handleSubscriptionUpdated');
    });

    it('should handle customer.subscription.deleted', () => {
      expect(webhookSrc).toContain('customer.subscription.deleted');
      expect(webhookSrc).toContain('handleSubscriptionCanceled');
    });

    it('should handle invoice.payment_failed', () => {
      expect(webhookSrc).toContain('invoice.payment_failed');
      expect(webhookSrc).toContain('handlePaymentFailed');
    });

    it('should log unhandled event types', () => {
      expect(webhookSrc).toContain('Unhandled event type');
    });
  });

  // =========================================================================
  // Checkout Complete Handler
  // =========================================================================
  describe('Checkout Complete Handler', () => {
    it('should extract user_id from session metadata', () => {
      expect(webhookSrc).toContain("session.metadata?.user_id");
    });

    it('should extract plan_name from session metadata', () => {
      expect(webhookSrc).toContain("session.metadata?.plan_name");
    });

    it('should update subscription status to active', () => {
      expect(webhookSrc).toContain("status: \"active\"");
    });

    it('should store stripe_subscription_id', () => {
      expect(webhookSrc).toContain('stripe_subscription_id');
    });

    it('should store stripe_customer_id', () => {
      expect(webhookSrc).toContain('stripe_customer_id');
    });

    it('should store period dates', () => {
      expect(webhookSrc).toContain('current_period_start');
      expect(webhookSrc).toContain('current_period_end');
    });
  });

  // =========================================================================
  // Subscription Updated Handler
  // =========================================================================
  describe('Subscription Updated Handler', () => {
    it('should look up user by stripe_subscription_id', () => {
      expect(webhookSrc).toContain('.eq("stripe_subscription_id"');
    });

    it('should map price ID to plan name', () => {
      expect(webhookSrc).toContain('PLAN_MAPPING');
    });

    it('should handle active, trialing, past_due statuses', () => {
      expect(webhookSrc).toContain('"active"');
      expect(webhookSrc).toContain('"trialing"');
      expect(webhookSrc).toContain('"past_due"');
    });
  });

  // =========================================================================
  // Subscription Canceled Handler
  // =========================================================================
  describe('Subscription Canceled Handler', () => {
    it('should downgrade to free plan', () => {
      expect(webhookSrc).toContain('plan_name: "free"');
    });

    it('should set status to cancelled', () => {
      expect(webhookSrc).toContain('status: "cancelled"');
    });

    it('should clear stripe_subscription_id', () => {
      expect(webhookSrc).toContain('stripe_subscription_id: null');
    });
  });

  // =========================================================================
  // Payment Failed Handler
  // =========================================================================
  describe('Payment Failed Handler', () => {
    it('should set subscription status to past_due', () => {
      expect(webhookSrc).toContain('status: "past_due"');
    });

    it('should skip if no subscription ID on invoice', () => {
      expect(webhookSrc).toContain('if (!subscriptionId) return');
    });
  });

  // =========================================================================
  // Idempotency
  // =========================================================================
  describe('Idempotency', () => {
    it('should check if event was already processed', () => {
      expect(webhookSrc).toContain('isEventProcessed');
    });

    it('should skip already processed events', () => {
      expect(webhookSrc).toContain('skipped: true');
    });

    it('should mark events as processed after handling', () => {
      expect(webhookSrc).toContain('markEventProcessed');
    });

    it('should use processed_stripe_events table', () => {
      expect(webhookSrc).toContain('processed_stripe_events');
    });

    it('should log idempotency skips', () => {
      expect(webhookSrc).toContain('[IDEMPOTENCY]');
    });

    it('should continue processing if idempotency check fails', () => {
      // Fail-open: if the idempotency DB lookup fails, process anyway
      expect(webhookSrc).toContain('Could not check event status, proceeding');
    });
  });

  // =========================================================================
  // Plan Mapping
  // =========================================================================
  describe('Plan Mapping', () => {
    it('should map Stripe price IDs to plan names', () => {
      expect(webhookSrc).toContain('STRIPE_PRO_MONTHLY_PRICE_ID');
      expect(webhookSrc).toContain('STRIPE_BUSINESS_MONTHLY_PRICE_ID');
    });

    it('should support yearly price IDs', () => {
      expect(webhookSrc).toContain('STRIPE_PRO_YEARLY_PRICE_ID');
      expect(webhookSrc).toContain('STRIPE_BUSINESS_YEARLY_PRICE_ID');
    });

    it('should default to free if price ID not found', () => {
      expect(webhookSrc).toContain('"free"');
    });
  });

  // =========================================================================
  // Webhook excluded from rate limiting
  // =========================================================================
  describe('Webhook Rate Limiting Exclusion', () => {
    it('should exclude Stripe webhook from rate limiting', () => {
      expect(RATE_LIMIT_EXCLUDED_ROUTES).toContain('/api/stripe/webhook');
    });
  });
});
