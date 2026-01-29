# Story 7-4: Database Query Optimization

## Status: done

## Description
Indexes PostgreSQL optimisés et fonctions RPC pour les requêtes critiques.

## Acceptance Criteria
- [x] Composite indexes on quotes (pagination, status, analytics, sector, search)
- [x] GIN full-text search indexes (French dictionary)
- [x] RPC functions (search_quotes, get_user_quote_stats, log_audit_event)
- [x] Performance metrics table with P75/P90 percentile RPC
- [x] Auto-cleanup of old performance metrics (30 days retention)
- [x] Subscription and usage stats indexes
