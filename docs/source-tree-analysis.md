# DEAL - Source Tree Analysis

> Generated: 2026-01-28 | Scan Level: Exhaustive | Mode: Full Rescan

## Project Overview

**Type:** Monolith Web Application
**Framework:** Next.js 14 (App Router) + TypeScript
**Database:** Supabase (PostgreSQL)
**Styling:** Tailwind CSS + shadcn/ui

---

## Directory Structure

```
DEAL/
├── 📁 src/                          # Source code root
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── 📁 (admin)/              # Admin route group
│   │   │   └── 📁 admin/            # Admin panel pages
│   │   │       ├── page.tsx         # Dashboard admin
│   │   │       ├── users/           # Gestion utilisateurs
│   │   │       ├── subscriptions/   # Gestion abonnements
│   │   │       └── settings/        # Paramètres admin
│   │   │
│   │   ├── 📁 (auth)/               # Authentication route group
│   │   │   ├── login/               # Page de connexion
│   │   │   ├── register/            # Page d'inscription
│   │   │   ├── forgot-password/     # Récupération mot de passe
│   │   │   ├── reset-password/      # Réinitialisation mot de passe
│   │   │   ├── mfa-verify/          # Vérification MFA
│   │   │   ├── onboarding/          # Onboarding utilisateur
│   │   │   └── pricing/             # Page tarification
│   │   │
│   │   ├── 📁 (dashboard)/          # Main app route group
│   │   │   ├── dashboard/           # Tableau de bord principal
│   │   │   ├── quotes/              # Gestion des devis ⭐
│   │   │   │   ├── page.tsx         # Liste des devis
│   │   │   │   ├── new/             # Création nouveau devis
│   │   │   │   └── [id]/            # Détail/édition devis
│   │   │   ├── invoices/            # Gestion factures
│   │   │   ├── leads/               # Gestion prospects
│   │   │   ├── analytics/           # Analytiques
│   │   │   ├── profile/             # Profil utilisateur
│   │   │   ├── settings/            # Paramètres utilisateur
│   │   │   │   ├── subscription/    # Gestion abonnement
│   │   │   │   ├── appearance/      # Thème/apparence
│   │   │   │   ├── security/        # Sécurité (MFA)
│   │   │   │   ├── integrations/    # Intégrations tierces
│   │   │   │   └── workflows/       # Workflows automatisés
│   │   │   ├── suppliers/           # Gestion fournisseurs
│   │   │   ├── team/                # Gestion équipe
│   │   │   ├── templates/           # Templates de devis
│   │   │   ├── referral/            # Programme parrainage
│   │   │   └── tokens/              # TokenDEAL (gamification)
│   │   │
│   │   ├── 📁 api/                  # API Routes (26 endpoints)
│   │   │   ├── admin/               # Admin API
│   │   │   │   └── update-plan/     # Changement plan manuel
│   │   │   ├── ai-assistant/        # Assistant IA
│   │   │   ├── analytics/           # API analytiques
│   │   │   ├── generate/            # Génération PDF/devis
│   │   │   ├── hitl/                # Human-in-the-loop
│   │   │   ├── invoices/            # CRUD factures
│   │   │   ├── leads/               # CRUD prospects
│   │   │   ├── quotes/              # CRUD devis ⭐
│   │   │   ├── referral/            # API parrainage
│   │   │   ├── stripe/              # Webhooks Stripe
│   │   │   ├── tokens/              # API TokenDEAL
│   │   │   ├── user/                # API utilisateur
│   │   │   ├── v1/                  # API publique v1
│   │   │   ├── widget/              # Widget embed
│   │   │   └── workflows/           # API workflows
│   │   │
│   │   ├── 📁 auth/                 # Auth handlers
│   │   │   ├── callback/            # OAuth callback
│   │   │   └── logout/              # Route déconnexion
│   │   │
│   │   ├── 📁 b2c/                  # Landing page B2C
│   │   ├── 📁 docs/                 # Documentation in-app
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   ├── globals.css              # Global styles
│   │   └── icon.svg                 # Favicon
│   │
│   ├── 📁 components/               # React Components (78+)
│   │   ├── 📁 admin/                # Composants admin
│   │   ├── 📁 auth/                 # Composants auth
│   │   ├── 📁 brand/                # Branding (logo, icons)
│   │   ├── 📁 dashboard/            # Composants dashboard
│   │   ├── 📁 demo/                 # Mode démo
│   │   ├── 📁 gamification/         # Gamification
│   │   ├── 📁 layout/               # Layout (sidebar, header, nav)
│   │   ├── 📁 onboarding/           # Composants onboarding
│   │   ├── 📁 quotes/               # Composants devis ⭐
│   │   ├── 📁 settings/             # Composants paramètres
│   │   ├── 📁 subscription/         # Composants abonnement
│   │   ├── 📁 ui/                   # UI primitives (shadcn/ui)
│   │   └── 📁 widget/               # Widget embeddable
│   │
│   ├── 📁 contexts/                 # React Contexts
│   │   ├── locale-context.tsx       # i18n/l10n
│   │   ├── theme-context.tsx        # Thème
│   │   ├── branding-context.tsx     # Branding dynamique
│   │   ├── accessibility-context.tsx # Accessibilité
│   │   └── DemoModeContext.tsx      # Mode démo
│   │
│   ├── 📁 hooks/                    # Custom React Hooks
│   │   ├── use-toast.ts             # Notifications toast
│   │   ├── use-quote-filters.ts     # Filtres devis
│   │   └── use-mobile.tsx           # Détection mobile
│   │
│   ├── 📁 lib/                      # Utilities & Config
│   │   ├── 📁 supabase/             # Supabase clients
│   │   │   ├── client.ts            # Browser client
│   │   │   ├── server.ts            # Server client
│   │   │   └── middleware.ts        # Middleware client
│   │   ├── utils.ts                 # Utilities (cn, etc.)
│   │   ├── cors.ts                  # CORS configuration
│   │   └── pricing.ts               # Pricing plans config
│   │
│   ├── 📁 styles/                   # Additional styles
│   │   └── themes.css               # Theme variants
│   │
│   ├── 📁 types/                    # TypeScript types
│   │   └── supabase.ts              # Supabase generated types
│   │
│   └── middleware.ts                # Next.js middleware ⚡
│       └── Rate limiting, CORS, Auth, Admin check
│
├── 📁 public/                       # Static assets
│   ├── 📁 logos/                    # Brand logos
│   └── manifest.json                # PWA manifest
│
├── 📁 supabase/                     # Database
│   ├── 📁 migrations/               # SQL migrations
│   └── FULL_MIGRATION.sql           # Complete schema
│
├── 📁 docs/                         # Documentation
│   └── 📁 generated/                # Generated docs
│
├── next.config.mjs                  # Next.js config
├── tailwind.config.ts               # Tailwind config
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```

