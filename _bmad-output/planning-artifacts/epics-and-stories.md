---
status: complete
date: 2026-01-29
version: 3.0
source:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
context: Brownfield MVP 84% built, pre-launch, targeting 50 users month 1
---

# DEAL — Epics & Stories v3.0

## Overview

| Phase | Epic | Priority | Status | Stories |
|---|---|---|---|---|
| 1 - Stabilization | Epic 1: Security Hardening | Must | To Do | 5 |
| 1 - Stabilization | Epic 2: Testing & Quality | Must | To Do | 5 |
| 2 - Launch Readiness | Epic 3: Onboarding & First Run | Must | To Do | 5 |
| 2 - Launch Readiness | Epic 4: Core UX Polish | Must | To Do | 5 |
| 2 - Launch Readiness | Epic 5: Payment & Billing Validation | Must | To Do | 4 |
| 3 - Launch | Epic 6: Monitoring & Observability | Should | To Do | 4 |
| 3 - Launch | Epic 7: Performance Optimization | Should | To Do | 4 |
| 4 - Growth | Epic 8: Guided Onboarding v2 | Should | To Do | 4 |
| 4 - Growth | Epic 9: Acquisition & Retention | Should | To Do | 5 |
| 5 - Scale | Epic 10: Localization (NL/DE) | Could | To Do | 3 |
| 5 - Scale | Epic 11: Advanced Integrations | Could | To Do | 4 |
| **Total** | | | | **48** |

---

## Phase 1: Stabilization (Pre-launch Critical)

### Epic 1: Security Hardening

**Goal:** Ensure the platform is secure before any user touches it.
**Risk mitigated:** RT5 (RLS flaw), RT1 (API abuse)
**PRD refs:** F3.1–F3.7, NFR2.1–NFR2.9

#### Story 1.1: RLS Policy Audit

**As a** security engineer
**I want to** systematically audit all RLS policies across 38 tables
**So that** no data leakage is possible between users

**Acceptance Criteria:**
- [ ] Every table with RLS enabled has at least one policy per operation (SELECT, INSERT, UPDATE, DELETE)
- [ ] No table allows cross-user data access (test with 2 different user sessions)
- [ ] Admin bypass via service role confirmed working on admin endpoints
- [ ] `processed_stripe_events` confirmed inaccessible to anon/authenticated roles
- [ ] Organization-scoped tables (quotes with org_id, api_keys) tested with member/viewer roles
- [ ] Test script created and documented for regression

**Technical Notes:**
- Query `pg_policies` system view for completeness check
- Test each RLS pattern: user isolation, parent relation, multi-tenant, public read, service-only

---

#### Story 1.2: Rate Limiting Validation

**As a** backend developer
**I want to** validate all 4 rate limiting tiers are enforced
**So that** the API is protected against abuse

**Acceptance Criteria:**
- [ ] General tier: 100 req/min on all `/api/*` endpoints → returns 429 after limit
- [ ] AI tier: 10 req/min on `/api/generate` and `/api/ai-assistant` → returns 429
- [ ] Auth tier: 5 req/15min on `/login`, `/register`, `/forgot-password` → returns 429
- [ ] API v1 tier: 100 req/min on `/api/v1/*` → returns 429
- [ ] `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers present
- [ ] Upstash Redis connection verified in production environment

---

#### Story 1.3: Security Headers Verification

**As a** security engineer
**I want to** verify all security headers are correctly set in production
**So that** common web attacks are mitigated

**Acceptance Criteria:**
- [ ] `X-Frame-Options: DENY` present on all responses
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains` present
- [ ] `Content-Security-Policy` configured and not blocking legitimate resources
- [ ] `X-Content-Type-Options: nosniff` present
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` present
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=()` present
- [ ] Verified via securityheaders.com or similar scanner

---

#### Story 1.4: Secrets Audit

**As a** DevOps engineer
**I want to** audit all environment variables and secrets
**So that** no credentials are exposed in source code or logs

