# Story 6-3: Uptime Monitoring

## Status: done

## Description
Un health check endpoint vérifie la disponibilité de tous les services critiques.

## Acceptance Criteria
- [x] GET /api/health endpoint returning system status
- [x] Supabase connectivity check with latency measurement
- [x] Redis/Upstash connectivity check
- [x] Overall status (up/degraded/down) with individual check results
- [x] Web Vitals collection endpoint (POST /api/analytics/vitals)
- [x] Cache-Control: no-cache headers for monitoring accuracy
