# DEAL - Guide de Déploiement

> Generated: 2026-01-28

## Environnements

| Environnement | URL | Usage |
|---------------|-----|-------|
| **Production** | https://dealofficialapp.com | Live |
| **Preview** | https://hubdeal-*.vercel.app | Branches |
| **Local** | http://localhost:3000 | Développement |

## Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                        VERCEL                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Edge      │  │   Server    │  │   Static    │    │
│  │  Functions  │  │  Functions  │  │   Assets    │    │
│  │ (middleware)│  │  (API)      │  │  (public/)  │    │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘    │
└─────────┼────────────────┼───────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                      SUPABASE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  PostgreSQL │  │    Auth     │  │   Storage   │    │
│  │  Database   │  │   Service   │  │   Buckets   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVICES EXTERNES                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Stripe    │  │  Anthropic  │  │   Upstash   │    │
│  │  Payments   │  │  Claude AI  │  │   Redis     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Déploiement Vercel

### Déploiement automatique

1. Push sur `main` → Déploiement production automatique
2. Push sur autre branche → Déploiement preview automatique

### Déploiement manuel

```bash
# Via Vercel CLI
npx vercel --prod
```

### Configuration Vercel

**Settings → General:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Settings → Environment Variables:**

Toutes les variables de `.env.local` doivent être configurées dans Vercel pour chaque environnement (Production, Preview, Development).

## Variables d'environnement Production

| Variable | Source | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Doit être NEXT_PUBLIC_ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Doit être NEXT_PUBLIC_ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Server-side only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | Doit être NEXT_PUBLIC_ |
| `STRIPE_SECRET_KEY` | Stripe | Server-side only |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard | Pour webhooks |
| `ANTHROPIC_API_KEY` | Anthropic | Server-side only |
| `UPSTASH_REDIS_REST_URL` | Upstash | Rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Rate limiting |
| `NEXT_PUBLIC_APP_URL` | - | https://dealofficialapp.com |

## Domaine personnalisé

### Configuration DNS

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Dans Vercel

1. Settings → Domains
2. Add `dealofficialapp.com`
3. Vercel vérifie automatiquement le DNS

## Webhooks Stripe

### Configuration

1. Aller sur [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://dealofficialapp.com/api/stripe/webhook`
3. Events à écouter:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. Copier le Webhook Secret → `STRIPE_WEBHOOK_SECRET`

## Monitoring

### Vercel Analytics

- Activé automatiquement
- Dashboard: https://vercel.com/djaijos-projects/hubdeal/analytics

### Logs

```bash
# Voir les logs en temps réel
npx vercel logs --follow
```

### Supabase

- Dashboard: https://supabase.com/dashboard/project/mcdkivlpjsxgjoglocvy

## Rollback

```bash
# Via Vercel CLI
npx vercel rollback

# Ou via Dashboard
# Deployments → Sélectionner un déploiement précédent → Promote to Production
```

## Checklist pré-déploiement

- [ ] Variables d'environnement configurées
- [ ] Build local réussi (`npm run build`)
- [ ] Tests passés
- [ ] Migrations database appliquées
- [ ] Webhooks Stripe configurés
- [ ] DNS configuré (si nouveau domaine)

## Troubleshooting

### Build échoue

```bash
# Vérifier localement
npm run build

# Vérifier les types
npx tsc --noEmit
```

### Erreur 500 en production

1. Vérifier les logs Vercel
2. Vérifier les variables d'environnement
3. Vérifier la connexion Supabase

### Variables d'environnement non lues

- Assurez-vous que les variables `NEXT_PUBLIC_*` sont bien marquées pour "Production"
- Redéployer après changement de variables

---

*Document généré par le workflow document-project*