**Acceptance Criteria:**
- [ ] No secrets in source code (grep for API keys, passwords, tokens)
- [ ] All 15+ env vars documented and present in Vercel
- [ ] `.env.local` in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used server-side (never in `NEXT_PUBLIC_*`)
- [ ] `ENCRYPTION_KEY` for AES-256 properly generated (32 bytes)
- [ ] `ADMIN_EMAILS` whitelist configured correctly

---

#### Story 1.5: CORS Configuration Hardening

**As a** backend developer
**I want to** verify CORS is correctly configured per endpoint
**So that** only authorized origins can access the API

**Acceptance Criteria:**
- [ ] `/api/widget/quote-request` allows all origins (`*`) — required for widget embedding
- [ ] `/api/analytics/vitals` allows all origins (`*`) — required for client-side reporting
- [ ] All other API endpoints restrict to same-origin (default Next.js)
- [ ] OPTIONS preflight handlers return correct headers
- [ ] Widget endpoint validates API key even with permissive CORS

---

### Epic 2: Testing & Quality

**Goal:** Achieve > 80% test coverage on critical endpoints before launch.
**Risk mitigated:** RB5 (bus factor), NFR6.2
**PRD refs:** NFR6.1–NFR6.6

#### Story 2.1: API v1 Integration Tests

**As a** developer
**I want to** write integration tests for all public API v1 endpoints
**So that** external integrations are reliable

**Acceptance Criteria:**
- [ ] GET `/api/v1/quotes` — pagination, filtering by status
- [ ] POST `/api/v1/quotes` — creation with Zod validation, error cases
- [ ] GET `/api/v1/quotes/[id]` — found + 404 cases
- [ ] PATCH `/api/v1/quotes/[id]` — update + blocked on finalized
- [ ] DELETE `/api/v1/quotes/[id]` — delete + blocked on finalized
- [ ] API key auth tested (valid, invalid, revoked, wrong scope)
- [ ] Rate limiting tested (429 response)

---

#### Story 2.2: Auth Flow E2E Tests

**As a** developer
**I want to** write E2E tests for all authentication flows
**So that** users can reliably sign up, log in, and recover access

**Acceptance Criteria:**
- [ ] Registration flow: email/password → profile creation → onboarding redirect
- [ ] Login flow: email/password → dashboard redirect
- [ ] Forgot password flow: request → email → reset → login
- [ ] MFA flow: enable TOTP → login with code → disable
- [ ] Protected route redirect: unauthenticated → `/login`
- [ ] Admin route protection: non-admin email → 403

---

#### Story 2.3: Quote Generation E2E Tests

**As a** developer
**I want to** write E2E tests for the core quote generation flow
**So that** the primary user journey is validated

**Acceptance Criteria:**
- [ ] AI generation: paste transcription → generate → verify structured output
- [ ] Manual creation: step-by-step form → save as draft
- [ ] Edit quote: modify items, prices, client info → recalculate totals
- [ ] Duplicate quote: create copy → verify new quote number
- [ ] PDF export: generate → download → verify file exists
- [ ] Status workflow: draft → sent → accepted (state transitions)

---

#### Story 2.4: Stripe Webhook Idempotency Tests

**As a** developer
**I want to** test Stripe webhook handling including idempotency
**So that** subscription state stays consistent

**Acceptance Criteria:**
- [ ] `checkout.session.completed` → subscription created in DB
- [ ] `customer.subscription.updated` → plan change reflected
- [ ] `customer.subscription.deleted` → downgrade to free
- [ ] `invoice.payment_failed` → status updated
- [ ] Duplicate event ID → ignored (idempotency via `processed_stripe_events`)
- [ ] Invalid signature → 400 response

---

#### Story 2.5: RLS Regression Test Suite

**As a** developer
**I want to** create an automated RLS test suite
**So that** data isolation is verified on every deployment

