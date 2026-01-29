---
status: complete
date: 2026-01-29
author: Geoffrey
sourceDocuments:
  - docs/architecture.md
  - docs/data-models.md
  - docs/api-contracts.md
  - docs/security/SECURITY-POLICY.md
  - _bmad-output/planning-artifacts/prd.md
---

# Architecture Document - DEAL

## 1. Executive Summary

DEAL est un monolithe full-stack Next.js 14 (App Router) deployable sur Vercel, avec Supabase comme backend-as-a-service (PostgreSQL, Auth, Storage) et des integrations Stripe (paiements), Anthropic Claude (IA), et Upstash Redis (rate limiting/cache).

**Architecture type :** Monolithe serverless, multi-tenant, API-first
**Statut :** Brownfield — MVP 84% implemente, pre-lancement

### Key Architectural Decisions (ADRs)

| # | Decision | Rationale | Trade-off |
|---|---|---|---|
| ADR-1 | Monolithe Next.js (pas microservices) | Equipe solo, time-to-market, simplicite | Scaling vertical, couplage |
| ADR-2 | Supabase (pas Firebase/custom) | PostgreSQL natif, RLS, Auth integre, region EU | Vendor lock-in, limites free tier |
| ADR-3 | PDF client-side (@react-pdf) | Zero cout serveur, instantane | Dependant du device, pas de batch |
| ADR-4 | Claude API (pas GPT/multi-provider) | Qualite generation, partenariat Anthropic | Single provider dependency |
| ADR-5 | Serverless Vercel (pas VPS) | Auto-scaling, zero ops, CDN global | Timeout 60s max, cold starts |
| ADR-6 | Upstash Redis (pas Redis self-hosted) | Serverless-compatible, pay-per-request | Latence reseau vs in-process |
| ADR-7 | RLS PostgreSQL (pas app-level auth) | Securite en profondeur, impossible de bypasser | Complexite debug, performance queries |
| ADR-8 | App Router (pas Pages Router) | Server Components, layouts, streaming | Maturite ecosystem, complexite |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser/PWA)                  │
│  Next.js App Router │ React 18 │ Tailwind │ shadcn/ui   │
└────────────────────────────┬────────────────────────────┘
                             │ HTTPS (TLS 1.3)
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel Edge Network                        │
│  CDN │ Edge Middleware (auth, rate limit, CORS, headers)│
└──────────┬──────────┬──────────┬───────────┬───────────┘
           │          │          │           │
           ▼          ▼          ▼           ▼
    ┌──────────┐ ┌─────────┐ ┌────────┐ ┌────────────┐
    │ Supabase │ │ Stripe  │ │Upstash │ │ Anthropic  │
    │ Postgres │ │Payments │ │ Redis  │ │ Claude API │
    │ Auth     │ │Webhooks │ │ Cache  │ │ (Devis IA) │
    │ Storage  │ │ Portal  │ │ Limits │ │            │
    └──────────┘ └─────────┘ └────────┘ └────────────┘
```

### 2.2 Request Flow

```
Browser → Vercel Edge (middleware.ts)
  ├── Static assets → CDN cache (hit) → Response
  ├── Pages → SSR/RSC → Supabase (RLS) → HTML stream
  └── API Routes → Handler
        ├── Session auth → Supabase (anon key + RLS)
        ├── API key auth → verify_api_key() → Supabase (service role)
        ├── Admin auth → email whitelist → Supabase (service role)
        └── Webhook → Stripe signature verify → Supabase (service role)
