# DEAL - Documentation Index

> **Master Index for AI-Assisted Development**
> Last Updated: 2026-01-28 | Version: 2.2.0 | Scan Level: Exhaustive

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Name** | DEAL - Devis Enterprise Automatises en Ligne |
| **Type** | Monolith Web Application |
| **Framework** | Next.js 14.2.35 (App Router) + TypeScript 5.7.2 |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui + Framer Motion |
| **Hosting** | Vercel |
| **Production URL** | https://www.dealofficialapp.com |
| **Preview URL** | https://hubdeal-git-main-djaijos-projects.vercel.app |
| **GitHub** | https://github.com/martingeoffreyprive-hub/DEAL |

---

## Project Statistics (2026-01-28)

| Metric | Count |
|--------|-------|
| **Source Files (TS/TSX)** | 221 |
| **Lines of Code** | ~55,500 |
| **API Endpoints** | 28 |
| **UI Components** | 74 |
| **Page Routes** | 39 |
| **Contexts (React)** | 7 |
| **Lib Modules** | 51 |
| **Database Tables** | 12 |
| **Database Migrations** | 18 |
| **Test Files** | 9 |
| **Dependencies** | 57 |

---

## Tech Stack Complete

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.35 | Framework React avec App Router |
| React | 18.3.1 | UI Library |
| TypeScript | 5.7.2 | Typage statique |
| Tailwind CSS | 3.4.17 | Styling utility-first |
| shadcn/ui | latest | Components Radix UI |
| Framer Motion | 11.15.0 | Animations |
| Lucide React | 0.469.0 | Icons |
| Recharts | 2.15.0 | Charts/Graphs |
| @tremor/react | 3.18.7 | Dashboard components |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.2.35 | REST API (Edge/Serverless) |
| Supabase | 2.47.10 | Database + Auth + Storage |
| Anthropic SDK | 0.32.1 | Claude AI Integration |
| Stripe | 20.2.0 | Payments |
| Upstash Redis | 1.28.0 | Rate Limiting |

### PDF & Documents

| Technology | Version | Purpose |
|------------|---------|---------|
| @react-pdf/renderer | 4.1.5 | Generation PDF |
| qrcode | 1.5.4 | QR Codes EPC |

### Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| Vitest | 4.0.18 | Unit Tests |
| Playwright | 1.49.1 | E2E Tests |
| @testing-library/react | 16.1.0 | Component Tests |

---

## Architecture Pattern