**Acceptance Criteria:**
- [ ] Test user A cannot read user B's quotes, leads, invoices, profiles
- [ ] Test organization member can read org quotes (correct role)
- [ ] Test viewer cannot create/update/delete resources
- [ ] Test service role can access all data (admin operations)
- [ ] Test public tables (plans, verified suppliers) accessible to anon
- [ ] Suite runnable in CI via `vitest`

---

## Phase 2: Launch Readiness

### Epic 3: Onboarding & First Run

**Goal:** A new artisan creates their first AI quote in < 5 minutes.
**Risk mitigated:** RB1 (adoption), RP2 (UX complexity)
**PRD refs:** F9.1–F9.5, User Success criteria

#### Story 3.1: Sector Selection Onboarding

**As a** new user
**I want to** select my sector of activity during onboarding
**So that** AI quote generation uses the right vocabulary from the start

**Acceptance Criteria:**
- [ ] After registration, redirect to `/onboarding`
- [ ] Sector selection screen shows 27 sectors with icons/descriptions
- [ ] Selected sector saved to `profiles.default_sector`
- [ ] Free plan users limited to 1 sector (show upgrade prompt for more)
- [ ] Sector unlocked in `user_sectors` table
- [ ] Skip option available (defaults to AUTRE)

---

#### Story 3.2: Company Profile Quick Setup

**As a** new artisan
**I want to** fill my company info quickly during onboarding
**So that** my quotes look professional from the first one

**Acceptance Criteria:**
- [ ] Step 2 of onboarding: company name, TVA number, address, phone
- [ ] Belgian-specific fields: TVA format (BE0xxx.xxx.xxx), IBAN (BExx)
- [ ] Logo upload (drag & drop, max 2MB, JPG/PNG)
- [ ] Quote prefix configuration (default: DEV-)
- [ ] Legal mentions template pre-filled (Belgian standard)
- [ ] Save to `profiles` table, mark `onboarding_completed = true`

---

#### Story 3.3: First Quote Tutorial Overlay

**As a** new user
**I want to** see a guided overlay on my first quote creation
**So that** I understand how to use AI generation

**Acceptance Criteria:**
- [ ] On first visit to `/quotes/new`, show tutorial overlay
- [ ] Step 1: "Paste your transcription or description here"
- [ ] Step 2: "Click Generate — AI will create your quote"
- [ ] Step 3: "Review and edit the generated items"
- [ ] Step 4: "Export as PDF and send to your client"
- [ ] Dismissible, with "Don't show again" option
- [ ] Tracked in `user_settings` (tutorial_completed flag)

---

#### Story 3.4: Sample Quote Auto-Generation

**As a** new user
**I want to** see a sample quote pre-generated for my sector
**So that** I immediately understand the output quality

**Acceptance Criteria:**
- [ ] After onboarding, if no quotes exist, show "Try with sample" button
- [ ] Sample transcription pre-filled based on selected sector
- [ ] One-click generation produces a realistic sample quote
- [ ] Sample quote clearly marked as "SAMPLE" (watermark or tag)
- [ ] User can edit and save as their own draft

---

#### Story 3.5: Onboarding Progress Indicator

**As a** new user
**I want to** see my setup progress
**So that** I know what steps remain

**Acceptance Criteria:**
- [ ] Dashboard shows onboarding checklist for incomplete profiles
- [ ] Steps: Select sector ✓, Complete profile ✓, Create first quote, Export first PDF
- [ ] Each step links to the relevant page
- [ ] Checklist disappears once all steps complete
- [ ] Progress stored in `profiles.onboarding_step`

---

### Epic 4: Core UX Polish

**Goal:** Ensure the core quote workflow is smooth and professional.
**Risk mitigated:** RP2 (UX complexity), RB3 (churn)
**PRD refs:** F1.1–F1.8, F2.1–F2.7, F5.1–F5.5

#### Story 4.1: Quote Editor Responsiveness

**As an** artisan using a phone
**I want to** create and edit quotes on mobile
**So that** I can work from job sites