```

### 2.3 Project Structure

```
src/
├── app/                          # App Router Next.js 14
│   ├── (auth)/                   # 7 pages: login, register, forgot-password,
│   │                             #   reset-password, mfa-verify, onboarding, pricing
│   ├── (dashboard)/              # 15+ pages: dashboard, quotes, invoices, leads,
│   │                             #   tokens, templates, suppliers, referral,
│   │                             #   analytics, team, profile, settings/*
│   ├── (admin)/                  # 9 pages: dashboard, users, subscriptions,
│   │                             #   audit-logs, sectors, templates, tokens,
│   │                             #   analytics, settings
│   ├── api/                      # 28 route handlers, 47 HTTP endpoints
│   ├── b2c/                      # Landing page publique
│   └── docs/                     # Documentation utilisateur
├── components/                   # 80 composants (49 custom + 31 shadcn/ui)
├── contexts/                     # 7 React Contexts
├── lib/                          # Clients, utils, helpers
├── hooks/                        # React hooks custom
├── types/                        # TypeScript definitions
└── middleware.ts                 # Edge Middleware
```

---

## 3. Data Architecture

### 3.1 Database Overview

- **Engine:** PostgreSQL (Supabase hosted, region eu-west)
- **Tables:** 38 tables
- **Migrations:** 16 fichiers SQL
- **Functions/Triggers:** 30+ fonctions PL/pgSQL, 13 triggers
- **Extensions:** uuid-ossp, pgcrypto
- **RLS:** Active sur toutes les tables

### 3.2 Core Data Model

```
auth.users (Supabase Auth)
  │
  ├── profiles (1:1) ── company_id → companies
  │
  ├── quotes (1:N)
  │     ├── quote_items (1:N) [generated column: total]
  │     ├── quote_materials (1:N) [BTP]
  │     ├── quote_labor (1:N) [BTP]
  │     ├── quote_comments (1:N) [Realtime]
  │     ├── organization_id → organizations
  │     └── lead_id → leads
  │
  ├── invoices (1:N)
  │     ├── invoice_items (1:N)
  │     └── quote_id → quotes
  │
  ├── subscriptions (1:1) → plans (reference)
  ├── organizations (N:M via organization_members)
  ├── leads (1:N)
  ├── api_keys (1:N)
  ├── workflows (1:N) → workflow_executions (1:N)
  ├── referrals (1:N)
  ├── token_transactions (1:N)
  └── audit_logs (1:N)
```

### 3.3 Key Data Patterns

| Pattern | Tables | Implementation |
|---|---|---|
| **User isolation** | profiles, quotes, subscriptions, leads, invoices | `auth.uid() = user_id` RLS |
| **Parent relation** | quote_items, invoice_items, quote_materials | JOIN to parent → user_id check |
| **Multi-tenant** | organizations, organization_members, invitations | Role-based RLS (owner/admin/member/viewer) |
| **Public read** | plans, suppliers (verified), templates (public) | `USING (true)` or condition-based |
| **Service-only** | processed_stripe_events | RLS active, no policies (service role only) |
| **Computed columns** | quote_items.total, quote_labor.total | `GENERATED ALWAYS AS ... STORED` |
| **Auto-triggers** | updated_at, quote totals, quote numbers | BEFORE/AFTER triggers |
| **Full-text search** | quotes, quote_items, profiles | GIN indexes, french dictionary |
| **Realtime** | quote_comments, notifications | Supabase Realtime publication |

### 3.4 ENUM Types

| Type | Values |
|---|---|
| `sector_type` | BTP, IT, CONSEIL, ARTISAN, SERVICES, AUTRE |
| `quote_status` | draft, sent, accepted, rejected |
| `subscription_plan` | free, starter, pro, ultimate |
| `org_role` | owner, admin, member, viewer |
| `audit_action` | CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, IMPORT, SEND, APPROVE, REJECT, API_CALL |
| `invitation_status` | pending, accepted, declined, expired |

### 3.5 Storage

| Bucket | Visibility | Content |
|---|---|---|
| `logos` | Public | Company logos (2MB max, JPG/PNG) |
| `pdfs` | Private | Generated quotes & invoices |
| `signatures` | Private | Electronic signatures |

Structure: `{bucket}/{user_id}/{filename}`

---

## 4. API Architecture

### 4.1 Overview

- **28 route handlers** across 15 domains
- **47 HTTP endpoints** total
- **API public v1:** `/api/v1/quotes` with API key auth + Zod validation
- **Internal API:** Session-based auth for dashboard

### 4.2 Endpoint Summary

| Domain | Endpoints | Auth Method |
|---|---|---|
| AI Generation | 2 (generate, ai-assistant) | Session |
| Quotes API v1 | 5 (CRUD + list) | API Key (scoped) |
| Quotes Internal | 1 (PDF) | Session |
| Stripe | 3 (checkout, portal, webhook) | Session / Signature |
| Invoices | 4 (CRUD + Peppol) | Session |
| Workflows | 4 (CRUD) | Session |
| HITL | 2 (list, decide) | Session |
| Widget | 2 (CORS + submit) | API Key / Public |
| Referral | 4 (list, register, stats, invite) | Session / Public |
| Tokens | 2 (balance, transact) | Session |
| API Keys | 3 (list, create, revoke) | Session |
| Leads/CRM | 4 (CRUD) | Session |
| GDPR | 5 (export x2, delete info, delete x2) | Session |
| Analytics | 2 (vitals + CORS) | Public (Edge) |
| Admin | 4 (users, subscriptions, update-plan, stats) | Service role + whitelist |

### 4.3 Authentication Methods

| Method | Usage | Implementation |
|---|---|---|
| Session Supabase | Dashboard, internal APIs | Cookie `sb-access-token`, JWT via `@supabase/ssr` |
| API Key (scoped) | Public API v1, Widget | Header `x-api-key`, SHA-256 hash, `verify_api_key()` |
| Stripe Signature | Webhooks | Header `stripe-signature`, HMAC verification |
| Email Whitelist | Admin panel | Session + email check in `ADMIN_EMAILS` env var |
| Service Role | Admin + Webhooks | `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS |

