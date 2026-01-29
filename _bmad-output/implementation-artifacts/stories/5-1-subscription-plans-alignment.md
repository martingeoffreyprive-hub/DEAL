# Story 5.1: Subscription Plans Alignment

## Status: done

## Description
Vérifier que les 4 plans correspondent au PRD avec prix et limites corrects.

## Acceptance Criteria
- [x] Plans table seeded: free (0€), pro (29€), business (99€), corporate (custom)
- [x] Limits enforced: free=5 quotes/month+1 sector, pro=100+10, business=unlimited, corporate=unlimited
- [x] `can_create_quote()` function correctly checks quota per plan
- [x] `has_sector_access()` function correctly checks sector limits
- [x] Stripe price IDs mapped to plan names
- [x] Pricing page shows correct prices and feature comparison