**Acceptance Criteria:**
- [ ] Quote creation form usable on 375px width (iPhone SE)
- [ ] Item list scrollable with add/remove buttons accessible
- [ ] Total calculation visible without scrolling
- [ ] PDF preview responsive or shows "Download to preview" on mobile
- [ ] Touch-friendly input fields (min 44px tap targets)

---

#### Story 4.2: Quote Status Workflow

**As an** artisan
**I want to** track my quote status from draft to accepted
**So that** I know where each quote stands

**Acceptance Criteria:**
- [ ] Status badges with colors: draft (gray), sent (blue), accepted (green), rejected (red)
- [ ] Status transition buttons on quote detail page
- [ ] Timestamps recorded: `sent_at`, `accepted_at`, `finalized_at`
- [ ] Prevent editing after status "sent" (or show warning)
- [ ] Filter quotes by status on list page

---

#### Story 4.3: PDF Template Selection

**As an** artisan
**I want to** choose from 6 PDF templates
**So that** my quotes match my brand style

**Acceptance Criteria:**
- [ ] Template selection on quote detail page before export
- [ ] Preview thumbnails for all 6 templates
- [ ] Selected template remembered per user (default template in profile)
- [ ] All templates include: logo, company info, legal mentions, TVA, EPC QR
- [ ] Template renders correctly for quotes with 1-50 items

---

#### Story 4.4: Dashboard Quick Actions

**As an** artisan
**I want to** see key metrics and quick actions on my dashboard
**So that** I can be efficient immediately after login

**Acceptance Criteria:**
- [ ] KPIs: quotes this month, total revenue, pending quotes, conversion rate
- [ ] Quick action buttons: New Quote, View Leads, Export Analytics
- [ ] Recent quotes list (last 5) with status and amount
- [ ] Recent leads list (last 5) with status
- [ ] Loading skeletons while data fetches

---

#### Story 4.5: Search & Filter Enhancement

**As an** artisan with many quotes
**I want to** quickly find specific quotes
**So that** I don't waste time scrolling

**Acceptance Criteria:**
- [ ] Full-text search on client name, description, quote number
- [ ] Filter by: status, sector, date range
- [ ] Sort by: date, amount, client name, status
- [ ] Pagination with 20 items per page
- [ ] Search uses PostgreSQL GIN full-text index (french dictionary)
- [ ] Results highlight matching terms

---

### Epic 5: Payment & Billing Validation

**Goal:** Stripe integration works flawlessly for all plan transitions.
**Risk mitigated:** RT3 (free tier limits), RB2 (conversion)
**PRD refs:** F4.1–F4.6

#### Story 5.1: Subscription Plans Alignment

**As a** developer
**I want to** verify the 4 plans match PRD pricing and limits
**So that** billing is correct from day one

**Acceptance Criteria:**
- [ ] Plans table seeded: free (0€), pro (29€), business (99€), corporate (custom)
- [ ] Limits enforced: free=5 quotes/month+1 sector, pro=100+10, business=unlimited, corporate=unlimited
- [ ] `can_create_quote()` function correctly checks quota per plan
- [ ] `has_sector_access()` function correctly checks sector limits
- [ ] Stripe price IDs mapped to plan names
- [ ] Pricing page shows correct prices and feature comparison

---

#### Story 5.2: Upgrade Flow End-to-End

**As a** free user hitting the 5 quote limit
**I want to** upgrade to Pro seamlessly
**So that** I can continue working without friction

**Acceptance Criteria:**
- [ ] Upgrade prompt shown when `can_create_quote()` returns false
- [ ] "Upgrade" button → Stripe Checkout (card, Bancontact, iDEAL)
- [ ] After payment → webhook → subscription created → plan updated in DB
- [ ] User redirected back to DEAL with new plan active
- [ ] Limits immediately lifted (no page refresh needed)
- [ ] Confirmation email sent (via Stripe)

---

#### Story 5.3: Downgrade & Cancellation Flow

**As a** paying user
**I want to** manage my subscription via Stripe portal
**So that** I have full control over my billing

