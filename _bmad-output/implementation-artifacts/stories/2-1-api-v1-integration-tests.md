# Story 2.1: API v1 Integration Tests

## Status: done

## Description
Write integration tests for all public API v1 endpoints to ensure external integrations are reliable.

## Acceptance Criteria
- [ ] GET `/api/v1/quotes` — pagination, filtering by status
- [ ] POST `/api/v1/quotes` — creation with Zod validation, error cases
- [ ] GET `/api/v1/quotes/[id]` — found + 404 cases
- [ ] PATCH `/api/v1/quotes/[id]` — update + blocked on finalized
- [ ] DELETE `/api/v1/quotes/[id]` — delete + blocked on finalized
- [ ] API key auth tested (valid, invalid, revoked, wrong scope)
- [ ] Rate limiting tested (429 response)
