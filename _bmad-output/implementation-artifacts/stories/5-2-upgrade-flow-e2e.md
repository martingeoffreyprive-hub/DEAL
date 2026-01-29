# Story 5.2: Upgrade Flow End-to-End

## Status: done

## Description
Un utilisateur free atteignant la limite peut upgrader vers Pro sans friction.

## Acceptance Criteria
- [x] Upgrade prompt shown when `can_create_quote()` returns false
- [x] "Upgrade" button → Stripe Checkout (card, Bancontact, iDEAL)
- [x] After payment → webhook → subscription created → plan updated in DB
- [x] User redirected back to DEAL with new plan active
- [x] Limits immediately lifted (no page refresh needed)
- [x] Confirmation email sent (via Stripe)
