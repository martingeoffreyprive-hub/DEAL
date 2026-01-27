# DEAL - Architecture Technique

## Vue d'Ensemble

DEAL est une application SaaS monolithique construite avec Next.js 14 (App Router), utilisant une architecture moderne basée sur les Server Components et les API Routes.

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Next.js App Router                        ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ ││
│  │  │  Pages   │ │Components│ │  Hooks   │ │    Contexts    │ ││
│  │  │ (admin)  │ │ (brand)  │ │ (use-*)  │ │ (Demo, Locale) │ ││
│  │  │ (auth)   │ │ (quotes) │ └────┬─────┘ └───────┬────────┘ ││
│  │  │(dashboard)│ │ (ui)    │      │               │          ││
│  │  └────┬─────┘ └────┬─────┘      │               │          ││
│  │       └────────────┴────────────┴───────────────┘          ││
│  └─────────────────────────┬───────────────────────────────────┘│
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────┼────────────────────────────────────┐
│                        SERVEUR                                   │
│  ┌─────────────────────────┴───────────────────────────────────┐│
│  │                  Next.js API Routes (26)                     ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ ││
│  │  │ /api/generate│ │/api/stripe/* │ │   /api/v1/quotes/*   │ ││
│  │  │ /api/ai-*    │ │/api/gdpr/*   │ │   /api/admin/*       │ ││
│  │  └──────┬───────┘ └──────┬───────┘ └────────┬─────────────┘ ││
│  │         │                │                  │                ││
│  │  ┌──────┴────────────────┴──────────────────┴──────────────┐││
│  │  │                    LIB / MODULES MÉTIER                  │││
│  │  │  legal-risk │ locale-packs │ pdf │ pricing │ rgpd │ ai  │││
│  │  └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└────────────────────────────┬────────────────────────────────────┘
                             │
    ┌────────┬───────────────┼───────────────┬────────────────┐
    │        │               │               │                │
┌───┴───┐ ┌──┴──┐ ┌─────────┴─────────┐ ┌───┴────┐ ┌────────┴───────┐
│Claude │ │Stripe│ │     Supabase      │ │Upstash │ │ Supabase       │
│  API  │ │ API  │ │  (DB + Auth)      │ │ Redis  │ │ Storage        │
└───────┘ └─────┘ └───────────────────┘ └────────┘ └────────────────┘
```

---

## Structure des Dossiers

```
DEAL/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (admin)/                  # Routes admin protégées
│   │   │   └── admin/
│   │   │       ├── page.tsx          # Dashboard admin
│   │   │       ├── audit-logs/       # Journaux d'audit
│   │   │       ├── subscriptions/    # Gestion abonnements
│   │   │       └── users/            # Gestion utilisateurs
│   │   │
│   │   ├── (auth)/                   # Routes authentification
│   │   │   ├── login/                # Connexion
│   │   │   ├── register/             # Inscription
│   │   │   ├── forgot-password/      # Mot de passe oublié
│   │   │   ├── reset-password/       # Réinitialisation
│   │   │   ├── mfa-verify/           # Vérification MFA
│   │   │   ├── onboarding/           # Onboarding utilisateur
│   │   │   └── pricing/              # Page tarifs
│   │   │
│   │   ├── (dashboard)/              # Routes protégées principales
│   │   │   ├── dashboard/            # Tableau de bord
│   │   │   ├── quotes/               # Gestion devis
│   │   │   │   ├── page.tsx          # Liste devis
│   │   │   │   ├── new/              # Nouveau devis
│   │   │   │   └── [id]/             # Édition devis
│   │   │   ├── invoices/             # Factures
│   │   │   ├── leads/                # Prospects
│   │   │   ├── suppliers/            # Fournisseurs
│   │   │   ├── templates/            # Templates devis
│   │   │   ├── analytics/            # Analytiques
│   │   │   ├── referral/             # Parrainage
│   │   │   ├── tokens/               # TokenDEAL
│   │   │   ├── team/                 # Équipe
│   │   │   ├── profile/              # Profil entreprise
│   │   │   └── settings/             # Paramètres
│   │   │       ├── subscription/     # Abonnement
│   │   │       ├── security/         # Sécurité
│   │   │       ├── privacy/          # Confidentialité
│   │   │       ├── integrations/     # Intégrations
│   │   │       ├── widget/           # Widget externe
│   │   │       ├── workflows/        # Automatisations
│   │   │       └── appearance/       # Thème
│   │   │
│   │   ├── (marketing)/              # Landing page
│   │   │
│   │   ├── api/                      # API Routes (26)
│   │   │   ├── generate/             # Génération IA
│   │   │   ├── ai-assistant/         # Assistant IA
│   │   │   ├── stripe/               # Paiements
│   │   │   ├── quotes/               # CRUD devis
│   │   │   ├── invoices/             # Factures
│   │   │   ├── leads/                # Prospects
│   │   │   ├── referral/             # Parrainage
│   │   │   ├── tokens/               # Tokens
│   │   │   ├── workflows/            # Workflows
│   │   │   ├── hitl/                 # Human-in-the-loop
│   │   │   ├── gdpr/                 # RGPD
│   │   │   ├── user/                 # Utilisateur
│   │   │   ├── admin/                # Admin
│   │   │   ├── api-keys/             # Clés API
│   │   │   ├── analytics/            # Web Vitals
│   │   │   ├── widget/               # Widget public
│   │   │   └── v1/                   # API publique v1
│   │   │
│   │   ├── auth/callback/            # OAuth callback
│   │   ├── b2c/                      # Pages B2C
│   │   └── docs/                     # Documentation in-app
│   │
│   ├── components/                   # Composants React (57+)
│   │   ├── brand/                    # Logo, spinners, empty states
│   │   ├── quotes/                   # Éditeur, PDF, filtres
│   │   ├── subscription/             # Usage, alertes
│   │   ├── layout/                   # Header, sidebar
│   │   ├── settings/                 # Thèmes
│   │   ├── demo/                     # Mode démo
│   │   ├── performance/              # Web Vitals, lazy loading
│   │   └── ui/                       # shadcn/ui (28)
│   │
│   ├── contexts/                     # Contextes React
│   │   ├── DemoModeContext.tsx       # Mode démo
│   │   └── LocaleContext.tsx         # Localisation
│   │
│   ├── hooks/                        # Hooks personnalisés
│   │   ├── use-subscription.ts       # Gestion abonnement
│   │   ├── use-locale.ts             # Localisation
│   │   └── use-toast.ts              # Notifications
│   │
│   ├── lib/                          # Modules métier (12+)
│   │   ├── legal-risk/               # Moteur risque juridique
│   │   ├── locale-packs/             # Multi-localisation
│   │   ├── pdf/                      # QR EPC, cache, templates
│   │   ├── pricing/                  # Plans, TokenDEAL
│   │   ├── referral/                 # Système parrainage
│   │   ├── rgpd/                     # Encryption, consent, HITL
│   │   ├── ai/                       # Cache IA
│   │   ├── supabase/                 # Clients auth
│   │   ├── performance/              # Prefetch, optimisations
│   │   ├── integrations/             # DocuSign, HubSpot
│   │   ├── workflow/                 # Automatisation
│   │   ├── suppliers/                # Base fournisseurs
│   │   ├── templates/                # Templates devis
│   │   └── invoices/                 # Génération factures
│   │
│   ├── styles/                       # CSS global
│   │   └── globals.css               # Variables CSS, thèmes
│   │
│   └── types/                        # Types TypeScript
│       └── database.ts               # 691 lignes de types
│
├── supabase/                         # Migrations SQL
│   └── migrations/                   # Scripts migration
│
├── public/                           # Assets statiques
│   ├── icons/                        # Icônes PWA
│   └── manifest.json                 # PWA manifest
│
├── docs/                             # Documentation
│   ├── bmad/                         # Docs BMAD originaux
│   ├── security/                     # Politiques sécurité
│   └── generated/                    # Docs générés (ce dossier)
│
├── next.config.mjs                   # Config Next.js
├── tailwind.config.ts                # Config Tailwind + DEAL colors
├── tsconfig.json                     # Config TypeScript
├── package.json                      # Dépendances
└── vitest.config.ts                  # Config tests
```

---

## Patterns Architecturaux

### 1. Route Groups (Next.js 14)

Les routes sont organisées en groupes logiques avec des layouts partagés :

- `(admin)` - Layout admin avec vérification rôle
- `(auth)` - Layout minimal pour authentification
- `(dashboard)` - Layout principal avec header/sidebar
- `(marketing)` - Layout marketing public

### 2. Server vs Client Components

```tsx
// Server Component (par défaut) - API calls, DB access
export default async function DashboardPage() {
  const data = await fetchData(); // Côté serveur
  return <Dashboard data={data} />;
}

// Client Component - Interactivité
"use client";
export function QuoteEditor({ quote }) {
  const [state, setState] = useState();
  return <Editor onChange={setState} />;
}
```

### 3. API Routes avec Middleware

```typescript
// Middleware de protection
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect('/login');
  }
}
```

### 4. Contextes React

- `DemoModeContext` - Simulation de plans pour démo/tests
- `LocaleContext` - Gestion localisation (BE/FR/CH)

### 5. Hooks Métier

- `useSubscription` - État abonnement, limites, permissions
- `useLocale` - Formatage monétaire, dates, validation
- `useToast` - Notifications système

---

## Flux de Données

### Création de Devis

```
1. User input (transcription)
       ↓
2. POST /api/generate
       ↓
3. Claude API (extraction IA)
       ↓
4. Validation + Analyse risque juridique
       ↓
5. INSERT quotes + quote_items (Supabase)
       ↓
6. Redirect /quotes/[id]
       ↓
7. Édition interactive (Client)
       ↓
8. Export PDF (React-PDF)
```

### Authentification

```
1. Login form
       ↓
2. Supabase Auth (signInWithPassword)
       ↓
3. Session JWT créée
       ↓
4. Middleware vérifie session
       ↓
5. Accès routes protégées
```

### Paiement Stripe

```
1. User sélectionne plan
       ↓
2. POST /api/stripe/checkout
       ↓
3. Création session Stripe
       ↓
4. Redirect Stripe Checkout
       ↓
5. Webhook checkout.session.completed
       ↓
6. UPDATE subscriptions (Supabase)
       ↓
7. Redirect /dashboard?success=true
```

---

## Sécurité

### Authentification

- **Supabase Auth** avec JWT
- **MFA optionnel** (TOTP)
- **Rate limiting** login (5 tentatives/15min)

### Autorisation

- **RBAC** avec 4 rôles : Viewer, Member, Admin, Owner
- **RLS (Row Level Security)** sur toutes les tables Supabase
- **Vérification propriété** sur chaque mutation

### Protection API

- **Clés API hashées** (SHA-256)
- **Rate limiting** par utilisateur/IP
- **Signature Stripe** pour webhooks
- **CORS** restreint pour API publique

### RGPD

- **Encryption AES-256-GCM** données sensibles
- **Consentement versionné** avec audit
- **Human-in-the-loop** pour actions sensibles
- **Export/Delete** conformes Articles 17/20

---

## Performance

### Optimisations Next.js

```javascript
// next.config.mjs
experimental: {
  optimizePackageImports: [
    'lucide-react',
    '@tremor/react',
    'recharts',
    'framer-motion',
    '@react-pdf/renderer',
  ],
}
```

### Cache

- **Cache IA Redis** (60% économie tokens) - TTL 30min-2h
- **Cache PDF LRU** (10 MB) - TTL 30min
- **Cache assets statiques** (1 an)

### Edge Runtime

- **Middleware** - Cold starts rapides
- **Web Vitals endpoint** - Analytics non-bloquant

---

## Intégrations Externes

| Service | Usage | Authentification |
|---------|-------|------------------|
| Supabase | DB, Auth, Storage | Service Role Key |
| Anthropic | Génération IA | API Key |
| Stripe | Paiements | Secret Key + Webhooks |
| Upstash | Redis cache | REST Token |

### Intégrations Futures (préparées)

- DocuSign (signatures électroniques)
- HubSpot (CRM sync)
- QuickBooks (comptabilité)

---

## Tests

```bash
# Vitest + Testing Library
npm run test        # Watch mode
npm run test:run    # Single run
npm run test:coverage
```

Structure :
```
src/lib/__tests__/
├── legal-risk.test.ts
├── locale-packs.test.ts
└── pdf.test.ts
```

---

*Documentation générée par BMAD Document-Project Workflow - 26/01/2026*
