# Story 2.2: Auth Flow E2E Tests

## Status: done

## Description
Write E2E tests for all authentication flows so users can reliably sign up, log in, and recover access.

## Acceptance Criteria
- [ ] Registration flow: email/password → profile creation → onboarding redirect
- [ ] Login flow: email/password → dashboard redirect
- [ ] Forgot password flow: request → email → reset → login
- [ ] MFA flow: enable TOTP → login with code → disable
- [ ] Protected route redirect: unauthenticated → `/login`
- [ ] Admin route protection: non-admin email → 403
