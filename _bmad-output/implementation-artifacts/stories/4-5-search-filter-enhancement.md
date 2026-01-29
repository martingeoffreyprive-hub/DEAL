# Story 4.5: Search & Filter Enhancement

## Status: done

## Description
Recherche full-text et filtrage avancé pour retrouver rapidement les devis.

## Acceptance Criteria
- [x] Full-text search on client name, description, quote number
- [x] Filter by: status, sector, date range
- [x] Sort by: date, amount, client name, status
- [x] Pagination with 20 items per page
- [x] Search uses PostgreSQL GIN full-text index (french dictionary)
- [x] Results highlight matching terms
