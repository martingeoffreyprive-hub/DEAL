# Story 1.5: CORS Configuration Hardening

## Status: done

## Description
Verify CORS is correctly configured per endpoint so only authorized origins can access the API.

## Acceptance Criteria
- [ ] /api/widget/quote-request allows all origins (*) — required for widget
- [ ] /api/analytics/vitals allows all origins (*) — required for reporting
- [ ] All other API endpoints restrict to same-origin
- [ ] OPTIONS preflight handlers return correct headers
- [ ] Widget endpoint validates API key even with permissive CORS
