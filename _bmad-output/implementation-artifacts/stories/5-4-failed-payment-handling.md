# Story 5.4: Failed Payment Handling

## Status: done

## Description
Les paiements échoués sont détectés et l'admin/utilisateur sont prévenus.

## Acceptance Criteria
- [x] `invoice.payment_failed` webhook → subscription status = "past_due"
- [x] Admin panel shows past_due subscriptions with user info
- [x] User sees banner "Payment failed — update payment method"
- [x] Link to Stripe portal to update payment method
- [x] After 3 failed attempts (Stripe default), subscription cancelled → downgrade