```
src/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Route Group: Admin Panel (16 modules)
│   │   └── admin/
│   │       ├── page.tsx          # Dashboard admin
│   │       ├── users/            # Gestion utilisateurs
│   │       ├── subscriptions/    # Gestion abonnements
│   │       ├── analytics/        # Analytics avances
│   │       ├── audit-logs/       # Journaux d'audit
│   │       ├── sectors/          # Configuration secteurs
│   │       ├── templates/        # Templates devis
│   │       ├── tokens/           # Gestion tokens IA
│   │       └── settings/         # Parametres admin
│   │
│   ├── (auth)/                   # Route Group: Authentication
│   │   ├── login/                # Connexion
│   │   ├── register/             # Inscription
│   │   ├── forgot-password/      # Mot de passe oublie
│   │   ├── reset-password/       # Reinitialisation
│   │   ├── mfa-verify/           # Verification MFA
│   │   ├── onboarding/           # Parcours onboarding (5 etapes)
│   │   └── pricing/              # Page tarifs
│   │
│   ├── (dashboard)/              # Route Group: User Dashboard
│   │   ├── dashboard/            # Tableau de bord Netflix-style
│   │   ├── quotes/               # Gestion devis (CRUD complet)
│   │   │   ├── page.tsx          # Liste devis
│   │   │   ├── new/              # Creation devis IA
│   │   │   └── [id]/             # Edition devis
│   │   ├── analytics/            # Statistiques utilisateur
│   │   ├── profile/              # Profil entreprise
│   │   ├── team/                 # Gestion equipe
│   │   ├── invoices/             # Factures
│   │   ├── leads/                # Prospects
│   │   ├── templates/            # Templates personnels
│   │   ├── suppliers/            # Fournisseurs
│   │   ├── referral/             # Programme parrainage
│   │   ├── tokens/               # Tokens IA utilisateur
│   │   └── settings/             # Parametres
│   │       ├── subscription/     # Abonnement
│   │       ├── security/         # Securite & MFA
│   │       ├── integrations/     # Integrations tierces
│   │       ├── privacy/          # RGPD & Donnees
│   │       ├── appearance/       # Theme & Branding
│   │       ├── widget/           # Widget externe
│   │       └── workflows/        # Automatisations
│   │
│   ├── api/                      # API Routes (28 endpoints)
│   │   ├── auth/                 # Auth callbacks
│   │   ├── quotes/               # CRUD devis
│   │   ├── generate/             # IA generation
│   │   ├── ai-assistant/         # Assistant IA
│   │   ├── stripe/               # Paiements
│   │   ├── admin/                # API admin
│   │   ├── gdpr/                 # RGPD export/delete
│   │   ├── v1/                   # API publique v1
│   │   └── user/                 # Gestion compte
│   │
│   ├── b2c/                      # Landing B2C
│   ├── docs/                     # Documentation utilisateur
│   ├── layout.tsx                # Root layout (9 providers)
│   └── page.tsx                  # Landing page
│
├── components/                   # 74 UI Components
│   ├── ui/                       # shadcn/ui (32 components)
│   ├── brand/                    # DEAL branding (logo, icons)
│   ├── layout/                   # Header, Sidebar, Footer
│   ├── quotes/                   # Composants devis
│   ├── dashboard/                # Hero, Carousel, Stats
│   ├── subscription/             # Usage, Plans
│   ├── animations/               # Transitions, Motion
│   ├── settings/                 # Forms parametres
│   ├── demo/                     # Mode demo
│   └── performance/              # Web Vitals
│
├── contexts/                     # 7 React Contexts
│   ├── locale-context.tsx        # Multi-locale (fr-BE, fr-FR, fr-CH)
│   ├── theme-context.tsx         # Theme variant
│   ├── accessibility-context.tsx # Accessibilite
│   ├── branding-context.tsx      # White-label
│   ├── ui-mode-context.tsx       # UI mode
│   └── DemoModeContext.tsx       # Mode demo
│
├── hooks/                        # Custom Hooks
│   └── use-media-query.ts
│
├── lib/                          # 51 Modules utilitaires
│   ├── supabase/                 # Clients Supabase
│   │   ├── client.ts             # Client browser
│   │   └── server.ts             # Client server
│   ├── locale-packs/             # Packs localisation
│   │   ├── fr-be.ts              # Belgique
│   │   ├── fr-fr.ts              # France
│   │   └── fr-ch.ts              # Suisse
│   ├── legal-risk/               # Analyse risques legaux
│   ├── pdf/                      # Generation PDF + QR EPC
│   ├── ai/                       # Cache IA
│   ├── api/                      # Auth API
│   ├── rgpd/                     # RGPD compliance
│   │   ├── encryption.ts         # Chiffrement
│   │   ├── consent.ts            # Consentements
│   │   ├── data-retention.ts     # Retention donnees
│   │   └── human-in-the-loop.ts  # HITL IA
│   ├── integrations/             # Integrations tierces
│   │   ├── docusign.ts           # Signature electronique
│   │   ├── quickbooks.ts         # Comptabilite
│   │   └── hubspot.ts            # CRM
│   ├── workflow/                 # Moteur workflows
│   ├── invoices/                 # Generateur factures
│   ├── referral/                 # Systeme parrainage
│   ├── suppliers/                # Base fournisseurs
│   ├── templates/                # Editeur templates
│   ├── pricing/                  # Strategie tarification
│   ├── import/                   # Importateur CSV
│   ├── performance/              # Prefetch
│   ├── rbac.ts                   # RBAC (4 roles)
│   ├── rate-limit.ts             # Rate limiting Redis
│   ├── audit.ts                  # Audit logs
│   ├── cors.ts                   # CORS config
│   ├── analytics.ts              # Analytics
│   └── monitoring.ts             # Monitoring
│
├── types/                        # TypeScript Types
│   └── database.ts               # 27 secteurs, 7 statuts, Plans
│
├── middleware.ts                 # Edge Middleware
│
└── tests/                        # Tests
    ├── e2e/                      # Playwright E2E
    ├── components/               # Component tests
    └── api/                      # API tests
```

---

## Database Schema (12 Tables)

