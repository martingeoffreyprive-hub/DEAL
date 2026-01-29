# Story 5.3: Downgrade & Cancellation Flow

## Status: done

## Description
Les utilisateurs payants gèrent leur abonnement via le portail Stripe.

## Acceptance Criteria
- [x] "Manage subscription" button → Stripe Customer Portal
- [x] Downgrade → applied at period end (cancel_at_period_end)
- [x] Cancellation → webhook → status updated → downgrade to free at period end
- [x] User retains access until period end
- [x] Downgrade revokes features beyond free tier limits
