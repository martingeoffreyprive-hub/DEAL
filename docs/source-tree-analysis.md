# DEAL - Source Tree Analysis

> Generated: 2026-01-28 | Scan Level: Exhaustive | Version: 2.2.0

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Type** | Monolith Web Application |
| **Framework** | Next.js 14.2.35 (App Router) + TypeScript 5.7.2 |
| **Database** | Supabase PostgreSQL |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui |
| **Files** | 221 source files |
| **Lines** | ~55,500 LOC |

---

## Complete Directory Structure

```
DEAL/
├── .claude/                           # Claude Code config
├── _bmad/                             # BMAD workflow system
├── docs/                              # Documentation
│   ├── bmad/                          # BMAD documents
│   ├── generated/                     # Generated artifacts
│   ├── security/                      # Security policies
│   ├── index.md                       # Master index
│   ├── source-tree-analysis.md        # This file
│   ├── development-guide.md           # Dev guide
│   ├── deployment-guide.md            # Deploy guide
│   └── project-scan-report.json       # Scan report
│
├── public/                            # Static assets
│   ├── logos/                         # Brand logos (SVG, PNG)
│   ├── fonts/                         # Custom fonts
│   └── manifest.json                  # PWA manifest
│
├── supabase/                          # Database
│   ├── migrations/                    # 18 SQL migrations
│   ├── schema.sql                     # Base schema
│   └── FULL_MIGRATION.sql             # Complete enterprise migration
│
├── tests/                             # Test files
│   ├── e2e/                           # Playwright E2E tests
│   │   ├── auth.spec.ts
│   │   └── dashboard.spec.ts
│   ├── components/                    # Component tests
│   │   └── badge-system.test.tsx
│   ├── api/                           # API tests
│   │   └── quotes.test.ts
│   └── setup.ts
│
├── src/                               # Source code (221 files)
│   ├── app/                           # Next.js App Router
│   ├── components/                    # React Components (74)
│   ├── contexts/                      # React Contexts (7)
│   ├── hooks/                         # Custom Hooks (5)
│   ├── lib/                           # Utilities (51 modules)
│   ├── types/                         # TypeScript types
│   └── middleware.ts                  # Edge middleware
│
├── .env.example                       # Environment template
├── next.config.mjs                    # Next.js config
├── tailwind.config.ts                 # Tailwind config
├── tsconfig.json                      # TypeScript config
├── package.json                       # Dependencies (57)
├── vitest.config.ts                   # Vitest config
└── playwright.config.ts               # Playwright config
```

---

## src/app/ - Routes (76 files)

### Route Groups

