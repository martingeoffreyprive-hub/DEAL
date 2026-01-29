# Story 2.4: Stripe Webhook Idempotency Tests

## Status: done

## Description
Test Stripe webhook handling including idempotency so subscription state stays consistent.

## Acceptance Criteria
- [ ] `checkout.session.completed` → subscription created in DB
- [ ] `customer.subscription.updated` → plan change reflected
- [ ] `customer.subscription.deleted` → downgrade to free
- [ ] `invoice.payment_failed` → status updated
- [ ] Duplicate event ID → ignored (idempotency via `processed_stripe_events`)
- [ ] Invalid signature → 400 response
