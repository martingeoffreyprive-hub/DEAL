# DEAL - Guide de Développement

## Installation

### Prérequis

- Node.js 18.17+
- npm 9+
- Compte Supabase
- Compte Stripe (mode test)
- Clé API Anthropic

### Setup

```bash
# Cloner le projet
git clone <repo-url>
cd DEAL

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Configurer .env.local
# (voir section Variables d'Environnement)

# Lancer en développement
npm run dev
```

---

## Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Upstash Redis (optionnel, pour cache IA)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# RGPD Encryption
ENCRYPTION_KEY=32-bytes-hex-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Scripts NPM

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm start` | Démarrer en production |
| `npm run lint` | ESLint |
| `npm run type-check` | Vérification TypeScript |
| `npm run test` | Tests Vitest (watch) |
| `npm run test:run` | Tests (single run) |
| `npm run test:coverage` | Coverage |

---

## Structure du Projet

```
DEAL/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (admin)/        # Routes admin
│   │   ├── (auth)/         # Routes authentification
│   │   ├── (dashboard)/    # Routes principales
│   │   ├── (marketing)/    # Landing page
│   │   └── api/            # API Routes (26)
│   ├── components/         # Composants React (58)
│   ├── contexts/           # Contextes React
│   ├── hooks/              # Hooks personnalisés
│   ├── lib/                # Modules métier (12+)
│   ├── styles/             # CSS global
│   └── types/              # Types TypeScript
├── supabase/
│   └── migrations/         # Migrations SQL
├── public/                 # Assets statiques
└── docs/                   # Documentation
```

---

## Conventions de Code

### TypeScript

- Mode strict activé
- Types explicites pour les fonctions publiques
- Pas de `any` (utiliser `unknown` si nécessaire)

```typescript
// Bon
function calculateTotal(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0);
}

// Éviter
function calculateTotal(items: any): any {
  return items.reduce((sum: any, item: any) => sum + item.total, 0);
}
```

### Composants React

- Composants fonctionnels uniquement
- `"use client"` explicite pour les Client Components
- Props typées avec interfaces

```tsx
// Server Component (par défaut)
export default async function DashboardPage() {
  const data = await fetchData();
  return <Dashboard data={data} />;
}

// Client Component
"use client";

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant = 'primary', onClick, children }: ButtonProps) {
  return <button className={cn(styles[variant])} onClick={onClick}>{children}</button>;
}
```

### Imports

Ordre des imports:
1. React/Next.js
2. Packages externes
3. Composants locaux
4. Hooks/Utils
5. Types

```typescript
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { useSubscription } from '@/hooks/use-subscription';
import { formatCurrency } from '@/lib/locale-packs';

import type { Quote } from '@/types/database';
```

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `QuoteEditor.tsx` |
| Hooks | camelCase, préfixe `use` | `useSubscription.ts` |
| Utilitaires | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `QuoteWithItems` |
| Constants | SCREAMING_SNAKE | `MAX_QUOTES_PER_PAGE` |
| Fichiers API | kebab-case | `api-keys/route.ts` |

---

## Patterns Architecturaux

### Server Components

Par défaut, tous les composants sont des Server Components:

```tsx
// app/(dashboard)/quotes/page.tsx
import { createServerClient } from '@/lib/supabase/server';

export default async function QuotesPage() {
  const supabase = createServerClient();
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });

  return <QuoteList quotes={quotes} />;
}
```

### Client Components

Utiliser `"use client"` uniquement quand nécessaire:
- Interactivité (useState, useEffect)
- Event handlers
- Browser APIs

```tsx
"use client";

import { useState } from 'react';

export function QuoteEditor({ initialQuote }) {
  const [quote, setQuote] = useState(initialQuote);
  // ...
}
```

### API Routes

```typescript
// app/api/quotes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

---

## Base de Données

### Migrations Supabase

```bash
# Créer une migration
supabase migration new add_column_x

# Appliquer les migrations
supabase db push

# Générer les types TypeScript
supabase gen types typescript --local > src/types/supabase.ts
```

### Row Level Security

Toujours activer RLS et définir des policies:

```sql
-- Activer RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Policy: utilisateurs voient leurs propres devis
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Tests

### Vitest + Testing Library

```typescript
// src/lib/__tests__/legal-risk.test.ts
import { describe, it, expect } from 'vitest';
import { analyzeLegalRisk } from '@/lib/legal-risk';

describe('Legal Risk Engine', () => {
  it('should detect high-risk patterns', () => {
    const result = analyzeLegalRisk({
      items: [{ description: 'Travail au noir' }],
      sector: 'ELECTRICITE'
    });

    expect(result.level).toBe('critical');
  });
});
```

### Exécuter les tests

```bash
# Mode watch
npm run test

# Single run
npm run test:run

# Coverage
npm run test:coverage
```

---

## Déploiement

### Vercel (Recommandé)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

### Variables de Production

```env
NEXT_PUBLIC_APP_URL=https://deal.app
STRIPE_SECRET_KEY=sk_live_...
# ... autres clés de production
```

### Webhooks Stripe

Configurer l'endpoint webhook sur Stripe Dashboard:
- URL: `https://deal.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`

---

## Debugging

### Logs Serveur

```typescript
// En développement
console.log('[API] Quote created:', quote.id);

// En production, utiliser audit logs
await auditLog({ action: 'quote.create', resourceId: quote.id });
```

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `NEXT_PUBLIC_* undefined` | Variable non préfixée | Préfixer avec `NEXT_PUBLIC_` |
| `RLS policy violation` | Policy manquante | Ajouter policy Supabase |
| `Module not found` | Import incorrect | Vérifier le chemin `@/` |
| `Hydration mismatch` | Server/Client mismatch | Utiliser `useEffect` |

---

## Performance

### Optimisations Actives

- **Tree shaking** pour lucide-react, framer-motion, recharts
- **Cache PDF** LRU 10MB
- **Cache IA** Redis (Upstash)
- **Image optimization** AVIF/WebP
- **Edge Runtime** pour middleware

### Web Vitals

Monitorer via `/api/analytics/vitals`:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TTFB < 800ms

---

## Sécurité

### Checklist

- [ ] RLS activé sur toutes les tables
- [ ] Clés API hashées (SHA-256)
- [ ] Rate limiting sur toutes les API
- [ ] Validation Zod sur les inputs
- [ ] Headers sécurité (CSP, HSTS)
- [ ] Pas de secrets côté client

### Validation Input

```typescript
import { z } from 'zod';

const quoteSchema = z.object({
  client_name: z.string().min(2).max(100),
  client_email: z.string().email().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit_price: z.number().nonnegative()
  }))
});

const validated = quoteSchema.parse(requestBody);
```

---

*Documentation générée par BMAD Document-Project Workflow - 26/01/2026*