### 4.4 Validation

- **Zod** schemas for all API v1 endpoints
- Shared types between frontend and backend via `src/types/`
- 400 response with field-level error details on validation failure

---

## 5. Security Architecture

### 5.1 Defense in Depth

```
Layer 1: Vercel Edge    → HTTPS, security headers, CORS
Layer 2: Middleware      → Auth check, rate limiting, admin whitelist
Layer 3: API Routes      → Session/API key verification, Zod validation
Layer 4: Supabase RLS    → Row-level data isolation per user/org
Layer 5: Database        → SECURITY DEFINER functions, generated columns
Layer 6: Encryption      → AES-256-GCM (sensitive data), bcrypt (passwords)
```

### 5.2 Security Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 5.3 Rate Limiting (Upstash Redis)

| Tier | Limit | Window | Target |
|---|---|---|---|
| General | 100 req | 1 min | All endpoints |
| AI | 10 req | 1 min | /api/generate, /api/ai-assistant |
| Auth | 5 req | 15 min | /login, /register, /forgot-password |
| API v1 | 100 req | 1 min | /api/v1/* |

### 5.4 RBAC

4 hierarchical roles within organizations:

| Role | Key Permissions |
|---|---|
| owner | All + delete org + billing + manage admins |
| admin | Team management + settings + full CRUD |
| member | Create/edit own quotes and invoices |
| viewer | Read-only access |

Permission check: `has_org_permission(user_id, required_role)` — hierarchical (owner inherits all).

### 5.5 GDPR Compliance

- 15 consent types with versioning
- Data export: `/api/gdpr/export` (JSON)
- Data deletion: `/api/gdpr/delete` + `/api/user/delete-account`
- HITL: 18 actions requiring human control, 5 control levels
- Audit trail: all sensitive operations logged
- Data hosted in EU (Supabase eu-west)
- Retention policies per data type

---

## 6. Integration Architecture

### 6.1 Anthropic Claude API

- **Model:** `claude-sonnet-4-20250514`
- **Usage:** Quote generation from transcription, AI assistant (audit, optimize, email, materials, planning)
- **Auth:** API key in `ANTHROPIC_API_KEY`
- **Rate limit:** 10 req/min (app-level)
- **Cost target:** < 0.10 EUR/quote
- **Fallback:** Manual quote creation mode

### 6.2 Stripe

- **Checkout Sessions:** Subscription creation (card, Bancontact, iDEAL)
- **Customer Portal:** Self-service subscription management
- **Webhooks:** Idempotent processing via `processed_stripe_events`
- **Events handled:** subscription.created/updated/deleted, payment_intent.succeeded/failed
- **Auth:** Webhook signature verification

### 6.3 Supabase

- **PostgreSQL:** 38 tables, RLS, functions, triggers, full-text search
- **Auth:** Email/password + MFA (TOTP), JWT sessions
- **Storage:** 3 buckets (logos, pdfs, signatures)
- **Realtime:** quote_comments, notifications
- **Service Role:** Admin operations, webhook handlers

### 6.4 Upstash Redis

- **Rate limiting:** 4 tiers (general, AI, auth, API v1)
- **AI cache:** Response caching for similar quotes
- **Session cache:** Temporary session data
- **Architecture:** Serverless, REST-based (compatible Vercel Edge)

### 6.5 Future Integrations (Placeholders)

| Service | Purpose | Status |
|---|---|---|
| DocuSign | Electronic signature | Env vars reserved |
| HubSpot | CRM bidirectional sync | Env vars reserved |
| QuickBooks | Accounting sync | Env vars reserved |
| Sentry | Error monitoring | Planned (F11.1) |
| LogRocket | Session replay | Planned (F11.1) |

---

## 7. Frontend Architecture

### 7.1 Rendering Strategy

| Strategy | Usage |
|---|---|
| SSR (Server Components) | Dashboard pages with dynamic data |
| SSG | Public pages (landing, pricing, docs) |
| Edge Runtime | Analytics endpoint |
| Client-side | Interactive components (quote editor, PDF preview) |

### 7.2 Component Architecture

- **80 total components** (49 custom + 31 shadcn/ui)
- shadcn/ui base: Button, Dialog, DropdownMenu, Input, Select, Table, Toast, etc.
- Custom: Quote forms, PDF editor, data tables, CRM widgets, admin dashboards

### 7.3 State Management (7 React Contexts)

| Context | Purpose |
|---|---|
| ThemeVariantContext | Theme variants (colors, dark mode) |
| AccessibilityContext | Accessibility preferences (font size, contrast) |
| DemoModeContext | Demo mode with mock data |
| BrandingContext | Company branding (logo, colors) |
| OrganizationContext | Active organization, members, roles |
| LocaleContext | Language and localization (FR, NL, EN, DE) |
| UIModeContext | Interface mode (compact, comfortable) |

### 7.4 PDF Generation

- **Library:** @react-pdf/renderer (client-side)
- **Templates:** 6 professional templates
- **Features:** Company logo, auto-numbering, legal mentions, Belgian VAT, EPC QR codes
- **Cache:** LRU in-memory (10MB max, 30min TTL)

### 7.5 Performance Optimizations

- Loading skeletons on 3 critical routes
- Code splitting (automatic per-route)
- Tree-shaking (react-pdf, framer-motion)
- Image optimization (next/image)
- Web Vitals tracking (/api/analytics/vitals)

---

## 8. Multi-Tenancy Architecture

### 8.1 Model

Hybrid multi-tenancy: shared database, row-level isolation.

```
User (auth.users)
  ├── Personal data (profiles, quotes, leads) → RLS: auth.uid() = user_id
  └── Organization (optional)
        ├── organization_members (role-based)
        ├── Shared quotes (organization_id FK)
        └── Shared API keys (organization_id FK)
```

### 8.2 Organization Lifecycle

1. User creates org → `create_organization()` → auto-assigned as `owner`
2. Owner invites members → `organization_invitations` → token-based acceptance
3. Members access resources based on role hierarchy
4. Quotes can be scoped to organization (`organization_id` FK)

### 8.3 Data Isolation

- Personal resources: strict `user_id = auth.uid()` RLS
- Organization resources: membership check via `organization_members`
- Admin bypass: service role key (no RLS)

---

## 9. Deployment Architecture

### 9.1 Infrastructure

```
Vercel (Next.js)
  ├── Edge Network (CDN, middleware)
  ├── Serverless Functions (API routes)
  │     ├── Timeout: 10s (hobby) / 60s (pro)
  │     └── Memory: 1024MB default
  └── Static Assets (ISR, SSG pages)

Supabase (eu-west)
  ├── PostgreSQL (managed)
  ├── Auth (managed)
  ├── Storage (S3-compatible)
  └── Realtime (WebSocket)

Upstash (serverless Redis)
Stripe (payment processing)
Anthropic (AI API)
```

### 9.2 Build Configuration

```javascript
// next.config.js
{
  output: 'standalone',
  experimental: { serverActions: true }
}
```

### 9.3 Environment Variables (15+)

| Category | Variables |
|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Anthropic | `ANTHROPIC_API_KEY` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Upstash | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| App | `NEXT_PUBLIC_APP_URL`, `ENCRYPTION_KEY`, `ADMIN_EMAILS` |
| Future | `DOCUSIGN_*`, `HUBSPOT_*`, `QUICKBOOKS_*` |

### 9.4 CI/CD

- Auto-deploy on push to `main` via Vercel
- Database migrations via Supabase CLI (`supabase/migrations/`)
- Environments: local (Supabase CLI) → staging → production

---

## 10. Testing Architecture

### 10.1 Stack

| Tool | Type | Coverage |
|---|---|---|
| Vitest | Unit / Integration | Business logic, utils, components |
| Playwright | E2E | Full user journeys |
| Testing Library | Component | React render + interactions |

### 10.2 Test Coverage (9 test files)

| Domain | Type | What |
|---|---|---|
| EPC QR codes | Unit | Generation & validation |
| Legal risk | Unit | Risk score calculation |
| Locale packs | Unit | Translation validation (FR/NL/EN/DE) |
| PDF cache | Unit | LRU behavior (eviction, TTL) |
| Badge system | Unit | Badge attribution & calculation |
| API quotes | Integration | Full CRUD on public API v1 |
| Auth E2E | E2E | Registration, login, MFA |
| Dashboard E2E | E2E | Navigation & interactions |

### 10.3 Target

- Critical endpoint coverage > 80%
- All API v1 endpoints covered by integration tests
- Core user journeys covered by E2E

---

## 11. Observability (Current + Planned)

### 11.1 Current

- **Web Vitals:** Client-side collection → `/api/analytics/vitals` → `performance_metrics` table
- **Audit Logs:** All admin/sensitive actions → `audit_logs` table
- **API Logs:** Request/response tracking → `api_request_logs` table
- **Session Logs:** User session tracking → `session_logs` table

### 11.2 Planned (Post-launch)

- **Sentry:** Error tracking, performance monitoring
- **LogRocket:** Session replay, user behavior
- **Uptime monitoring:** External service (UptimeRobot/Checkly)
- **Cost monitoring:** Claude API usage per quote

---

## 12. Scalability Considerations

### 12.1 Current Capacity

| Resource | Limit | Scaling Path |
|---|---|---|
| Vercel Functions | 10s timeout (hobby) | Upgrade to Pro (60s) |
| Supabase DB | 500MB (free) | Upgrade to Pro (8GB) |
| Supabase Auth | 50k MAU (free) | Pro plan |
| Upstash Redis | 10k req/day (free) | Pay-as-you-go |
| Claude API | Pay-per-token | Budget alerts |

### 12.2 Scaling Strategy

- **Month 1-3:** Free tiers sufficient (50-200 users)
- **Month 3-6:** Upgrade Supabase + Vercel to Pro tiers
- **Month 6-12:** Connection pooling, query optimization, CDN tuning
- **Beyond:** Consider read replicas, edge caching, background jobs (if needed)

### 12.3 Known Limitations

- PDF generation client-side: limited by device performance
- No background job system: long-running tasks constrained by serverless timeouts
- Single-region: Supabase eu-west only (acceptable for Belgian market)
- No message queue: webhook retries depend on Stripe's built-in retry mechanism

---

## 13. Architecture Decision Log

| Date | Decision | Context |
|---|---|---|
| 2026-01 | Next.js 14 App Router | Modern React patterns, server components, streaming |
| 2026-01 | Supabase over Firebase | PostgreSQL > NoSQL for relational data, RLS, EU hosting |
| 2026-01 | Client-side PDF | Zero server cost, instant generation, offline-capable |
| 2026-01 | Single Claude model | Consistency in output quality, simpler prompt engineering |
| 2026-01 | Monolith architecture | Solo developer, faster iteration, simpler deployment |
| 2026-01 | Upstash over self-hosted Redis | Serverless compatible, zero ops, pay-per-request |
| 2026-01 | Email whitelist for admin | Simple, secure, no extra auth system needed |
| 2026-01 | Zod for validation | Runtime + compile-time safety, shared schemas |
