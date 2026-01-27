# DEAL - Documentation Projet

## Index Principal

> **Ce fichier est le point d'entrée principal pour l'assistance IA sur ce projet.**
> Pointez vers ce fichier lors de la création de PRD ou de l'analyse de code.

---

## Aperçu du Projet

| Attribut | Valeur |
|----------|--------|
| **Nom** | DEAL (Devis Enterprise Automatisés en Ligne) |
| **Ancien nom** | QuoteVoice |
| **Type** | Application Web Full-Stack SaaS |
| **Framework** | Next.js 14 (App Router) |
| **Langage** | TypeScript (strict mode) |
| **Base de données** | PostgreSQL (Supabase) |
| **IA** | Anthropic Claude API |
| **Paiements** | Stripe |
| **Dernière mise à jour** | 26 janvier 2026, 18:32 |

### Description

DEAL est une application SaaS B2B permettant de générer automatiquement des devis professionnels à partir de transcriptions vocales, avec validation humaine, détection de risques juridiques et export PDF multi-locales.

### Fonctionnalités Clés

- Import de transcription vocale (Plaud Note Pro compatible)
- Génération IA de devis (27 secteurs d'activité)
- Édition avancée avec drag & drop
- Détection silencieuse des risques juridiques
- Multi-localisation (BE, FR, CH) avec TVA/mentions auto
- Export PDF adaptatif (6 templates, 3 densités, QR Code EPC)
- Système d'abonnements Stripe (4 plans)
- Programme de parrainage multi-niveaux
- TokenDEAL (économie interne)
- Panel admin complet
- API publique v1 avec clés API
- Conformité RGPD complète

---

## Documentation Générée

### Architecture & Vue d'Ensemble

- [Vue d'Ensemble du Projet](./project-overview.md) - Résumé exécutif, stack technique
- [Architecture Technique](./architecture.md) - Patterns, flux de données, sécurité
- [Arborescence des Sources](./source-tree-analysis.md) - Structure complète des fichiers

### Référence Technique

- [Catalogue API](./api-contracts.md) - 26 endpoints REST documentés
- [Modèles de Données](./data-models.md) - Schéma PostgreSQL, types TypeScript
- [Inventaire des Composants](./component-inventory.md) - 57+ composants React
- [Modules Métier](./business-modules.md) - 12+ modules lib/

### Guides

- [Guide de Développement](./development-guide.md) - Installation, conventions, déploiement
- [Configuration](./configuration.md) - next.config, tailwind, tsconfig

---

## Stack Technique Complète

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 14.2.35 | Framework React avec App Router |
| React | 18.3.1 | Bibliothèque UI |
| TypeScript | 5.7.2 | Typage statique strict |
| Tailwind CSS | 3.4.17 | Framework CSS utilitaire |
| shadcn/ui | - | 28 composants Radix |
| Framer Motion | 11.18.2 | Animations |
| Lucide React | 0.469.0 | Icônes |
| @tremor/react | 3.18.7 | Charts et analytics |
| recharts | 2.15.4 | Graphiques |

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js API Routes | 14.2.35 | Endpoints REST |
| Edge Runtime | - | Middleware rapide |
| Supabase | 2.47.10 | BaaS (DB + Auth + Storage) |
| PostgreSQL | - | Base de données |
| Upstash Redis | 1.28.0 | Cache IA + Rate limiting |

### Intégrations

| Service | Rôle |
|---------|------|
| Anthropic Claude | Génération IA de devis |
| Stripe | Paiements et abonnements |
| Supabase Storage | Stockage fichiers (logos, PDFs) |
| Upstash | Cache Redis serverless |

### Outils

| Technologie | Rôle |
|-------------|------|
| @react-pdf/renderer | Génération PDF côté client |
| @dnd-kit | Drag & drop |
| react-hook-form + zod | Validation formulaires |
| qrcode | QR Code EPC SEPA |
| date-fns | Manipulation dates |
| Vitest | Tests unitaires |

---

## Points d'Entrée Clés

| Fichier | Description |
|---------|-------------|
| `src/app/page.tsx` | Landing page marketing |
| `src/app/(dashboard)/dashboard/page.tsx` | Tableau de bord principal |
| `src/app/(dashboard)/quotes/new/page.tsx` | Création de devis |
| `src/app/(dashboard)/quotes/[id]/page.tsx` | Édition de devis |
| `src/app/api/generate/route.ts` | API génération IA |
| `src/app/api/ai-assistant/route.ts` | Assistant IA multi-actions |
| `src/middleware.ts` | Protection des routes |

---

## Commandes Essentielles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer production
npm start

# Vérification types
npm run type-check

# Linting
npm run lint

# Tests
npm run test
npm run test:run
npm run test:coverage
```

---

## Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Upstash Redis (optionnel)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# App
NEXT_PUBLIC_APP_URL=https://deal.app
```

---

## Métriques du Projet

| Métrique | Valeur |
|----------|--------|
| **Fichiers TypeScript** | 189 |
| **Routes API** | 26 |
| **Composants React** | 57+ |
| **Modules métier** | 12+ |
| **Secteurs d'activité** | 27 |
| **Plans d'abonnement** | 4 |
| **Locales supportées** | 3 (BE, FR, CH) |
| **Templates PDF** | 6 |

---

## Méta-Informations

| Attribut | Valeur |
|----------|--------|
| **Généré le** | 2026-01-26 |
| **Mode de scan** | Exhaustif |
| **Workflow** | BMAD Document-Project v1.2.0 |
| **Durée analyse** | ~15 minutes |

---

## Prochaines Étapes

1. **Pour un PRD** → Référencez ce fichier `index.md`
2. **Pour du code** → Consultez `architecture.md` et `development-guide.md`
3. **Pour les APIs** → Voir `api-contracts.md`
4. **Pour la DB** → Voir `data-models.md`
5. **Pour les composants** → Voir `component-inventory.md`

---

*Documentation générée automatiquement par BMAD Document-Project Workflow*