```
src/app/
├── (admin)/                           # Admin panel
│   ├── layout.tsx                     # Admin layout with sidebar
│   └── admin/
│       ├── page.tsx                   # Dashboard admin principal
│       ├── analytics/page.tsx         # Analytics avances
│       ├── audit-logs/page.tsx        # Journaux d'audit
│       ├── sectors/page.tsx           # Configuration secteurs
│       ├── settings/page.tsx          # Parametres admin
│       ├── subscriptions/page.tsx     # Gestion abonnements
│       ├── templates/page.tsx         # Templates globaux
│       ├── tokens/page.tsx            # Gestion tokens IA
│       └── users/page.tsx             # Gestion utilisateurs
│
├── (auth)/                            # Authentication
│   ├── layout.tsx                     # Auth layout minimal
│   ├── forgot-password/page.tsx       # Mot de passe oublie
│   ├── login/page.tsx                 # Connexion
│   ├── mfa-verify/page.tsx            # Verification MFA TOTP
│   ├── onboarding/page.tsx            # Parcours onboarding 5 etapes
│   ├── pricing/page.tsx               # Page tarification
│   ├── register/page.tsx              # Inscription
│   └── reset-password/page.tsx        # Reinitialisation mdp
│
├── (dashboard)/                       # Main app
│   ├── layout.tsx                     # Dashboard layout (sidebar/header)
│   ├── analytics/
│   │   ├── loading.tsx                # Skeleton loader
│   │   └── page.tsx                   # Statistiques utilisateur
│   ├── dashboard/
│   │   ├── loading.tsx                # Skeleton loader
│   │   └── page.tsx                   # Tableau de bord Netflix-style
│   ├── invoices/page.tsx              # Gestion factures
│   ├── leads/page.tsx                 # Gestion prospects/leads
│   ├── profile/page.tsx               # Profil entreprise
│   ├── quotes/                        # [CORE] Gestion devis
│   │   ├── loading.tsx                # Skeleton loader
│   │   ├── page.tsx                   # Liste devis avec filtres
│   │   ├── new/page.tsx               # Creation devis IA
│   │   └── [id]/page.tsx              # Edition devis
│   ├── referral/page.tsx              # Programme parrainage
│   ├── settings/
│   │   ├── appearance/page.tsx        # Theme & branding
│   │   ├── integrations/page.tsx      # Integrations tierces
│   │   ├── privacy/page.tsx           # RGPD & donnees
│   │   ├── security/page.tsx          # Securite & MFA
│   │   ├── subscription/page.tsx      # Gestion abonnement
│   │   ├── widget/page.tsx            # Widget externe
│   │   └── workflows/page.tsx         # Automatisations
│   ├── suppliers/page.tsx             # Base fournisseurs
│   ├── team/page.tsx                  # Gestion equipe
│   ├── templates/page.tsx             # Templates personnels
│   └── tokens/page.tsx                # Tokens IA utilisateur
│
├── api/                               # API Routes (28 endpoints)
│   ├── admin/
│   │   ├── stats/route.ts             # GET statistiques admin
│   │   └── update-plan/route.ts       # POST changer plan user
│   ├── ai-assistant/route.ts          # POST assistant IA
│   ├── analytics/vitals/route.ts      # POST web vitals
│   ├── api-keys/route.ts              # GET/POST cles API
│   ├── gdpr/
│   │   ├── delete/route.ts            # DELETE suppression RGPD
│   │   └── export/route.ts            # GET export donnees
│   ├── generate/route.ts              # POST generation IA devis
│   ├── hitl/route.ts                  # POST human-in-the-loop
│   ├── invoices/
│   │   ├── route.ts                   # GET/POST factures
│   │   └── [id]/peppol/route.ts       # GET format PEPPOL
│   ├── leads/route.ts                 # GET/POST leads
│   ├── quotes/
│   │   └── [id]/pdf/route.ts          # GET generation PDF
│   ├── referral/
│   │   ├── route.ts                   # GET stats parrainage
│   │   ├── invite/route.ts            # POST envoi invitation
│   │   └── stats/route.ts             # GET stats detaillees
│   ├── stripe/
│   │   ├── checkout/route.ts          # POST create checkout
│   │   ├── portal/route.ts            # POST customer portal
│   │   └── webhook/route.ts           # POST webhooks Stripe
│   ├── tokens/route.ts                # GET/POST tokens IA
│   ├── user/
│   │   ├── data-export/route.ts       # GET export utilisateur
│   │   └── delete-account/route.ts    # DELETE suppression compte
│   ├── v1/                            # API publique v1
│   │   └── quotes/
│   │       ├── route.ts               # GET/POST quotes
│   │       └── [id]/route.ts          # GET/PATCH/DELETE quote
│   ├── widget/quote-request/route.ts  # POST widget embed
│   └── workflows/route.ts             # GET/POST workflows
│
├── auth/                              # Auth handlers
│   ├── callback/route.ts              # OAuth callback
│   └── logout/route.ts                # Logout route
│
├── b2c/page.tsx                       # Landing B2C
├── docs/user-guide/page.tsx           # Guide utilisateur
│
├── error.tsx                          # Error boundary
├── layout.tsx                         # Root layout (9 providers)
├── not-found.tsx                      # 404 page
├── page.tsx                           # Landing page
└── globals.css                        # Global styles
```

---

## src/components/ - UI Components (74 files)

