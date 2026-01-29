# Story 11-4: Webhook System

## Status: done

## Description
Système de webhooks sortants avec signature HMAC et retry.

## Acceptance Criteria
- [x] 9 webhook event types (quote.*, lead.*, payment.*, subscription.*)
- [x] HMAC SHA-256 signature generation and verification
- [x] Retry logic (3 attempts with exponential backoff)
- [x] Webhook delivery logging (status, attempt, response)
- [x] Event dispatcher for multiple webhook configs
- [x] Webhook secret generation
