# Story 7-3: PDF Generation Performance

## Status: done

## Description
Génération PDF optimisée avec cache LRU et densité adaptative.

## Acceptance Criteria
- [x] In-memory LRU cache (10MB per user, 30min TTL)
- [x] Content hash-based cache invalidation
- [x] Adaptive density (compact/normal/detailed) based on item count
- [x] SEPA EPC QR code generation for payments
- [x] Client-side rendering with @react-pdf/renderer
- [x] PDF API route with redirection to client-side generation
