# Story 3.1: Sector Selection Onboarding

## Status: done

## Description
After registration, redirect to `/onboarding` for sector selection with plan-based limits.

## Acceptance Criteria
- [x] After registration, redirect to `/onboarding`
- [x] Sector selection screen shows 27 sectors with icons/descriptions
- [x] Selected sector saved to `profiles.default_sector`
- [x] Free plan users limited to 1 sector (show upgrade prompt for more)
- [x] Sector unlocked in `user_sectors` table
- [x] Skip option available (defaults to AUTRE)