---

## Critical Directories

### 1. `/src/app/api/` - API Layer
- **26 API endpoints** organized by domain
- REST architecture with Next.js Route Handlers
- Rate limiting via Upstash Redis
- Authentication via Supabase middleware

### 2. `/src/app/(dashboard)/quotes/` - Core Feature
- Main business logic for quote management
- Vocal dictation integration
- PDF generation
- AI assistant integration

### 3. `/src/components/ui/` - Design System
- Based on shadcn/ui
- Custom DEAL branding
- Accessible components (WCAG)

### 4. `/src/lib/supabase/` - Database Layer
- Server/Client/Middleware separation
- Type-safe queries with generated types

### 5. `/src/middleware.ts` - Security Gateway
- Authentication checks
- Admin access control
- Rate limiting
- CORS headers
- CSP (temporarily disabled)

---

## Entry Points

| Entry Point | Path | Purpose |
|-------------|------|---------|
| **Landing Page** | `/src/app/page.tsx` | Public homepage |
| **Login** | `/src/app/(auth)/login/page.tsx` | User authentication |
| **Dashboard** | `/src/app/(dashboard)/dashboard/page.tsx` | Main app entry |
| **Admin** | `/src/app/(admin)/admin/page.tsx` | Admin panel |
| **API** | `/src/app/api/` | REST API endpoints |

---

## Key Integration Points

1. **Supabase** - Authentication, Database, Storage
2. **Stripe** - Payments, Subscriptions
3. **Anthropic** - AI Assistant (Claude)
4. **Upstash Redis** - Rate Limiting
5. **Vercel** - Hosting, Edge Functions

---

## File Statistics

| Category | Count |
|----------|-------|
| React Components | 78+ |
| API Endpoints | 26 |
| Database Tables | 30+ |
| Pages/Routes | 35+ |
| Custom Hooks | 10+ |
| Context Providers | 6 |

---

*Document généré automatiquement par le workflow document-project*
