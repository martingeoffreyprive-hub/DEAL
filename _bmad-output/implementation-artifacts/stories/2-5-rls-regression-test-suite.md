# Story 2.5: RLS Regression Test Suite

## Status: done

## Description
Create an automated RLS test suite to verify data isolation on every deployment.

## Acceptance Criteria
- [ ] Test user A cannot read user B's quotes, leads, invoices, profiles
- [ ] Test organization member can read org quotes (correct role)
- [ ] Test viewer cannot create/update/delete resources
- [ ] Test service role can access all data (admin operations)
- [ ] Test public tables (plans, verified suppliers) accessible to anon
- [ ] Suite runnable in CI via `vitest`