### Core Tables

| Table | Description | Key Fields | RLS |
|-------|-------------|------------|-----|
| `profiles` | Profils utilisateurs | id, company_name, siret, iban, default_sector, onboarding_* | Yes |
| `quotes` | Devis | id, user_id, quote_number, client_*, status, total, locale | Yes |
| `quote_items` | Lignes devis | id, quote_id, description, quantity, unit_price, order_index | Yes |
| `subscriptions` | Abonnements | id, user_id, plan_name, status, stripe_* | Yes |
| `usage_stats` | Stats utilisation | id, user_id, month_year, quotes_created, ai_requests | Yes |
| `user_sectors` | Secteurs utilisateur | id, user_id, sector, is_primary | Yes |

### Enterprise Tables

| Table | Description | Key Fields | RLS |
|-------|-------------|------------|-----|
| `organizations` | Organisations | id, name, slug, stripe_*, subscription_* | Yes |
| `organization_members` | Membres orga | id, org_id, user_id, role (owner/admin/member/viewer) | Yes |
| `organization_invitations` | Invitations | id, org_id, email, token, status | Yes |
| `api_keys` | Cles API | id, user_id, key_hash, scopes, rate_limit | Yes |
| `api_request_logs` | Logs API | id, api_key_id, method, path, status_code | Yes |
| `audit_logs` | Journaux audit | id, user_id, action, resource_type, details | Yes |

### Enums

| Type | Values |
|------|--------|
| `sector_type` | 27 secteurs (ELECTRICITE, PLOMBERIE, CONSTRUCTION...) |
| `quote_status` | draft, sent, accepted, rejected, finalized, exported, archived |
| `subscription_plan` | free, pro, business, corporate |
| `org_role` | owner, admin, member, viewer |
| `audit_action` | CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT... |

---

## API Endpoints (28 Total)

### Authentication (4)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/callback` | OAuth callback Supabase |
| GET | `/api/auth/logout` | Deconnexion |
| DELETE | `/api/user/delete-account` | Suppression compte |
| GET | `/api/user/data-export` | Export donnees utilisateur |

### Quotes Core (6)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotes` | Liste devis pagines |
| POST | `/api/quotes` | Creer devis |
| GET | `/api/quotes/[id]` | Recuperer devis |
| PATCH | `/api/quotes/[id]` | Mettre a jour devis |
| DELETE | `/api/quotes/[id]` | Supprimer devis |
| GET | `/api/quotes/[id]/pdf` | Generer PDF |

### AI (2)

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/api/generate` | 5/min | Generation IA devis depuis transcription |
| POST | `/api/ai-assistant` | 5/min | Assistant IA conversationnel |

### Stripe (3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/checkout` | Creer session checkout |
| POST | `/api/stripe/portal` | Portail client Stripe |
| POST | `/api/stripe/webhook` | Webhooks Stripe |

### Admin (3)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Statistiques globales |
| POST | `/api/admin/update-plan` | Admin | Changer plan utilisateur |
| GET | `/api/admin/users` | Admin | Liste utilisateurs |

### GDPR (2)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gdpr/export` | Export complet donnees |
| DELETE | `/api/gdpr/delete` | Suppression donnees |

### Public API v1 (5)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/quotes` | API Key | Liste devis |
| POST | `/api/v1/quotes` | API Key | Creer devis |
| GET | `/api/v1/quotes/[id]` | API Key | Recuperer devis |
| PATCH | `/api/v1/quotes/[id]` | API Key | Modifier devis |
| DELETE | `/api/v1/quotes/[id]` | API Key | Supprimer devis |

### Other (3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload fichiers (logo) |
| GET | `/api/health` | Health check |
| GET | `/api/og` | Open Graph images |

---

## Business Features

### 27 Secteurs d'Activite

| Categorie | Secteurs |
|-----------|----------|
| **BTP** | Electricite, Plomberie, Chauffage, Construction, Renovation, Peinture, Menuiserie, Toiture, Carrelage |
| **Services** | Nettoyage, Demenagement, Depannage, Securite |
| **Outdoor** | Jardinage, Paysagisme |
| **Pro Services** | Informatique, Comptabilite, Juridique, Conseil, Formation |
| **Event** | Evenementiel, Restauration, Transport |
| **Personal** | Sante, Beaute |
| **Creative** | Photo/Video, Design, Marketing |