```
src/components/
├── admin/
│   └── user-detail-modal.tsx          # Modal detail utilisateur
│
├── animations/
│   ├── page-transition.tsx            # Transitions Framer Motion
│   └── smooth-transitions.tsx         # Animations fluides
│
├── auth/
│   └── require-onboarding.tsx         # Guard onboarding
│
├── brand/                             # [BRAND] Composants DEAL
│   ├── BrandConstants.ts              # Constantes couleurs/fonts
│   ├── DealEmptyState.tsx             # Etat vide brande
│   ├── DealIconD.tsx                  # Icone D animee
│   ├── DealLoadingSpinner.tsx         # Spinner brande
│   ├── DealLogo.tsx                   # Logo principal
│   ├── DealLogoForPDF.tsx             # Logo pour PDF
│   ├── DealLogoFull.tsx               # Logo complet
│   ├── DealWatermark.tsx              # Watermark PDF
│   ├── SplashScreen.tsx               # Splash screen
│   └── index.ts                       # Exports
│
├── celebrations/
│   └── quote-celebration.tsx          # Animation celebration devis
│
├── command-palette/
│   ├── command-palette.tsx            # Palette commandes (Cmd+K)
│   └── index.ts
│
├── dashboard/
│   ├── hero-section.tsx               # Section hero dashboard
│   └── quote-carousel.tsx             # Carousel style Netflix
│
├── demo/
│   └── DemoModeSwitcher.tsx           # Toggle mode demo
│
├── gamification/
│   └── badge-system.tsx               # Systeme de badges
│
├── layout/
│   ├── bottom-navigation.tsx          # Navigation mobile bottom
│   ├── bottom-sheet-menu.tsx          # Menu slide-up mobile
│   ├── header.tsx                     # Header principal
│   └── sidebar.tsx                    # Sidebar navigation
│
├── locale/
│   └── locale-selector.tsx            # Selecteur fr-BE/FR/CH
│
├── notifications/
│   └── notification-bell.tsx          # Cloche notifications
│
├── onboarding/
│   └── onboarding-wizard.tsx          # Wizard 5 etapes
│
├── performance/
│   ├── index.ts
│   ├── lazy-component.tsx             # Lazy loading wrapper
│   └── web-vitals.tsx                 # Core Web Vitals
│
├── quotes/                            # [CORE] Composants devis
│   ├── advanced-editor.tsx            # Editeur avance
│   ├── compliance-alert.tsx           # Alerte conformite
│   ├── creation-mode-selector.tsx     # Selecteur mode creation
│   ├── legal-risk-alert.tsx           # Alerte risque legal
│   ├── pdf-template-selector.tsx      # Selecteur template PDF
│   ├── quick-approve-editor.tsx       # Editeur approbation rapide
│   ├── quote-comments.tsx             # Commentaires devis
│   ├── quote-filters.tsx              # Filtres recherche
│   ├── quote-pdf-document.tsx         # Document PDF React-PDF
│   ├── quote-pdf-preview.tsx          # Preview PDF
│   └── quote-wizard.tsx               # Wizard creation
│
├── settings/
│   ├── construction-mode-toggle.tsx   # Mode construction
│   └── theme-selector.tsx             # Selecteur theme
│
├── subscription/
│   ├── subscription-alert.tsx         # Alerte limite atteinte
│   └── usage-card.tsx                 # Carte utilisation
│
├── theme-provider.tsx                 # Provider next-themes
├── theme-toggle.tsx                   # Toggle dark/light
│
├── ui/                                # [SHADCN] 32 composants
│   ├── alert.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── collapsible.tsx
│   ├── data-table.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── interactive-tooltip.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── skeleton.tsx
│   ├── skip-link.tsx
│   ├── slider.tsx
│   ├── swipeable-card.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   └── tooltip.tsx
│
└── widget/
    └── quote-request-widget.tsx       # Widget embeddable
```

---

## src/contexts/ - React Contexts (7 files)

```
src/contexts/
├── accessibility-context.tsx          # Preferences accessibilite
├── branding-context.tsx               # Branding dynamique white-label
├── DemoModeContext.tsx                # Mode demonstration
├── locale-context.tsx                 # Multi-locale (BE/FR/CH)
├── OrganizationContext.tsx            # Context organisation
├── theme-context.tsx                  # Theme variants
└── ui-mode-context.tsx                # Mode UI (compact/comfortable)
```

---

## src/hooks/ - Custom Hooks (5 files)

```
src/hooks/
├── use-locale.ts                      # Hook locale actuelle
├── use-media-query.ts                 # Detection breakpoints
├── use-subscription.ts                # Hook abonnement user
├── use-swipe-gesture.ts               # Gestes swipe mobile
└── use-toast.ts                       # Notifications toast
```

---

## src/lib/ - Utilities (51 modules)