**Acceptance Criteria:**
- [ ] "Manage subscription" button → Stripe Customer Portal
- [ ] Downgrade → applied at period end (`cancel_at_period_end`)
- [ ] Cancellation → webhook → status updated → downgrade to free at period end
- [ ] User retains access until period end
- [ ] Downgrade revokes features beyond free tier limits (sector access, AI assistant)

---

#### Story 5.4: Failed Payment Handling

**As an** admin
**I want to** see failed payments in the admin panel
**So that** I can proactively support users

**Acceptance Criteria:**
- [ ] `invoice.payment_failed` webhook → subscription status = "past_due"
- [ ] Admin panel shows past_due subscriptions with user info
- [ ] User sees banner "Payment failed — update payment method"
- [ ] Link to Stripe portal to update payment method
- [ ] After 3 failed attempts (Stripe default), subscription cancelled → downgrade

---

## Phase 3: Launch

### Epic 6: Monitoring & Observability

**Goal:** Know what's happening in production from day one.
**Risk mitigated:** RT1 (API issues), RT3 (free tier), RT6 (AI costs)
**PRD refs:** F11.1, NFR3.1, NFR6.6

#### Story 6.1: Error Tracking Setup (Sentry)

**As a** developer
**I want to** receive error alerts in real-time
**So that** I can fix issues before users report them

**Acceptance Criteria:**
- [ ] Sentry SDK installed (Next.js integration)
- [ ] Client-side errors captured (React error boundaries)
- [ ] Server-side errors captured (API route handlers)
- [ ] Source maps uploaded for readable stack traces
- [ ] Alert rules: new error → email notification
- [ ] Environment tags: production, staging

---

#### Story 6.2: AI Cost Monitoring

**As a** founder
**I want to** track Claude API costs per quote
**So that** I can ensure profitability (< 0.10€/quote)

**Acceptance Criteria:**
- [ ] Log `tokens_used` from Claude API response per generation
- [ ] Store in `usage_stats` (new column: `ai_tokens_consumed`)
- [ ] Admin dashboard widget: daily/weekly/monthly AI cost
- [ ] Alert if average cost/quote exceeds 0.08€ (80% of target)
- [ ] Display per-user AI usage in admin users table

---

#### Story 6.3: Uptime Monitoring

**As a** founder
**I want to** know immediately if the app goes down
**So that** I can respond before users notice

**Acceptance Criteria:**
- [ ] External uptime monitor configured (UptimeRobot or Checkly)
- [ ] Health check endpoint: `GET /api/health` → 200 + DB connection test
- [ ] Check interval: every 5 minutes
- [ ] Alert channels: email + SMS
- [ ] Monthly uptime report tracked (target > 99.5%)

---

#### Story 6.4: Usage Analytics Dashboard

**As a** founder
**I want to** see real-time usage metrics in the admin panel
**So that** I can track progress toward 50 users month 1

**Acceptance Criteria:**
- [ ] Admin dashboard: daily signups, active users, quotes generated
- [ ] Conversion funnel: signup → onboarding complete → first quote → first PDF
- [ ] Retention: DAU/MAU ratio, return rate
- [ ] Revenue: MRR, plan distribution, upgrade rate
- [ ] Charts with 7-day and 30-day views

---

### Epic 7: Performance Optimization

**Goal:** All pages < 2s load time, AI generation < 15s.
**PRD refs:** NFR1.1–NFR1.6

#### Story 7.1: Lighthouse Audit & Fixes

**As a** developer
**I want to** achieve Lighthouse performance score > 90
**So that** the app feels fast on all devices

**Acceptance Criteria:**
- [ ] Run Lighthouse on 5 critical pages: landing, login, dashboard, quotes, quote editor
- [ ] FCP < 1.5s, LCP < 2.5s, CLS < 0.1 on all pages
- [ ] Fix any blocking resources (CSS, JS)
- [ ] Optimize images with `next/image`
- [ ] Add loading skeletons on dashboard, quotes list, invoices list

---

