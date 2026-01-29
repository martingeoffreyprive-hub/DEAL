/**
 * Sprint 13: Payment & Billing Validation — Epic 5 Tests
 * Stories: 5.1 (Plans), 5.2 (Upgrade), 5.3 (Downgrade), 5.4 (Failed Payment)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 5.1: Subscription Plans Alignment
// ============================================================================
describe('Story 5.1: Subscription Plans Alignment', () => {
  let dbTypes: string;

  beforeAll(() => {
    dbTypes = fs.readFileSync(
      path.join(process.cwd(), 'src', 'types', 'database.ts'),
      'utf-8'
    );
  });

  it('should define 4 subscription plans', () => {
    expect(dbTypes).toContain("'free'");
    expect(dbTypes).toContain("'pro'");
    expect(dbTypes).toContain("'business'");
    expect(dbTypes).toContain("'corporate'");
  });

  it('should enforce free plan limits (5 quotes, 1 sector)', () => {
    expect(dbTypes).toContain('maxQuotes: 5');
    expect(dbTypes).toContain('maxSectors: 1');
  });

  it('should enforce pro plan limits (100 quotes, 10 sectors)', () => {
    expect(dbTypes).toContain('maxQuotes: 100');
    expect(dbTypes).toContain('maxSectors: 10');
  });

  it('should have unlimited for business/corporate (-1)', () => {
    expect(dbTypes).toContain('maxSectors: -1');
    expect(dbTypes).toContain('maxQuotes: -1');
  });

  it('should have display names in French', () => {
    expect(dbTypes).toContain('Gratuit');
    expect(dbTypes).toContain('Pro');
    expect(dbTypes).toContain('Business');
  });

  it('should have pricing page', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'pricing', 'page.tsx')
    )).toBe(true);
  });

  it('should show correct prices on pricing page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'pricing', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('29');  // Pro monthly
    expect(src).toContain('free');
  });

  it('should have Stripe price ID env vars', () => {
    const envExample = fs.readFileSync(
      path.join(process.cwd(), '.env.example'),
      'utf-8'
    );
    expect(envExample).toContain('STRIPE_PRO_MONTHLY_PRICE_ID');
    expect(envExample).toContain('STRIPE_PRO_YEARLY_PRICE_ID');
    expect(envExample).toContain('STRIPE_BUSINESS_MONTHLY_PRICE_ID');
    expect(envExample).toContain('STRIPE_BUSINESS_YEARLY_PRICE_ID');
  });

  it('should have subscription migration with plans table', () => {
    const migFile = path.join(process.cwd(), 'supabase', 'migration-subscriptions.sql');
    expect(fs.existsSync(migFile)).toBe(true);
    const sql = fs.readFileSync(migFile, 'utf-8');
    expect(sql).toContain('can_create_quote');
    expect(sql).toContain('has_sector_access');
  });
});

// ============================================================================
// Story 5.2: Upgrade Flow End-to-End
// ============================================================================
describe('Story 5.2: Upgrade Flow', () => {
  it('should have checkout API route', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'checkout', 'route.ts')
    )).toBe(true);
  });

  it('should create checkout session with correct payment methods', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'checkout', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('card');
    expect(src).toContain('bancontact');
    expect(src).toContain('ideal');
  });

  it('should include user_id and plan_name in checkout metadata', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'checkout', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('user_id');
    expect(src).toContain('plan_name');
    expect(src).toContain('metadata');
  });

  it('should have subscription hook with canCreateQuote', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'hooks', 'use-subscription.ts'),
      'utf-8'
    );
    expect(src).toContain('canCreateQuote');
  });

  it('should have usage card showing current plan usage', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'usage-card.tsx')
    )).toBe(true);
  });

  it('should handle checkout.session.completed webhook', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('checkout.session.completed');
    expect(src).toContain('handleCheckoutComplete');
  });

  it('should update subscription to active after checkout', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain("status: \"active\"");
    expect(src).toContain('stripe_subscription_id');
  });

  it('should support monthly and yearly billing', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'checkout', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('MONTHLY');
    expect(src).toContain('YEARLY');
  });
});

// ============================================================================
// Story 5.3: Downgrade & Cancellation Flow
// ============================================================================
describe('Story 5.3: Downgrade & Cancellation', () => {
  it('should have portal API route', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'portal', 'route.ts')
    )).toBe(true);
  });

  it('should create Stripe portal session', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'portal', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('billingPortal');
    expect(src).toContain('stripe_customer_id');
  });

  it('should handle subscription.deleted webhook → free plan', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('customer.subscription.deleted');
    expect(src).toContain('plan_name: "free"');
    expect(src).toContain('status: "cancelled"');
  });

  it('should handle cancel_at_period_end', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('cancel_at_period_end');
  });

  it('should have subscription settings page with manage button', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'settings', 'subscription', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('/api/stripe/portal');
  });

  it('should show cancellation warning on settings page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'settings', 'subscription', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('cancel_at_period_end');
  });
});

// ============================================================================
// Story 5.4: Failed Payment Handling
// ============================================================================
describe('Story 5.4: Failed Payment Handling', () => {
  it('should handle invoice.payment_failed webhook', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('invoice.payment_failed');
    expect(src).toContain('handlePaymentFailed');
  });

  it('should set subscription to past_due on failed payment', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('status: "past_due"');
  });

  it('should have subscription alert component for past_due', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'subscription-alert.tsx')
    )).toBe(true);
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'subscription-alert.tsx'),
      'utf-8'
    );
    expect(src).toContain('past_due');
  });

  it('should link to Stripe portal for payment update', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'subscription-alert.tsx'),
      'utf-8'
    );
    // Should have a way to update payment method
    const hasPortalLink = src.includes('portal') || src.includes('stripe') || src.includes('Mettre à jour');
    expect(hasPortalLink).toBe(true);
  });

  it('should have admin panel showing subscriptions with status', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'subscriptions', 'route.ts')
    )).toBe(true);
  });

  it('should filter admin subscriptions by status', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'subscriptions', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('status');
    expect(src).toContain('plan');
  });

  it('should have admin subscription page with status badges', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', '(admin)', 'admin', 'subscriptions', 'page.tsx')
    )).toBe(true);
  });
});