```
src/lib/
├── __tests__/                         # Tests unitaires
│   ├── epc-qr.test.ts                 # Tests QR codes EPC
│   ├── legal-risk.test.ts             # Tests risques legaux
│   ├── locale-packs.test.ts           # Tests locales
│   ├── pdf-cache.test.ts              # Tests cache PDF
│   └── setup.ts                       # Setup Vitest
│
├── ai/
│   ├── cache.ts                       # Cache reponses IA
│   └── index.ts                       # Client Anthropic
│
├── api/
│   └── auth.ts                        # Auth API helpers
│
├── import/
│   └── csv-importer.ts                # Import CSV devis
│
├── integrations/
│   ├── docusign.ts                    # Integration DocuSign
│   ├── hubspot.ts                     # Integration HubSpot
│   ├── index.ts                       # Registry integrations
│   ├── quickbooks.ts                  # Integration QuickBooks
│   └── types.ts                       # Types integrations
│
├── invoices/
│   └── invoice-generator.ts           # Generateur factures
│
├── legal-risk/
│   ├── engine.ts                      # Moteur analyse risques
│   ├── index.ts                       # Exports
│   ├── patterns.ts                    # Patterns detection
│   └── types.ts                       # Types risques
│
├── locale-packs/                      # [LOCALE] Packs localisation
│   ├── fr-be.ts                       # Belgique (TVA 21%, RGIE)
│   ├── fr-ch.ts                       # Suisse (TVA 7.7%, CHF)
│   ├── fr-fr.ts                       # France (TVA 20%)
│   ├── index.ts                       # Manager locales
│   └── types.ts                       # Types LocalePack
│
├── pdf/
│   ├── cache.ts                       # Cache PDF generes
│   ├── epc-qr.ts                      # QR codes paiement EPC
│   ├── index.ts                       # Exports
│   └── types.ts                       # Types PDF
│
├── performance/
│   └── prefetch.ts                    # Prefetch routes
│
├── pricing/
│   └── pricing-strategy.ts            # Strategie tarification
│
├── referral/
│   ├── constants.ts                   # Constantes parrainage
│   └── referral-system.ts             # Systeme parrainage
│
├── rgpd/                              # [GDPR] Conformite RGPD
│   ├── consent.ts                     # Gestion consentements
│   ├── data-retention.ts              # Retention donnees
│   ├── encryption.ts                  # Chiffrement AES-256
│   └── human-in-the-loop.ts           # HITL validation IA
│
├── supabase/
│   ├── client.ts                      # Client browser
│   └── server.ts                      # Client server (cookies)
│
├── suppliers/
│   ├── constants.ts                   # Constantes fournisseurs
│   └── supplier-database.ts           # Base fournisseurs
│
├── templates/
│   └── template-editor.ts             # Editeur templates
│
├── workflow/
│   └── workflow-engine.ts             # Moteur workflows
│
├── analytics.ts                       # Analytics tracking
├── audit.ts                           # Audit logging
├── cors.ts                            # CORS configuration
├── monitoring.ts                      # Monitoring/alerting
├── pdf-templates.ts                   # Templates PDF
├── performance.ts                     # Performance utils
├── rate-limit.ts                      # Rate limiting Redis
├── rbac.ts                            # RBAC 4 roles
└── utils.ts                           # Utilities (cn, etc.)
```

---

## src/types/ - TypeScript Types

```
src/types/
└── database.ts                        # Types complets
    ├── SectorType (27 secteurs)
    ├── QuoteStatus (7 statuts)
    ├── SubscriptionPlan (4 plans)
    ├── Profile, Quote, QuoteItem
    ├── Subscription, UsageStats
    ├── SECTORS, QUOTE_STATUSES
    ├── TAX_RATES, SECTOR_CONFIGS
    └── PLAN_FEATURES
```

---

## src/middleware.ts - Edge Middleware

```typescript
// Fonctionnalites middleware Edge:
- Authentication check (Supabase)
- Admin access control (email whitelist)
- Rate limiting headers
- CORS validation
- Security headers (X-Frame-Options, etc.)
- Route protection (/dashboard/*, /admin/*)
```

---

## Entry Points Summary

| Entry | Path | Description |
|-------|------|-------------|
| Landing | `src/app/page.tsx` | Homepage publique |
| Login | `src/app/(auth)/login/page.tsx` | Authentification |
| Register | `src/app/(auth)/register/page.tsx` | Inscription |
| Dashboard | `src/app/(dashboard)/dashboard/page.tsx` | Tableau de bord |
| Quotes | `src/app/(dashboard)/quotes/page.tsx` | Gestion devis |
| Quote New | `src/app/(dashboard)/quotes/new/page.tsx` | Creation devis IA |
| Admin | `src/app/(admin)/admin/page.tsx` | Panel admin |
| API Generate | `src/app/api/generate/route.ts` | Generation IA |
| Middleware | `src/middleware.ts` | Security gateway |

---

## File Statistics

| Category | Count | Description |
|----------|-------|-------------|
| **Total Files** | 221 | TypeScript/TSX |
| **Pages** | 39 | Route pages |
| **API Routes** | 28 | REST endpoints |
| **Components** | 74 | React components |
| **UI (shadcn)** | 32 | Base UI components |
| **Contexts** | 7 | React contexts |
| **Hooks** | 5 | Custom hooks |
| **Lib Modules** | 51 | Utility modules |
| **Tests** | 9 | Test files |
| **Layouts** | 4 | Route layouts |
| **Loading** | 3 | Loading states |

---

## Key Integration Points

| Integration | Location | Purpose |
|-------------|----------|---------|
| **Supabase** | `src/lib/supabase/` | Auth, DB, Storage |
| **Anthropic** | `src/lib/ai/`, `src/app/api/generate/` | IA devis |
| **Stripe** | `src/app/api/stripe/` | Paiements |
| **Upstash** | `src/lib/rate-limit.ts` | Rate limiting |
| **DocuSign** | `src/lib/integrations/docusign.ts` | Signatures |
| **QuickBooks** | `src/lib/integrations/quickbooks.ts` | Compta |
| **HubSpot** | `src/lib/integrations/hubspot.ts` | CRM |

---

*Generated by document-project workflow | BMAD Method | Exhaustive Scan | 2026-01-28*
