# DEAL - Document d'Architecture Technique

> **Version :** 1.0
> **Date :** 28 janvier 2026
> **Projet :** DEAL - Plateforme SaaS pour artisans belges
> **Type :** Monolithe Full-Stack Next.js

---

## Table des matieres

1. [Resume Executif](#1-resume-executif)
2. [Stack Technologique](#2-stack-technologique)
3. [Architecture Applicative](#3-architecture-applicative)
4. [Architecture des Donnees](#4-architecture-des-donnees)
5. [API Design](#5-api-design)
6. [Securite](#6-securite)
7. [Performance](#7-performance)
8. [Tests](#8-tests)
9. [Deploiement](#9-deploiement)
10. [Modules Metier](#10-modules-metier)

---

## 1. Resume Executif

DEAL est une plateforme SaaS destinee aux artisans belges. Elle offre une solution complete de gestion des devis, factures et relations clients, propulsee par l'intelligence artificielle.

**Proposition de valeur :**

- **Generation de devis par IA** : utilisation d'Anthropic Claude pour generer automatiquement des devis detailles (materiaux, main-d'oeuvre, postes)
- **Export PDF professionnel** : 6 templates de devis avec QR codes EPC pour paiement bancaire
- **Facturation conforme** : factures standard, acompte et solde, export Peppol XML pour la facturation electronique belge/europeenne
- **Conformite RGPD** : gestion du consentement (15 types), controle humain (HITL), politiques de retention des donnees, chiffrement AES-256-GCM
- **Multi-tenant** : organisations avec RBAC a 4 roles (owner, admin, member, viewer)
- **PWA** : fonctionnement hors-ligne avec synchronisation IndexedDB, notifications push

**Marche cible :** Artisans, entrepreneurs et PME du secteur de la construction en Belgique.

---

## 2. Stack Technologique

### 2.1 Frontend

| Technologie | Version / Detail | Role |
|---|---|---|
| **Next.js** | 14 (App Router) | Framework full-stack, SSR/SSG/ISR |
| **TypeScript** | 5.7.2 | Typage statique |
| **React** | 18+ | Bibliotheque UI |
| **Tailwind CSS** | 3.x | Systeme de styles utilitaire |
| **shadcn/ui** | 31 composants | Bibliotheque de composants UI (basee sur Radix UI) |
| **Framer Motion** | - | Animations et transitions |
| **Radix UI** | - | Primitives d'accessibilite |
| **@react-pdf/renderer** | - | Generation PDF cote client (6 templates) |

### 2.2 Backend

| Technologie | Role |
|---|---|
| **Next.js API Routes** | 28 endpoints API (route handlers) |
| **Supabase** | Base de donnees PostgreSQL, authentification, stockage |
| **Anthropic Claude** (`claude-sonnet-4-20250514`) | Generation de devis par IA |
| **Stripe** | Paiements, abonnements, portail client, webhooks |
| **Upstash Redis** | Cache, rate limiting (4 paliers) |

### 2.3 Infrastructure

| Service | Role |
|---|---|
| **Supabase (heberge)** | PostgreSQL, Auth, Storage, Edge Functions |
| **Upstash** | Redis serverless |
| **Stripe** | Facturation et abonnements |
| **Vercel** (cible) | Deploiement Next.js, Edge Runtime |

### 2.4 Integrations externes (placeholder)

- **DocuSign** : signature electronique de devis
- **HubSpot** : CRM et marketing automation
- **QuickBooks** : synchronisation comptable

---

## 3. Architecture Applicative

### 3.1 Structure du projet

```
src/
├── app/                          # App Router Next.js 14
│   ├── (auth)/                   # Groupe de routes authentification
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── mfa-verify/
│   │   ├── onboarding/
│   │   └── pricing/
│   ├── (dashboard)/              # Groupe de routes tableau de bord
│   │   ├── dashboard/
│   │   ├── quotes/               # Liste + [id] + new
│   │   ├── invoices/
│   │   ├── leads/
│   │   ├── tokens/
│   │   ├── templates/
│   │   ├── suppliers/
│   │   ├── referral/
│   │   ├── analytics/
│   │   ├── team/
│   │   ├── profile/
│   │   └── settings/
│   │       ├── subscription/
│   │       ├── security/
│   │       ├── integrations/
│   │       ├── appearance/
│   │       ├── widget/
│   │       ├── workflows/
│   │       └── privacy/
│   ├── (admin)/                  # Groupe de routes administration
│   │   └── admin/
│   │       ├── users/
│   │       ├── subscriptions/
│   │       ├── audit-logs/
│   │       ├── sectors/
│   │       ├── templates/
│   │       ├── tokens/
│   │       ├── analytics/
│   │       └── settings/
│   ├── api/                      # Route handlers API
│   ├── b2c/                      # Landing page B2C
│   ├── docs/                     # Documentation utilisateur
│   └── page.tsx                  # Page d'accueil
├── components/                   # 80 composants (49 custom + 31 shadcn/ui)
├── contexts/                     # 7 React Contexts
├── lib/                          # Utilitaires, clients, helpers
├── hooks/                        # React hooks personnalises
├── types/                        # Definitions TypeScript
└── middleware.ts                 # Edge Middleware
```

### 3.2 Pages et layouts

- **39 pages** reparties en 3 groupes de routes + pages publiques
- **4 layouts** : root, auth, dashboard, admin
- **Groupes de routes** : `(auth)` pour le parcours d'inscription/connexion, `(dashboard)` pour l'espace utilisateur, `(admin)` pour le back-office

### 3.3 Composants

- **49 composants custom** : formulaires de devis, editeur de PDF, tableaux de donnees, widgets CRM, etc.
- **31 composants shadcn/ui** : Button, Dialog, DropdownMenu, Input, Select, Table, Toast, etc.

### 3.4 Edge Middleware (`src/middleware.ts`)

Le middleware Next.js s'execute a l'Edge et gere :

- **Authentification** : verification de session Supabase, redirection vers `/login` si non authentifie
- **Rate limiting** : limitation de debit via Upstash Redis
- **CORS** : gestion des origines autorisees
- **En-tetes de securite** : X-Frame-Options, HSTS, Content-Security-Policy, etc.
- **Protection des routes admin** : verification de l'email dans la whitelist administrateur

### 3.5 React Contexts (7)

| Contexte | Role |
|---|---|
| `ThemeVariantContext` | Gestion des variantes de theme (couleurs, mode sombre) |
| `AccessibilityContext` | Preferences d'accessibilite (taille police, contraste) |
| `DemoModeContext` | Mode demonstration avec donnees fictives |
| `BrandingContext` | Personnalisation de la marque (logo, couleurs entreprise) |
| `OrganizationContext` | Organisation active, membres, roles |
| `LocaleContext` | Langue et localisation (FR, NL, EN, DE) |
| `UIModeContext` | Mode d'interface (compact, confortable) |

---

## 4. Architecture des Donnees

### 4.1 Base de donnees

- **Moteur** : PostgreSQL (Supabase hosted)
- **Tables** : 30+ tables
- **Migrations** : 17 fichiers de migration SQL
- **Fonctions/Triggers** : 30+ fonctions et triggers PostgreSQL
- **RLS** : Row Level Security active sur toutes les tables

### 4.2 Tables principales

```
profiles              # Profils utilisateurs (lie a auth.users)
organizations         # Organisations / entreprises
organization_members  # Membres avec roles RBAC
quotes                # Devis
quote_items           # Postes de devis
quote_materials       # Materiaux par poste
quote_labor           # Main-d'oeuvre par poste
invoices              # Factures
leads                 # Prospects CRM
subscriptions         # Abonnements Stripe
api_keys              # Cles API v1 (scopees)
audit_logs            # Journal d'audit
consent_records       # Consentements RGPD
tokens_accounts       # Comptes TokenDEAL
tokens_transactions   # Transactions de tokens
referrals             # Programme de parrainage
suppliers             # Fournisseurs
templates             # Templates de devis (marketplace)
sectors               # Secteurs d'activite
workflows             # Automatisations CRM
```

### 4.3 Patterns d'acces aux donnees (RLS)

| Pattern | Regle RLS |
|---|---|
| **Donnees utilisateur** | `auth.uid() = user_id` |
| **Donnees organisation** | `user_id IN (SELECT user_id FROM organization_members WHERE org_id = ...)` |
| **Donnees publiques** | `is_public = true` (templates marketplace) |
| **Admin** | Bypass via service role (API routes admin) |

### 4.4 Stockage Supabase

| Bucket | Visibilite | Contenu |
|---|---|---|
| `logos` | Public | Logos d'entreprise |
| `pdfs` | Prive | Devis et factures PDF generes |
| `signatures` | Prive | Signatures electroniques |

---

## 5. API Design

### 5.1 Vue d'ensemble

- **28 route handlers** repartis en 15 categories
- **API publique v1** : `/api/v1/quotes` avec authentification par cle API et validation Zod
- **47 endpoints HTTP** au total (en comptant les methodes GET/POST/PUT/DELETE par route)

### 5.2 Catalogue des endpoints

#### Authentification et utilisateurs
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| DELETE | `/api/user/delete-account` | Session | Suppression de compte (RGPD) |
| GET | `/api/user/data-export` | Session | Export des donnees personnelles |

#### Intelligence artificielle
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/generate` | Session | Generation de devis par IA (Claude) |
| POST | `/api/ai-assistant` | Session | Assistant IA conversationnel |

#### Devis
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/v1/quotes` | API Key | API publique v1 - CRUD devis |
| GET/PUT/DELETE | `/api/v1/quotes/[id]` | API Key | API publique v1 - Devis individuel |
| GET | `/api/quotes/[id]/pdf` | Session | Generation PDF du devis |

#### Facturation
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/invoices` | Session | CRUD factures |
| GET | `/api/invoices/[id]/peppol` | Session | Export Peppol XML |

#### Paiements Stripe
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/stripe/checkout` | Session | Creation de session Checkout |
| POST | `/api/stripe/portal` | Session | Redirection portail client |
| POST | `/api/stripe/webhook` | Signature Stripe | Webhooks (idempotent) |

#### CRM et leads
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/leads` | Session | Gestion des prospects |
| POST | `/api/widget/quote-request` | Public (CORS) | Widget de demande de devis |
| GET/POST | `/api/workflows` | Session | Automatisations CRM |

#### RGPD
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/gdpr/delete` | Session | Demande de suppression |
| GET | `/api/gdpr/export` | Session | Export donnees RGPD |

#### HITL (Human-In-The-Loop)
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/hitl` | Session | Actions de controle humain sur l'IA |

#### Tokens et parrainage
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/tokens` | Session | Solde et transactions TokenDEAL |
| GET | `/api/referral` | Session | Programme de parrainage |
| GET | `/api/referral/stats` | Session | Statistiques de parrainage |
| POST | `/api/referral/invite` | Session | Envoi d'invitation |

#### Administration
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin (whitelist) | Liste des utilisateurs |
| GET | `/api/admin/subscriptions` | Admin | Gestion des abonnements |
| POST | `/api/admin/update-plan` | Admin | Changement de plan |
| GET | `/api/admin/stats` | Admin | Statistiques plateforme |

#### Cles API et analytics
| Methode | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/api-keys` | Session | Gestion des cles API |
| POST | `/api/analytics/vitals` | Edge | Web Vitals (Core Web Vitals) |

### 5.3 Methodes d'authentification

| Methode | Utilisation | Detail |
|---|---|---|
| **Session Supabase** | Dashboard, settings | Cookie `sb-access-token`, JWT verifie par Supabase |
| **API Key (scopee)** | API publique v1 | Header `x-api-key`, permissions granulaires par scope |
| **Signature Stripe** | Webhooks | Header `stripe-signature`, verification HMAC |
| **Email whitelist** | Admin | Verification de l'email de l'utilisateur connecte |
| **Service role** | Admin + Webhooks | Bypass RLS via `supabaseAdmin` (cle service) |

### 5.4 Validation

- **Zod** pour la validation des schemas d'entree sur tous les endpoints
- Schemas partages entre frontend et backend via `src/types/`

---

## 6. Securite

### 6.1 Chiffrement

- **AES-256-GCM** pour les donnees sensibles (cles API, tokens, informations personnelles)
- **HTTPS** obligatoire (HSTS active)
- **Mots de passe** geres par Supabase Auth (bcrypt)

### 6.2 Conformite RGPD

| Mecanisme | Detail |
|---|---|
| **Gestion du consentement** | 15 types de consentement (analytics, marketing, cookies, etc.) |
| **HITL (Human-In-The-Loop)** | 18 actions requierant un controle humain, 5 niveaux de controle |
| **Export de donnees** | `/api/gdpr/export` - export complet au format JSON |
| **Suppression de compte** | `/api/user/delete-account` + `/api/gdpr/delete` |
| **Retention des donnees** | Politiques configurables par type de donnee |
| **Journal d'audit** | Toutes les operations sensibles sont tracees dans `audit_logs` |
| **Base legale** | Chaque traitement est associe a une base legale documentee |

### 6.3 En-tetes de securite

Configures dans le middleware Edge :

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 6.4 Rate Limiting (Upstash Redis)

| Palier | Limite | Fenetre | Cible |
|---|---|---|---|
| **General** | 100 requetes | 1 minute | Tous les endpoints |
| **IA** | 10 requetes | 1 minute | `/api/generate`, `/api/ai-assistant` |
| **Auth** | 5 requetes | 15 minutes | `/login`, `/register`, `/forgot-password` |
| **API v1** | 100 requetes | 1 minute | `/api/v1/*` |

### 6.5 RBAC (Role-Based Access Control)

4 roles hierarchiques au sein de chaque organisation :

| Role | Permissions |
|---|---|
| **owner** | Toutes les permissions + suppression organisation + gestion abonnement |
| **admin** | Gestion membres + modification parametres + CRUD complet |
| **member** | Creation/edition de ses propres devis et factures |
| **viewer** | Lecture seule |

### 6.6 MFA

- **TOTP** (Time-based One-Time Password) via Supabase Auth
- Configurable dans `/settings/security`
- Verification obligatoire via `/mfa-verify`

---

## 7. Performance

### 7.1 Strategies de rendu

| Strategie | Utilisation |
|---|---|
| **SSR** | Pages dashboard avec donnees dynamiques |
| **SSG** | Pages publiques (landing, pricing, docs) |
| **Edge Runtime** | Analytics (`/api/analytics/vitals`) |
| **Client-side** | Composants interactifs (editeur de devis, PDF preview) |

### 7.2 Cache

| Type | Implementation | Detail |
|---|---|---|
| **PDF Cache** | LRU en memoire | 10 Mo max, TTL 30 minutes |
| **AI Response Cache** | Upstash Redis | Cache des reponses Claude pour devis similaires |
| **Static Assets** | Next.js / CDN | Cache navigateur + CDN pour les assets statiques |

### 7.3 Optimisations UI

- **Loading skeletons** sur 3 routes critiques (dashboard, quotes, invoices)
- **Tree-shaking** pour les dependances volumineuses (react-pdf, framer-motion)
- **Code splitting** automatique par route (App Router)
- **Image optimization** via `next/image`

### 7.4 PWA et mode hors-ligne

- **Service Worker** pour la mise en cache des assets et des reponses API
- **IndexedDB** pour la synchronisation hors-ligne des devis en cours d'edition
- **Notifications push** pour les mises a jour de statut (devis accepte, paiement recu)
- **Manifest PWA** pour l'installation sur mobile

---

## 8. Tests

### 8.1 Stack de tests

| Outil | Type | Role |
|---|---|---|
| **Vitest** | Unitaire / Integration | Tests de logique metier, utilitaires, composants |
| **Playwright** | E2E | Tests de parcours utilisateur complets |
| **Testing Library** | Composants | Tests de rendu et interactions React |

### 8.2 Couverture

9 fichiers de tests couvrant :

| Domaine | Type | Description |
|---|---|---|
| **EPC QR codes** | Unitaire | Generation et validation des QR codes de paiement |
| **Risque legal** | Unitaire | Calcul des scores de risque juridique sur les devis |
| **Packs de locale** | Unitaire | Validation des traductions (FR, NL, EN, DE) |
| **PDF cache** | Unitaire | Comportement du cache LRU (eviction, TTL) |
| **Systeme de badges** | Unitaire | Attribution et calcul des badges utilisateur |
| **API quotes** | Integration | CRUD complet sur l'API publique v1 |
| **Auth E2E** | E2E | Parcours inscription, connexion, MFA |
| **Dashboard E2E** | E2E | Navigation et interactions du tableau de bord |

---

## 9. Deploiement

### 9.1 Configuration de build

```javascript
// next.config.js
{
  output: 'standalone',    // Build autonome pour deploiement conteneurise
  experimental: {
    serverActions: true,   // Server Actions Next.js 14
  }
}
```

### 9.2 Variables d'environnement (15+)

| Variable | Service | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Cle publique (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Cle service (bypass RLS) |
| `ANTHROPIC_API_KEY` | Anthropic | Cle API Claude |
| `STRIPE_SECRET_KEY` | Stripe | Cle secrete Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Secret de verification webhook |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Cle publique Stripe |
| `UPSTASH_REDIS_REST_URL` | Upstash | URL Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Token Redis |
| `NEXT_PUBLIC_APP_URL` | App | URL de base de l'application |
| `ENCRYPTION_KEY` | App | Cle AES-256-GCM |
| `ADMIN_EMAILS` | App | Emails administrateurs (whitelist) |
| `DOCUSIGN_*` | DocuSign | Configuration signature electronique |
| `HUBSPOT_*` | HubSpot | Configuration CRM |
| `QUICKBOOKS_*` | QuickBooks | Configuration comptable |

### 9.3 Infrastructure cible

```
┌─────────────────────────────────────────────────┐
│                   Utilisateur                   │
│                  (Navigateur / PWA)             │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────┐
│              Vercel Edge Network                │
│         (CDN, Edge Middleware, SSR)             │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐
│   Supabase   │ │  Stripe  │ │ Upstash  │
│  PostgreSQL  │ │ Payments │ │  Redis   │
│  Auth        │ │ Webhooks │ │  Cache   │
│  Storage     │ │          │ │  Limits  │
└──────────────┘ └──────────┘ └──────────┘
                       │
                       ▼
              ┌──────────────┐
              │  Anthropic   │
              │  Claude API  │
              │  (IA Devis)  │
              └──────────────┘
```

### 9.4 Base de donnees

- **17 migrations SQL** gerees via Supabase CLI (`supabase/migrations/`)
- **30+ fonctions et triggers** PostgreSQL pour la logique metier (calculs de totaux, mises a jour en cascade, audit automatique)
- Environnements : `local` (Supabase CLI) → `staging` → `production`

---

## 10. Modules Metier

### 10.1 Devis (Quotes)

Le module principal de l'application.

**Fonctionnalites :**
- Generation automatique par IA (Claude) : description en langage naturel → devis structure
- Edition manuelle : postes, materiaux, main-d'oeuvre, marges
- Export PDF : 6 templates professionnels avec QR code EPC pour paiement
- Commentaires et historique des versions
- Conformite legale : mentions obligatoires belges, TVA, delais
- Workflow de validation : brouillon → envoye → accepte/refuse
- Controle HITL : verification humaine avant envoi des devis generes par IA

**Pages :** `/quotes` (liste), `/quotes/new` (creation), `/quotes/[id]` (detail/edition)

### 10.2 Facturation (Invoices)

**Fonctionnalites :**
- Factures standard, d'acompte et de solde
- Generation depuis un devis accepte
- Export Peppol XML (facturation electronique europeenne)
- Suivi des paiements et relances
- Conformite fiscale belge

**Pages :** `/invoices`

### 10.3 CRM (Leads)

**Fonctionnalites :**
- Capture de prospects via widget embarquable (`/api/widget/quote-request`)
- Pipeline de qualification (nouveau → contacte → qualifie → gagne/perdu)
- Automatisation de workflows (`/settings/workflows`)
- Import/export de contacts

**Pages :** `/leads`, `/settings/widget`, `/settings/workflows`

### 10.4 Organisations (Multi-tenant)

**Fonctionnalites :**
- Creation et gestion d'organisations
- RBAC a 4 roles (owner, admin, member, viewer)
- Systeme d'invitations par email
- Gestion d'equipe et permissions

**Pages :** `/team`, `/profile`

### 10.5 Abonnements (Subscriptions)

**5 plans tarifaires :**

| Plan | Cible | Fonctionnalites cles |
|---|---|---|
| **Free** | Decouverte | 5 devis/mois, 1 utilisateur |
| **Pro** | Artisan solo | Devis illimites, IA, PDF |
| **Business** | PME | Multi-utilisateurs, CRM, analytics |
| **Corporate** | Entreprise | API, integrations, support dedie |
| **Enterprise** | Sur mesure | SLA, deploiement dedie |

**Integration Stripe :**
- Checkout Sessions pour la souscription
- Customer Portal pour la gestion
- Webhooks pour la synchronisation (idempotent)

**Pages :** `/settings/subscription`, `/pricing`

### 10.6 TokenDEAL (Monnaie interne)

**Fonctionnalites :**
- Monnaie virtuelle interne a la plateforme
- Gains : parrainage, completion de profil, utilisation reguliere
- Depenses : achat de templates, fonctionnalites premium
- Historique des transactions

**Pages :** `/tokens`, admin `/admin/tokens`

### 10.7 Programme Referents (Ambassadeurs)

**4 niveaux de parrainage :**

| Niveau | Condition | Avantage |
|---|---|---|
| **Bronze** | 1-4 filleuls | 50 TokenDEAL / filleul |
| **Silver** | 5-14 filleuls | 75 TokenDEAL / filleul |
| **Gold** | 15-49 filleuls | 100 TokenDEAL / filleul + badge |
| **Platinum** | 50+ filleuls | 150 TokenDEAL / filleul + support VIP |

**Pages :** `/referral`

### 10.8 Fournisseurs (Suppliers)

**Fonctionnalites :**
- Base de donnees de fournisseurs
- Catalogue de produits et materiaux avec prix
- Liaison automatique avec les devis (suggestions de materiaux)

**Pages :** `/suppliers`

### 10.9 Templates (Marketplace)

**Fonctionnalites :**
- Marketplace de templates de devis
- Templates gratuits et payants (achat en TokenDEAL)
- 6 templates PDF integres
- Templates communautaires

**Pages :** `/templates`, admin `/admin/templates`

---

## Annexe : Diagramme des flux de donnees

```
Utilisateur
    │
    ├── Saisie description ──→ /api/generate ──→ Claude API
    │                              │
    │                              ▼
    │                         Devis structure
    │                              │
    ├── Edition manuelle ──────────┤
    │                              │
    ├── Validation HITL ───────────┤
    │                              │
    ├── Export PDF ──→ @react-pdf ──→ Supabase Storage (pdfs)
    │
    ├── Envoi client ──→ Email + lien signature
    │                         │
    │                         ▼
    │                    DocuSign (optionnel)
    │
    ├── Acceptation ──→ Generation facture
    │                         │
    │                         ├──→ Peppol XML
    │                         └──→ QR code EPC (paiement)
    │
    └── Paiement Stripe ──→ Webhook ──→ Mise a jour statut
```

---

*Document genere le 28 janvier 2026. Ce document reflete l'etat actuel de l'architecture du projet DEAL.*