#### Story 7.2: AI Generation Latency Optimization

**As an** artisan
**I want to** get my AI quote in under 15 seconds
**So that** the experience feels responsive

**Acceptance Criteria:**
- [ ] Measure P50, P75, P95 latency for `/api/generate`
- [ ] Streaming response if Claude supports it (progressive display)
- [ ] Loading state with progress indicator ("Analyzing transcription...")
- [ ] Timeout at 30s with user-friendly error and retry button
- [ ] Cache similar transcriptions in Upstash Redis (30min TTL)

---

#### Story 7.3: PDF Generation Performance

**As an** artisan on a low-end phone
**I want to** generate PDF without the app freezing
**So that** I can export quotes on job sites

**Acceptance Criteria:**
- [ ] PDF generation < 5s for quotes with up to 20 items
- [ ] Web Worker or deferred rendering for PDF generation
- [ ] Show spinner during generation
- [ ] Memory usage stays under 50MB for PDF rendering
- [ ] Fallback: "Download is being prepared" for slow devices

---

#### Story 7.4: Database Query Optimization

**As a** developer
**I want to** ensure no slow queries as data grows
**So that** performance stays good at 1500+ users

**Acceptance Criteria:**
- [ ] Verify all existing indexes are used (no unused indexes)
- [ ] `EXPLAIN ANALYZE` on top 10 most frequent queries
- [ ] All list queries use pagination (no unbounded SELECTs)
- [ ] Full-text search queries use GIN index
- [ ] Connection pooling configured (Supabase built-in)

---

## Phase 4: Growth

### Epic 8: Guided Onboarding v2

**Goal:** Reduce time-to-value and increase activation rate to 50%.
**Risk mitigated:** RB1 (adoption), RB3 (churn)
**PRD refs:** F9.5

#### Story 8.1: Interactive Onboarding Wizard

**As a** new user
**I want to** be guided step-by-step through my first session
**So that** I don't feel lost

**Acceptance Criteria:**
- [ ] Multi-step wizard: Welcome → Sector → Profile → First Quote → Done
- [ ] Progress bar showing current step (1/5, 2/5, etc.)
- [ ] Each step validates before allowing next
- [ ] Skip option on non-critical steps
- [ ] Completion triggers 50 TokenDEAL bonus
- [ ] Analytics: track drop-off per step

---

#### Story 8.2: Contextual Tooltips

**As a** new user
**I want to** see helpful hints on key features
**So that** I discover capabilities naturally

**Acceptance Criteria:**
- [ ] Tooltips on: AI generate button, PDF export, lead capture, analytics
- [ ] Show only once per feature (tracked in `user_settings`)
- [ ] Dismissible with "Got it" button
- [ ] Non-intrusive positioning (bottom-right, slide-in)

---

#### Story 8.3: Email Drip Campaign Setup

**As a** founder
**I want to** send automated emails to new users
**So that** they stay engaged during the first 14 days

**Acceptance Criteria:**
- [ ] Day 0: Welcome email + quick start guide
- [ ] Day 1: "Did you create your first quote?" (if not)
- [ ] Day 3: Tips for using AI generation effectively
- [ ] Day 7: "Upgrade to Pro" for active free users
- [ ] Day 14: Feedback survey (NPS)
- [ ] Emails triggered by user actions (or lack thereof)
- [ ] Implementation: Supabase Edge Functions + email provider (Resend/Postmark)

---

#### Story 8.4: Video Tutorials

**As a** non-tech artisan
**I want to** watch short video tutorials
**So that** I can learn at my own pace

**Acceptance Criteria:**
- [ ] 3 videos: "Create your first quote" (2min), "Export PDF" (1min), "Manage leads" (2min)
- [ ] Hosted on YouTube/Vimeo (no self-hosting)
- [ ] Accessible from help menu and onboarding wizard
- [ ] In French, with simple language
- [ ] Links in docs page (`/docs`)

---

### Epic 9: Acquisition & Retention

