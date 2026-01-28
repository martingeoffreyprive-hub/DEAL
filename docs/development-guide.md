# DEAL - Guide de Développement

> Generated: 2026-01-28 | Version: 2.0.0

## Prérequis

| Outil | Version | Installation |
|-------|---------|--------------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Inclus avec Node.js |
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |

## Installation

```bash
# 1. Cloner le repository
git clone https://github.com/martingeoffreyprive-hub/DEAL.git
cd DEAL

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env.local

# 4. Configurer les variables d'environnement
# Voir section "Variables d'environnement" ci-dessous
```

## Variables d'environnement

Créer un fichier `.env.local` avec :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Anthropic (AI)
ANTHROPIC_API_KEY=sk-ant-xxx

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Commandes de développement

```bash
# Démarrer le serveur de développement
npm run dev

# Build production
npm run build

# Lancer en production locale
npm run start

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Structure des branches

| Branche | Usage |
|---------|-------|
| `main` | Production - déployée sur Vercel |
| `develop` | Développement - features en cours |
| `feature/*` | Nouvelles fonctionnalités |
| `fix/*` | Corrections de bugs |

## Workflow de développement

1. **Créer une branche** depuis `main`
   ```bash
   git checkout -b feature/ma-feature
   ```

2. **Développer** avec hot-reload (`npm run dev`)

3. **Tester** localement

4. **Commit** avec messages conventionnels
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve issue #123"
   ```

5. **Push et Pull Request**
   ```bash
   git push origin feature/ma-feature
   ```

## Architecture des fichiers

### Créer une nouvelle page

```
src/app/(dashboard)/ma-page/
├── page.tsx          # Page principale
├── layout.tsx        # Layout optionnel
└── loading.tsx       # État de chargement
```

### Créer un nouveau composant

```
src/components/ma-feature/
├── index.tsx         # Export principal
├── ma-feature.tsx    # Composant
└── ma-feature.types.ts # Types TypeScript
```

### Créer une nouvelle API

```
src/app/api/ma-feature/
├── route.ts          # GET, POST, PUT, DELETE handlers
└── [id]/route.ts     # Routes dynamiques
```

## Base de données

### Migrations Supabase

```bash
# Les migrations sont dans /supabase/migrations/
# Appliquer manuellement via Supabase Dashboard ou CLI

# Générer les types TypeScript
npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

### Tables principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs |
| `quotes` | Devis |
| `quote_items` | Lignes de devis |
| `subscriptions` | Abonnements |
| `invoices` | Factures |
| `leads` | Prospects |

## Tests

```bash
# Tests unitaires (si configurés)
npm run test

# Tests E2E (si configurés)
npm run test:e2e
```

## Debugging

### Logs Supabase

```typescript
// Activer les logs dans le client
const supabase = createClient(url, key, {
  db: { schema: 'public' },
  global: { headers: {} },
  auth: { debug: true }
})
```

### DevTools Next.js

- `http://localhost:3000/_next/static/development/_devMiddlewareManifest.json`
- React DevTools extension

## Conventions de code

- **TypeScript** strict mode activé
- **ESLint** avec règles Next.js
- **Prettier** pour le formatage
- **Tailwind CSS** pour les styles
- **shadcn/ui** pour les composants de base

## Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

*Document généré par le workflow document-project*
