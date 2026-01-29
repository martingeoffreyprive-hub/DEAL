# Story 8-3: Email Drip Campaign

## Status: done

## Description
Séquence email automatique pour l'onboarding (J0→J14).

## Acceptance Criteria
- [x] 5-email drip schedule (welcome, first_quote, ai_tips, upgrade, nps)
- [x] Conditional sending (quotesCount, plan, day offset)
- [x] HTML email templates with DEAL branding (French)
- [x] Provider-agnostic send (Resend/SendGrid)
- [x] Unsubscribe link in every email (GDPR)
- [x] shouldSendDrip logic with user preferences check