**Goal:** Reach 200 users by month 3, 10% conversion to paid.
**Risk mitigated:** RB1 (adoption), RB2 (conversion), RB3 (churn)
**PRD refs:** Business Success criteria

#### Story 9.1: Referral Program Activation

**As a** satisfied user
**I want to** share my referral code and earn rewards
**So that** I'm incentivized to bring new users

**Acceptance Criteria:**
- [ ] Referral page (`/referral`) shows code, share link, stats
- [ ] Copy-to-clipboard and social sharing buttons
- [ ] Referral tracking: pending → signed_up → converted → rewarded
- [ ] Rewards: 50 TokenDEAL per referral (Bronze level)
- [ ] Ambassador levels visible with progression bar
- [ ] Email invitation from referral page

---

#### Story 9.2: Upgrade Prompts Optimization

**As a** free user
**I want to** see upgrade prompts at the right moment
**So that** the value proposition is clear when I need it

**Acceptance Criteria:**
- [ ] Prompt when hitting quota: "You've used 5/5 quotes this month"
- [ ] Prompt when trying AI assistant on free plan
- [ ] Prompt when trying to add 2nd sector on free plan
- [ ] Prompt shows clear value: "Pro = unlimited quotes for 29€/month"
- [ ] A/B test: different prompt styles (banner vs modal vs inline)
- [ ] Track prompt → upgrade conversion rate

---

#### Story 9.3: Feature Discovery Notifications

**As an** active user
**I want to** discover features I haven't used yet
**So that** I get more value from the platform

**Acceptance Criteria:**
- [ ] After 5 quotes: suggest lead management ("Track your prospects!")
- [ ] After 10 quotes: suggest analytics ("See your performance trends!")
- [ ] After first team invite: suggest RBAC roles
- [ ] Notifications via in-app notification system (existing `notifications` table)
- [ ] Each notification shown once, dismissible
- [ ] Tracked in `user_settings.notification_preferences`

---

#### Story 9.4: Landing Page Conversion Optimization

**As a** visitor
**I want to** understand DEAL's value proposition in 10 seconds
**So that** I'm motivated to sign up

**Acceptance Criteria:**
- [ ] Hero: "Créez vos devis en 5 minutes grâce à l'IA"
- [ ] Social proof: testimonials or beta user count
- [ ] Feature highlights: AI generation, PDF export, Belgian compliance
- [ ] Pricing section with clear plan comparison
- [ ] CTA: "Essayer gratuitement" → registration
- [ ] Mobile-optimized layout
- [ ] Lighthouse performance > 95 (static page)

---

#### Story 9.5: Beta User Feedback Loop

**As a** founder
**I want to** collect structured feedback from early users
**So that** I can iterate quickly based on real usage

**Acceptance Criteria:**
- [ ] In-app feedback button (bottom-right, persistent)
- [ ] Simple form: rating (1-5) + freetext comment
- [ ] Stored in a feedback table or external tool (Canny, Typeform)
- [ ] NPS survey after 14 days (email or in-app)
- [ ] Admin panel: view feedback sorted by date/rating

---

## Phase 5: Scale

### Epic 10: Localization (NL/DE)

**Goal:** Expand to the full Belgian market (Dutch + German speakers).
**PRD refs:** F11.4, NFR7.3
**Constraint:** C6 (FR only at launch)

#### Story 10.1: i18n Framework Setup

**As a** developer
**I want to** implement internationalization support
**So that** the app can be translated to NL and DE

**Acceptance Criteria:**
- [ ] i18n library configured (next-intl or similar)
- [ ] All user-facing strings extracted to locale files
- [ ] FR locale file complete (baseline)
- [ ] Language switcher in settings
- [ ] Language preference stored in `user_settings.language`
- [ ] LocaleContext used throughout the app

---

#### Story 10.2: Dutch Translation

**As a** Dutch-speaking Belgian artisan
**I want to** use DEAL in my language
**So that** I can work comfortably

