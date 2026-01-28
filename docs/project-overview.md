# DEAL - Devis Intelligents pour Artisans Belges

## Vue d'ensemble du projet

| Attribut | Valeur |
|---|---|
| **Nom** | DEAL - Devis Intelligents pour Artisans Belges |
| **Version** | 2.0.0 |
| **Type** | Application web Full-Stack SaaS (monolithe) |
| **Framework** | Next.js 14 (App Router) |
| **Langage** | TypeScript 5.7.2 |
| **Base de donnees** | Supabase PostgreSQL |
| **Licence** | Proprietary (private) |

## Resume

DEAL est une plateforme SaaS destinee aux artisans belges, permettant de generer des devis professionnels par transcription vocale via intelligence artificielle (Claude d'Anthropic). La plateforme offre l'export en PDF, la gestion de la facturation, un CRM integre, des workflows metier et la conformite RGPD.

---

## Stack technique

### Dependencies de production

| Categorie | Package | Version |
|---|---|---|
| **Framework** | next | ^14.2.35 |
| **Runtime** | react / react-dom | ^18.3.1 |
| **Langage** | typescript | ^5.7.2 |
| **IA** | @anthropic-ai/sdk | ^0.32.1 |
| **Base de donnees** | @supabase/supabase-js | ^2.47.10 |
| **Auth SSR** | @supabase/ssr | ^0.5.2 |
| **Paiements** | stripe | ^20.2.0 |
| **PDF** | @react-pdf/renderer | ^4.1.5 |
| **Rate Limiting** | @upstash/ratelimit + @upstash/redis | ^2.0.0 / ^1.28.0 |
| **Cache/Redis** | ioredis | ^5.3.0 |
| **UI primitives** | @radix-ui/react-* (dialog, tabs, select, toast, etc.) | v1-2 |
| **Graphiques** | recharts + @tremor/react | ^2.15.4 / ^3.18.7 |
| **Drag & Drop** | @dnd-kit/core + sortable + utilities | ^6.3.1 |
| **Formulaires** | react-hook-form + @hookform/resolvers + zod | ^7.54.2 / ^3.24.1 |
| **Animations** | framer-motion | ^11.18.2 |
| **Styles** | tailwindcss + tailwind-merge + tailwindcss-animate + class-variance-authority | ^3.4.17 |
| **Theming** | next-themes | ^0.4.6 |
| **Icones** | lucide-react | ^0.469.0 |
| **Dates** | date-fns | ^4.1.0 |
| **QR Code** | qrcode | ^1.5.4 |
| **CSV** | csv-parse | ^6.1.0 |
| **Collaboration** | yjs + y-protocols | ^13.6.29 |
| **Commandes** | cmdk | ^1.1.1 |
| **Metriques** | web-vitals | ^5.1.0 |

### Dependencies de developpement

| Package | Version |
|---|---|
| vitest | ^4.0.18 |
| @testing-library/react | ^16.3.2 |
| @testing-library/jest-dom | ^6.9.1 |
| jsdom | ^27.4.0 |
| @vitejs/plugin-react | ^5.1.2 |
| eslint + eslint-config-next | ^8.57.0 / ^14.2.35 |
| postcss | ^8.4.49 |
| autoprefixer | ^10.4.20 |
| sharp | ^0.34.5 |
| supabase (CLI) | ^2.72.8 |

---

## Architecture

### Type : Monolithe Next.js 14 (App Router)

L'application suit une architecture monolithique basee sur Next.js 14 avec l'App Router. Le routage est organise en **3 groupes de routes** :

1. **(auth)** -- Pages d'authentification (login, register, reset password)
2. **(dashboard)** -- Espace utilisateur artisan (devis, factures, CRM, parametres)
3. **(admin)** -- Panneau d'administration (utilisateurs, abonnements, analytics)

Un **Edge Middleware** Next.js gere la protection des routes, la redirection et la verification de session Supabase cote serveur.

### Couches principales

- **Frontend** : React 18, composants Radix UI, Tailwind CSS, Framer Motion
- **Backend** : API Routes Next.js (Route Handlers), Server Components / Server Actions
- **IA** : SDK Anthropic (Claude) pour la transcription vocale et la generation de devis
- **Donnees** : Supabase PostgreSQL avec Row Level Security (RLS)
- **Paiements** : Stripe pour la gestion des abonnements et facturation
- **Cache** : Upstash Redis / ioredis pour le rate limiting et le cache
- **Collaboration** : Yjs pour l'edition collaborative en temps reel

---

## Structure du depot

```
src/
  app/              # App Router - pages, layouts, route handlers API
    (auth)/         # Groupe de routes authentification
    (dashboard)/    # Groupe de routes dashboard artisan
    (admin)/        # Groupe de routes panneau admin
    api/            # Route Handlers (endpoints API)
  components/       # Composants React reutilisables (UI, formulaires, layouts)
  lib/              # Utilitaires, clients (Supabase, Stripe, Anthropic), helpers
  contexts/         # React Contexts (auth, theme, notifications)
  hooks/            # Custom React Hooks
supabase/
  migrations/       # Migrations SQL PostgreSQL
public/             # Assets statiques (images, logos, fonts)
docs/               # Documentation du projet
```

---

## Marche cible

| Critere | Detail |
|---|---|
| **Segment** | Artisans et PME |
| **Zone geographique** | Belgique francophone |
| **Cadre fiscal** | TVA belge (21%, 6%, 0%) |
| **Locales supportees** | fr-BE (principal), fr-FR, fr-CH |
| **Probleme resolu** | Automatiser la creation de devis professionnels via la voix et l'IA, remplacer les processus manuels (Excel, papier) |

---

## Modele economique

### Freemium a 5 niveaux

| Plan | Description |
|---|---|
| **Free** | Acces de base limite (decouverte) |
| **Pro** | Artisan individuel - fonctionnalites completes |
| **Business** | Petites equipes - multi-utilisateurs |
| **Corporate** | Entreprises - fonctionnalites avancees, support prioritaire |
| **Enterprise** | Sur mesure - deploiement dedie, SLA personnalise |

### Monetisation complementaire

- **Packs additionnels** : Credits supplementaires, fonctionnalites a la carte
- **Systeme de tokens (TokenDEAL)** : Unite interne de consommation pour les appels IA, les exports PDF et les fonctionnalites premium

---

## Documentation detaillee

| Document | Chemin |
|---|---|
| Architecture technique | [docs/architecture.md](./architecture.md) |
| Contrats API | [docs/api-contracts.md](./api-contracts.md) |
| Modeles de donnees | [docs/data-models.md](./data-models.md) |
| Inventaire des composants | [docs/component-inventory.md](./component-inventory.md) |
| Guide de developpement | [docs/development-guide.md](./development-guide.md) |

---

*Document genere le 28 janvier 2026.*