### Multi-Locale Compliance

| Locale | Pays | TVA | Monnaie | Specificites |
|--------|------|-----|---------|--------------|
| `fr-BE` | Belgique | 21% (6% reno) | EUR | RGIE, Certification Conform |
| `fr-FR` | France | 20% (10% reno) | EUR | Mentions legales specifiques |
| `fr-CH` | Suisse | 7.7% | CHF | Numerotation distincte |

### Plans d'Abonnement

| Plan | Prix/mois | Secteurs | Devis/mois | Features |
|------|-----------|----------|------------|----------|
| Free | 0 EUR | 1 | 5 | PDF basique |
| Pro | 29 EUR | 10 | 100 | IA, Templates |
| Business | 79 EUR | Illimite | Illimite | API, Support prio |
| Corporate | Sur mesure | Illimite | Illimite | White-label, Dev custom |

### Integrations Disponibles

| Integration | Type | Status |
|-------------|------|--------|
| **Stripe** | Paiements | Production |
| **Anthropic Claude** | IA | Production |
| **Supabase** | BaaS | Production |
| **Upstash Redis** | Rate Limit | Production |
| **DocuSign** | Signatures | Available |
| **QuickBooks** | Comptabilite | Available |
| **HubSpot** | CRM | Available |
| Salesforce | CRM | Planned |
| Slack | Notifications | Planned |

---

## Security Configuration

| Feature | Implementation |
|---------|----------------|
| **Authentication** | Supabase Auth + MFA TOTP |
| **Authorization** | RBAC 4 roles (owner/admin/member/viewer) |
| **Rate Limiting** | Upstash Redis (general 10/min, AI 5/min, auth 5/15min) |
| **Row-Level Security** | PostgreSQL RLS on all tables |
| **Encryption** | AES-256 donnees sensibles |
| **CORS** | Middleware validation |
| **Admin Access** | Email whitelist |
| **Audit Logs** | Complete action tracking |
| **GDPR** | Export + Right to Delete |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key
- Stripe account (optional for payments)
- Upstash account (optional for rate limiting)

### Installation

```bash
# Clone
git clone https://github.com/martingeoffreyprive-hub/DEAL.git
cd DEAL

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Required Environment Variables

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (Required for AI)
ANTHROPIC_API_KEY=

# Stripe (Required for payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_MONTHLY_PRICE_ID=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_ULTIMATE_MONTHLY_PRICE_ID=

# Upstash (Required for rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Documentation Files

### Core Documentation

| Document | Description |
|----------|-------------|
| [Source Tree Analysis](./source-tree-analysis.md) | Structure complete annotee |
| [Development Guide](./development-guide.md) | Guide dev local |
| [Deployment Guide](./deployment-guide.md) | Guide deploiement Vercel |

### Generated Artifacts

| Document | Description |
|----------|-------------|
| [Production Action Plan](./generated/DEAL-Production-Action-Plan.md) | Plan 5 phases, 8 semaines |
| [Admin Panel Specs](./generated/DEAL-Admin-Panel-Specs.md) | Specs admin 16 modules |
| [UX Design Vision](./generated/DEAL-UX-Design-Vision.md) | Vision UX 2026 |

### Brand & Security

| Document | Description |
|----------|-------------|
| [Brand Guidelines](./DEAL-Brand-Guidelines.md) | Charte graphique |
| [Pitch Deck](./DEAL-Pitch-Deck-Investisseurs.md) | Presentation investisseurs |
| [Security Policy](./security/SECURITY-POLICY.md) | Politique securite |
| [Incident Response](./security/INCIDENT-RESPONSE.md) | Plan incidents |

---

## Branding

| Element | Value |
|---------|-------|
| **Primary Color** | Navy #252B4A |
| **Accent Color** | Coral #E85A5A |
| **Font** | Inter (Google Fonts) |
| **Logo** | DEAL. (wordmark + point coral) |
| **Slogan** | "Votre voix a de la valeur, Deal lui donne un prix" |

---

## Contact & Support

- **Production**: https://www.dealofficialapp.com
- **GitHub**: https://github.com/martingeoffreyprive-hub/DEAL
- **Made in**: Wallonia, Belgium

---

*Generated by document-project workflow | BMAD Method | Exhaustive Scan | 2026-01-28*