**Acceptance Criteria:**
- [ ] NL locale file with all translations
- [ ] AI generation supports Dutch transcriptions
- [ ] PDF templates support Dutch legal mentions
- [ ] Belgian Dutch (not Netherlands Dutch) vocabulary
- [ ] Professional translator review (not just Google Translate)

---

#### Story 10.3: German Translation

**As a** German-speaking Belgian artisan (Ostbelgien)
**I want to** use DEAL in German
**So that** the platform is accessible to me

**Acceptance Criteria:**
- [ ] DE locale file with all translations
- [ ] AI generation supports German transcriptions
- [ ] PDF templates support German legal mentions
- [ ] Belgian German dialect awareness
- [ ] Professional translator review

---

### Epic 11: Advanced Integrations

**Goal:** Increase stickiness and automate workflows.
**PRD refs:** F11.3, F11.5, F11.6, Growth Features

#### Story 11.1: DocuSign Integration

**As an** artisan
**I want to** send quotes for electronic signature
**So that** I can close deals faster

**Acceptance Criteria:**
- [ ] DocuSign OAuth connection in settings
- [ ] "Send for signature" button on accepted quotes
- [ ] Signed document stored in Supabase Storage (`signatures` bucket)
- [ ] Quote status updated on signature completion (webhook)
- [ ] Available for Pro+ plans only

---

#### Story 11.2: PWA Offline Mode

**As an** artisan on a job site with poor connectivity
**I want to** view my quotes offline
**So that** I can reference them without internet

**Acceptance Criteria:**
- [ ] Service Worker caches static assets and last 20 quotes
- [ ] Offline indicator in the UI
- [ ] View quotes and quote details offline
- [ ] Queue new quote creation for sync when back online
- [ ] Manifest.json for "Add to Home Screen"
- [ ] IndexedDB for offline data storage

---

#### Story 11.3: Public API Documentation

**As a** developer integrating with DEAL
**I want to** read clear API documentation
**So that** I can build integrations

**Acceptance Criteria:**
- [ ] OpenAPI 3.0 spec for `/api/v1/*` endpoints
- [ ] Interactive documentation page at `/docs/api`
- [ ] Code examples in JavaScript, Python, cURL
- [ ] Authentication guide (API key creation + usage)
- [ ] Rate limit documentation
- [ ] Webhook events documentation

---

#### Story 11.4: Webhook System for External Integrations

**As a** developer
**I want to** receive webhooks from DEAL when events occur
**So that** I can build custom integrations

**Acceptance Criteria:**
- [ ] Webhook configuration in settings (URL, events, secret)
- [ ] Events: quote.created, quote.accepted, lead.created, payment.received
- [ ] HMAC signature verification for webhook delivery
- [ ] Retry logic: 3 attempts with exponential backoff
- [ ] Webhook delivery logs in settings
- [ ] Available for Business+ plans only

---

## Dependency Map

```
Epic 1 (Security) ──┐
Epic 2 (Testing)  ──┤── LAUNCH GATE ──┬── Epic 6 (Monitoring)
Epic 3 (Onboarding) ┤                 ├── Epic 7 (Performance)
Epic 4 (UX Polish) ─┤                 │
Epic 5 (Billing)  ──┘                 ├── Epic 8 (Onboarding v2)
                                       ├── Epic 9 (Acquisition)
                                       │
                                       └── Epic 10 (Localization)
                                           Epic 11 (Integrations)
```

**Launch gate:** Epics 1–5 must be complete before public launch.
**Post-launch:** Epics 6–9 in first 3 months.
**Scale:** Epics 10–11 at month 6+.

---

## Story Point Summary

| Phase | Epics | Stories | Priority |
|---|---|---|---|
| Phase 1: Stabilization | 2 | 10 | Must |
| Phase 2: Launch Readiness | 3 | 14 | Must |
| Phase 3: Launch | 2 | 8 | Should |
| Phase 4: Growth | 2 | 9 | Should |
| Phase 5: Scale | 2 | 7 | Could |
| **Total** | **11** | **48** | |
