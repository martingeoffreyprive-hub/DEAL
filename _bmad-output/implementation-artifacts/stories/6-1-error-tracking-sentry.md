# Story 6-1: Error Tracking & Sentry Integration

## Status: done

## Description
Le monitoring d'erreurs est en place avec un service de tracking et une error boundary.

## Acceptance Criteria
- [x] MonitoringService class with captureException, captureMessage, addBreadcrumb
- [x] Global error boundary (error.tsx) with French localization
- [x] useErrorTracking hook for React components
- [x] withErrorTracking utility for async functions
- [x] Performance span tracking (startSpan/endSpan)
- [x] Global error handlers (window.error, unhandledrejection)
