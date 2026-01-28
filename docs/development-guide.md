# Guide de Developpement DEAL

> Guide complet pour configurer, developper et deployer l'application DEAL.
> Derniere mise a jour : Janvier 2026 | Version : 2.0.0

---

## Table des matieres

1. [Prerequis](#prerequis)
2. [Installation](#installation)
3. [Variables d'environnement](#variables-denvironnement)
4. [Developpement local](#developpement-local)
5. [Structure du projet](#structure-du-projet)
6. [Stack de tests](#stack-de-tests)
7. [Build et deploiement](#build-et-deploiement)
8. [Configuration Next.js](#configuration-nextjs)
9. [Middleware](#middleware)
10. [Base de donnees](#base-de-donnees)
11. [Conventions de code](#conventions-de-code)

---

## Prerequis

### Logiciels requis

| Outil | Version minimale | Usage |
|---|---|---|
| **Node.js** | 18.x ou superieur | Runtime JavaScript |
| **npm** ou **pnpm** | npm 9+ / pnpm 8+ | Gestionnaire de paquets |
| **Git** | 2.x | Controle de version |
| **TypeScript** | 5.7+ (inclus) | Typage statique |

### Comptes et services externes

| Service | Obligatoire | Usage |
|---|---|---|
| **Supabase** | Oui | Base de donnees PostgreSQL, authentification, stockage, temps reel |
| **Stripe** | Oui | Paiements et abonnements |
| **Anthropic** | Oui | Generation de devis par IA (Claude) |
| **Upstash** | Oui | Redis pour le rate limiting en Edge |
| **Vercel** | Recommande | Hebergement et deploiement |
| **DocuSign** | Optionnel | Signature electronique |
| **HubSpot** | Optionnel | Synchronisation CRM |
| **QuickBooks** | Optionnel | Integration comptable |

---

## Installation

### 1. Cloner le depot

```bash
git clone https://github.com/martingeoffreyprive-hub/DEAL.git
cd DEAL
```

### 2. Installer les dependances

```bash
npm install
# ou
pnpm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Editez `.env.local` et remplissez toutes les valeurs requises (voir section suivante).

### 4. Lancer le serveur de developpement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Variables d'environnement

Copiez `.env.example` vers `.env.local`. Voici la liste complete des variables :

### Supabase (Requis)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase (ex: `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle publique (anon key) - exposable cote client |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle de service - **NE JAMAIS exposer cote client** |

### Anthropic (Requis)

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Cle API Anthropic pour la generation IA (`sk-ant-api03-...`) |

### Application

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | URL de l'application (ex: `http://localhost:3000`) |
| `NODE_ENV` | Environnement : `development` ou `production` |

### Stripe (Requis)

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Cle secrete Stripe (`sk_test_...` ou `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe (`whsec_...`) |
| `STRIPE_STARTER_MONTHLY_PRICE_ID` | ID du prix mensuel du plan Starter |
| `STRIPE_STARTER_YEARLY_PRICE_ID` | ID du prix annuel du plan Starter |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | ID du prix mensuel du plan Pro |
| `STRIPE_PRO_YEARLY_PRICE_ID` | ID du prix annuel du plan Pro |
| `STRIPE_ULTIMATE_MONTHLY_PRICE_ID` | ID du prix mensuel du plan Ultimate |
| `STRIPE_ULTIMATE_YEARLY_PRICE_ID` | ID du prix annuel du plan Ultimate |

### Upstash Redis (Requis)

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | URL REST de votre base Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST Upstash |

### Integrations optionnelles

| Variable | Description |
|---|---|
| `DOCUSIGN_AUTH_SERVER` | Serveur d'authentification DocuSign |
| `DOCUSIGN_API_BASE` | URL de base de l'API DocuSign |
| `DOCUSIGN_INTEGRATION_KEY` | Cle d'integration DocuSign |
| `DOCUSIGN_SECRET_KEY` | Cle secrete DocuSign |
| `DOCUSIGN_ACCOUNT_ID` | ID de compte DocuSign |
| `HUBSPOT_CLIENT_ID` | ID client HubSpot |
| `HUBSPOT_CLIENT_SECRET` | Secret client HubSpot |
| `QUICKBOOKS_CLIENT_ID` | ID client QuickBooks |
| `QUICKBOOKS_CLIENT_SECRET` | Secret client QuickBooks |
| `QUICKBOOKS_REALM_ID` | ID du realm QuickBooks |
| `QUICKBOOKS_SANDBOX` | Mode sandbox QuickBooks (`true`/`false`) |

---

## Developpement local

### Commandes disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Demarre le serveur de developpement sur `localhost:3000` |
| `npm run build` | Compile l'application pour la production |
| `npm run start` | Demarre le serveur de production |
| `npm run lint` | Execute ESLint pour verifier le code |
| `npm run type-check` | Verification des types TypeScript (`tsc --noEmit`) |
| `npm run test` | Lance les tests en mode watch (Vitest) |
| `npm run test:run` | Execute tous les tests une seule fois |
| `npm run test:coverage` | Execute les tests avec rapport de couverture |

### Workflow de developpement

1. Creer une branche depuis `main`
2. Developper avec `npm run dev` (rechargement a chaud)
3. Verifier les types : `npm run type-check`
4. Lancer le linter : `npm run lint`
5. Executer les tests : `npm run test:run`
6. Creer une Pull Request vers `main`

---

## Structure du projet

```
deal/
├── docs/                    # Documentation du projet
├── public/                  # Fichiers statiques (images, favicon)
├── src/
│   ├── app/                 # Pages et routes Next.js (App Router)
│   │   ├── (auth)/          # Routes d'authentification (login, register)
│   │   ├── (dashboard)/     # Routes protegees (dashboard, quotes, settings)
│   │   ├── admin/           # Panneau d'administration
│   │   ├── api/             # Routes API (REST endpoints)
│   │   │   ├── ai/          # Endpoints IA (generation de devis)
│   │   │   ├── stripe/      # Webhooks et API Stripe
│   │   │   ├── quotes/      # CRUD des devis
│   │   │   └── admin/       # API d'administration
│   │   ├── layout.tsx       # Layout racine
│   │   └── page.tsx         # Page d'accueil
│   ├── components/          # Composants React reutilisables
│   │   ├── ui/              # Composants shadcn/ui (31 composants)
│   │   ├── brand/           # Composants de marque (logos, loading, etc.)
│   │   ├── pdf/             # Composants de generation PDF
│   │   ├── dashboard/       # Composants du tableau de bord
│   │   └── ...              # Autres categories de composants
│   ├── lib/                 # Utilitaires et logique metier
│   │   ├── supabase/        # Clients Supabase (client, serveur, middleware)
│   │   ├── stripe/          # Utilitaires Stripe
│   │   ├── cors.ts          # Configuration CORS
│   │   └── __tests__/       # Tests unitaires
│   ├── hooks/               # Hooks React personnalises
│   ├── types/               # Definitions de types TypeScript
│   └── middleware.ts        # Middleware Edge (auth, rate limiting, securite)
├── supabase/
│   ├── migrations/          # Migrations SQL de la base de donnees
│   └── config.toml          # Configuration Supabase locale
├── .env.example             # Template des variables d'environnement
├── next.config.mjs          # Configuration Next.js
├── tailwind.config.ts       # Configuration Tailwind CSS
├── tsconfig.json            # Configuration TypeScript
├── vitest.config.ts         # Configuration Vitest
└── package.json             # Dependances et scripts
```

---

## Stack de tests

### Outils

| Outil | Usage |
|---|---|
| **Vitest** | Framework de tests unitaires (compatible Jest, rapide avec Vite) |
| **Testing Library** (`@testing-library/react`) | Tests de composants React |
| **jest-dom** (`@testing-library/jest-dom`) | Matchers DOM personnalises |
| **jsdom** | Environnement DOM simule pour les tests |
| **Playwright** | Tests end-to-end (E2E) |

### Fichiers de tests existants (9 fichiers)

Les tests se trouvent dans `src/lib/__tests__/` :

| Fichier | Description |
|---|---|
| `epc-qr.test.ts` | Tests de generation de QR codes EPC (paiement) |
| `legal-risk.test.ts` | Tests de detection des risques juridiques |
| `locale-packs.test.ts` | Tests des packs de localisation |
| `pdf-cache.test.ts` | Tests du cache de generation PDF |

> **Note** : Le projet contient 9 fichiers de tests au total, couvrant la logique metier critique (generation PDF, conformite juridique, localisation, QR codes).

### Executer les tests

```bash
# Mode watch (relance automatique)
npm run test

# Execution unique
npm run test:run

# Avec couverture de code
npm run test:coverage
```

---

## Build et deploiement

### Build de production

```bash
npm run build
```

Cette commande genere un build optimise dans le dossier `.next/`.

### Mode standalone

Pour un deploiement Docker ou serverless, activez le mode standalone :

```bash
STANDALONE=true npm run build
```

Cela produit un build autonome dans `.next/standalone/` contenant toutes les dependances necessaires.

### Deploiement sur Vercel

Le projet est configure pour Vercel. Le deploiement se fait automatiquement lors d'un push sur `main`. Les variables d'environnement doivent etre configurees dans le tableau de bord Vercel.

---

## Configuration Next.js

Le fichier `next.config.mjs` contient la configuration suivante :

### Images

- **Domaines autorises** : `*.supabase.co` (stockage), `fonts.cdnfonts.com`
- **Formats optimises** : AVIF, WebP
- **Cache** : 24 heures minimum (`minimumCacheTTL: 86400`)
- **Tailles de device** : 640, 750, 828, 1080, 1200, 1920, 2048

### Compression

- Compression gzip/brotli activee (`compress: true`)

### Securite

- En-tete `X-Powered-By` desactive (`poweredByHeader: false`)
- React Strict Mode active

### Cache des assets

- Assets statiques (images, polices) : `Cache-Control: public, max-age=31536000, immutable`
- Fichiers Next.js statiques (`_next/static/`) : meme politique de cache
- DNS Prefetch active sur toutes les pages

### Redirections

- `/app` redirige vers `/dashboard` (permanent, code 301)

### Tree-shaking (optimisation des imports)

Paquets optimises via `experimental.optimizePackageImports` :
- `lucide-react`
- `@tremor/react`
- `recharts`
- `framer-motion`
- `@react-pdf/renderer`
- `date-fns`

### Server Actions

- Limite de taille du body : 2 Mo

---

## Middleware

Le middleware Edge (`src/middleware.ts`) s'execute a chaque requete et gere :

### Authentification

- **Routes protegees** : `/dashboard`, `/quotes`, `/profile`, `/settings`, `/analytics`, `/team`
- **Routes admin** : `/admin` (reserve aux emails autorises)
- **Redirection** : Les utilisateurs non authentifies sont rediriges vers `/login` avec un parametre `redirectTo`
- **Auto-redirection** : Les utilisateurs connectes accedant a `/login` ou `/register` sont rediriges vers `/dashboard`

### Rate Limiting (Upstash Redis)

Quatre niveaux de limitation :

| Type | Limite | Prefixe Redis |
|---|---|---|
| **general** | 100 requetes / minute | `rl:general` |
| **ai** | 10 requetes / minute | `rl:ai` |
| **auth** | 5 requetes / 15 minutes | `rl:auth` |
| **api** | 100 requetes / minute | `rl:api` |

L'identifiant utilise est l'ID de l'utilisateur (si connecte) ou l'adresse IP du client. En cas d'echec du rate limiter, les requetes sont autorisees (fail-open).

### CORS

- Verification de l'origine pour les routes API
- Routes permissives pour le widget et l'analytique (`PERMISSIVE_CORS_ROUTES`)
- Gestion des requetes preflight (`OPTIONS`, code 204)
- Blocage des origines non autorisees (code 403)

### En-tetes de securite

| En-tete | Valeur |
|---|---|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Camera, micro, geolocalisation desactives |
| `Strict-Transport-Security` | 1 an, includeSubDomains, preload (production uniquement) |
| `Cache-Control` (API) | `no-store, no-cache, must-revalidate` |

### Matcher

Le middleware s'applique a toutes les routes sauf les fichiers statiques (`_next/static`, `_next/image`, `favicon.ico`, images).

---

## Base de donnees

### Supabase

L'application utilise Supabase (PostgreSQL) pour :

- **Authentification** : Inscription, connexion, gestion de sessions via `@supabase/ssr`
- **Base de donnees** : Tables PostgreSQL avec Row Level Security (RLS)
- **Temps reel** : Abonnements Realtime pour les notifications et commentaires
- **Stockage** : Buckets pour les logos, documents PDF, pieces jointes

### Tables principales

| Table | Description |
|---|---|
| `profiles` | Profils utilisateurs |
| `quotes` | Devis |
| `quote_items` | Lignes de devis |
| `subscriptions` | Abonnements |
| `invoices` | Factures |
| `leads` | Prospects |

### Migrations

Les migrations SQL se trouvent dans `supabase/migrations/`. Pour les appliquer :

```bash
npx supabase db push
```

Pour creer une nouvelle migration :

```bash
npx supabase migration new nom_de_la_migration
```

Pour generer les types TypeScript :

```bash
npx supabase gen types typescript --project-id votre-project-id > src/types/supabase.ts
```

### Row Level Security (RLS)

Toutes les tables ont des politiques RLS activees :

- Les utilisateurs ne peuvent acceder qu'a leurs propres donnees
- Les routes API admin utilisent la cle `service_role` pour contourner le RLS
- Les politiques sont definies dans les fichiers de migration

### Buckets de stockage

| Bucket | Usage | Acces |
|---|---|---|
| Logos | Logos d'entreprise des utilisateurs | Public (lecture) |
| Documents | PDFs generes, pieces jointes | Prive (authentifie) |

---

## Conventions de code

### TypeScript

- **Mode strict** active (`strict: true` dans `tsconfig.json`)
- Tous les fichiers en `.ts` ou `.tsx`
- Types explicites pour les props de composants et les retours de fonctions
- Utilisation des types Supabase generes

### Tailwind CSS

- Framework CSS utilitaire principal
- Configuration etendue dans `tailwind.config.ts`
- Utilitaire `cn()` (via `clsx` + `tailwind-merge`) pour la composition de classes
- Plugin `tailwindcss-animate` pour les animations

### shadcn/ui

- Composants UI de base dans `src/components/ui/`
- Styles avec `class-variance-authority` (CVA)
- Accessibles par defaut (base Radix UI)
- 27 composants standard + 4 personnalises

### Validation avec Zod

- Schemas de validation pour toutes les routes API
- Validation cote client dans les formulaires (via `@hookform/resolvers`)
- Types TypeScript inferes depuis les schemas Zod (`z.infer<typeof schema>`)

### Formulaires

- `react-hook-form` pour la gestion des formulaires
- Resolution Zod pour la validation
- Composants de formulaire shadcn/ui (Input, Select, etc.)

### Conventions de nommage

| Element | Convention | Exemple |
|---|---|---|
| Composants | PascalCase | `QuotePDFPreview.tsx` |
| Hooks | camelCase avec prefixe `use` | `useQuotes.ts` |
| Utilitaires | camelCase | `formatCurrency.ts` |
| Types/Interfaces | PascalCase | `QuoteData`, `UserProfile` |
| Constantes | UPPER_SNAKE_CASE | `MAX_QUOTES_FREE` |
| Fichiers CSS | kebab-case | `globals.css` |
| Routes API | kebab-case | `/api/stripe/webhook` |

### Structure des composants

```tsx
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface MonComposantProps {
  titre: string;
  onAction: () => void;
}

// 3. Composant
export function MonComposant({ titre, onAction }: MonComposantProps) {
  // 4. Hooks
  const [etat, setEtat] = useState(false);

  // 5. Handlers
  const handleClick = () => {
    setEtat(true);
    onAction();
  };

  // 6. Rendu
  return (
    <div>
      <h1>{titre}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
}
```

---

*Document genere pour le projet DEAL v2.0.0*
