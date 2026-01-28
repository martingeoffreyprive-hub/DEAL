# Story 1.3: Audit Secrets et Configuration

Status: ready-for-dev

## Story

As a **developpeur securite**,
I want **auditer tous les secrets et configurations de l'application**,
so that **garantir qu'aucune cle sensible n'est exposee dans le code ou les logs**.

## Acceptance Criteria

1. **AC1**: Audit complet des fichiers .env*
   - Verifier que .env.local est dans .gitignore
   - Mettre a jour .env.example avec le branding DEAL
   - Documenter toutes les variables requises

2. **AC2**: Verification des variables Vercel
   - Lister toutes les variables env requises pour production
   - Creer une checklist de configuration Vercel

3. **AC3**: Aucune cle dans le code source
   - Verifier qu'aucune cle API n'est hardcodee
   - Verifier qu'aucun secret n'est dans les logs

4. **AC4**: Documentation des secrets
   - Mettre a jour .env.example
   - Creer un guide de configuration

## Tasks / Subtasks

- [ ] **Task 1: Audit .env.example** (AC: #1)
  - [ ] Renommer "QuoteVoice" en "DEAL"
  - [ ] Verifier que toutes les variables utilisees sont documentees
  - [ ] Ajouter les variables manquantes (integrations)

- [ ] **Task 2: Verifier .gitignore** (AC: #1)
  - [ ] Confirmer .env.local est ignore
  - [ ] Confirmer .env est ignore
  - [ ] Ajouter tout fichier sensible manquant

- [ ] **Task 3: Scanner le code pour secrets hardcodes** (AC: #3)
  - [ ] Rechercher patterns de cles API (sk-, pk-, whsec_, etc.)
  - [ ] Verifier aucun token JWT hardcode
  - [ ] Verifier les fichiers de config

- [ ] **Task 4: Documenter pour Vercel** (AC: #2, #4)
  - [ ] Lister toutes les variables requises
  - [ ] Categoriser par service (Supabase, Stripe, etc.)

## Dev Notes

### Variables d'Environnement Detectees

**Utilisees dans le code (grep):**

| Variable | Service | Type | Fichiers |
|----------|---------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Public | middleware.ts, layout.tsx, +5 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public | middleware.ts, layout.tsx, +5 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Secret | Non trouve dans src/ |
| `ANTHROPIC_API_KEY` | Anthropic | Secret | generate/route.ts, ai-assistant/route.ts |
| `NEXT_PUBLIC_APP_URL` | App | Public | middleware.ts, layout.tsx |
| `NODE_ENV` | Node | System | middleware.ts, +5 |
| `UPSTASH_REDIS_REST_URL` | Upstash | Secret | middleware.ts, rate-limit.ts, cache.ts |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Secret | rate-limit.ts, cache.ts |
| `STRIPE_SECRET_KEY` | Stripe | Secret | Non trouve (via import) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Secret | Non trouve (via import) |
| `QUICKBOOKS_CLIENT_ID` | QuickBooks | Secret | quickbooks.ts |
| `QUICKBOOKS_CLIENT_SECRET` | QuickBooks | Secret | quickbooks.ts |
| `QUICKBOOKS_REALM_ID` | QuickBooks | Secret | quickbooks.ts |
| `QUICKBOOKS_SANDBOX` | QuickBooks | Config | quickbooks.ts |
| `DOCUSIGN_AUTH_SERVER` | DocuSign | Config | docusign.ts |
| `DOCUSIGN_API_BASE` | DocuSign | Config | docusign.ts |
| `DOCUSIGN_INTEGRATION_KEY` | DocuSign | Secret | docusign.ts |
| `DOCUSIGN_SECRET_KEY` | DocuSign | Secret | docusign.ts |
| `DOCUSIGN_ACCOUNT_ID` | DocuSign | Secret | docusign.ts |
| `HUBSPOT_CLIENT_ID` | HubSpot | Secret | hubspot.ts |
| `HUBSPOT_CLIENT_SECRET` | HubSpot | Secret | hubspot.ts |

### Problemes Detectes

1. **Branding**: `.env.example` ligne 2-3 dit "QuoteVoice"
2. **Variables manquantes**: Les integrations (DocuSign, HubSpot, QuickBooks) ne sont pas dans .env.example
3. **Stripe variables**: Variables de prix Stripe documentees mais non detectees dans le code

### .env.example a Mettre a Jour

```bash
# ===========================================
# DEAL - Variables d'Environnement
# ===========================================
# Copiez ce fichier vers .env.local et remplissez les valeurs

# ===========================================
# SUPABASE (Requis)
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# ANTHROPIC (Requis pour IA)
# ===========================================
ANTHROPIC_API_KEY=sk-ant-api03-...

# ===========================================
# APPLICATION
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ===========================================
# STRIPE (Requis pour paiements)
# ===========================================
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_ULTIMATE_MONTHLY_PRICE_ID=price_...
STRIPE_ULTIMATE_YEARLY_PRICE_ID=price_...

# ===========================================
# UPSTASH REDIS (Requis pour rate limiting)
# ===========================================
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...

# ===========================================
# INTEGRATIONS (Optionnel)
# ===========================================

# DocuSign
DOCUSIGN_AUTH_SERVER=https://account-d.docusign.com
DOCUSIGN_API_BASE=https://demo.docusign.net/restapi
DOCUSIGN_INTEGRATION_KEY=
DOCUSIGN_SECRET_KEY=
DOCUSIGN_ACCOUNT_ID=

# HubSpot
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=

# QuickBooks
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
QUICKBOOKS_REALM_ID=
QUICKBOOKS_SANDBOX=true
```

### Checklist Vercel

Variables **REQUISES** pour production:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cle publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service Supabase |
| `ANTHROPIC_API_KEY` | Cle API Anthropic |
| `NEXT_PUBLIC_APP_URL` | https://www.dealofficialapp.com |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe (live) |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash |

### Project Structure Notes

```
/
├── .env.example        # A METTRE A JOUR
├── .env.local          # Ignore par git (dev)
├── .gitignore          # Doit inclure .env*
└── src/
    └── lib/
        ├── rate-limit.ts      # UPSTASH_*
        ├── ai/cache.ts        # UPSTASH_*
        └── integrations/
            ├── docusign.ts    # DOCUSIGN_*
            ├── hubspot.ts     # HUBSPOT_*
            └── quickbooks.ts  # QUICKBOOKS_*
```

### References

- [Source: .env.example] - Fichier a mettre a jour
- [Source: src/lib/rate-limit.ts:7-8] - Variables Upstash
- [Source: src/lib/integrations/] - Variables integrations

## Technical Requirements

- Aucune nouvelle dependance requise
- Mise a jour documentation uniquement

## Testing Requirements

| Test Type | Requirement |
|-----------|-------------|
| Manual | Verifier .gitignore |
| Manual | Grep pour secrets hardcodes |
| Manual | Verifier Vercel Dashboard |

## Definition of Done

- [ ] .env.example mis a jour avec branding DEAL
- [ ] Toutes les variables documentees
- [ ] .gitignore verifie (.env* ignore)
- [ ] Aucun secret hardcode dans le code
- [ ] Checklist Vercel creee/documentee
- [ ] Code review passe

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Estimated Effort

~30 minutes

### Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Secret expose | Critical | Low | Audit grep |
| Variable manquante prod | High | Medium | Checklist |

---

*Story creee le 2026-01-28*
*Epic 1: Fondations & Securite*
*Sprint 1*
