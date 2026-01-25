# QuoteVoice - Notes de Session Complètes

> Document de référence pour reprendre le développement de QuoteVoice
> Dernière mise à jour: 25 janvier 2026

---

## Table des Matières

1. [Présentation du Projet](#présentation-du-projet)
2. [Architecture Technique](#architecture-technique)
3. [Structure des Fichiers](#structure-des-fichiers)
4. [Configuration Environnement](#configuration-environnement)
5. [Base de Données Supabase](#base-de-données-supabase)
6. [Commandes Essentielles](#commandes-essentielles)
7. [Fonctionnalités Implémentées](#fonctionnalités-implémentées)
8. [Tests](#tests)
9. [Déploiement](#déploiement)
10. [Problèmes Résolus](#problèmes-résolus)
11. [Prochaines Étapes](#prochaines-étapes)

---

## Présentation du Projet

**QuoteVoice** est une application SaaS permettant aux artisans de générer des devis professionnels à partir de transcriptions vocales grâce à l'IA.

### Stack Technique
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **IA**: Anthropic Claude API (claude-3-5-sonnet)
- **Paiements**: Stripe (Checkout, Webhooks, Customer Portal)
- **PDF**: jsPDF, html2canvas
- **Auth**: Supabase Auth

### Modèle Économique
| Plan | Prix/mois | Secteurs | Devis/mois | Fonctionnalités |
|------|-----------|----------|------------|-----------------|
| Free | 0€ | 1 | 5 | Base |
| Starter | 9.99€ | 3 | 30 | + Assistant IA |
| Pro | 24.99€ | 10 | 100 | + Protection PDF |
| Ultimate | 49.99€ | Illimité | Illimité | Tout inclus |

---

## Architecture Technique

```
quotevoice/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Pages authentification (login, register, etc.)
│   │   ├── (dashboard)/       # Pages protégées (dashboard, quotes, settings)
│   │   ├── (marketing)/       # Pages publiques (landing, pricing)
│   │   └── api/               # API Routes
│   │       ├── ai-assistant/  # Assistant IA
│   │       ├── generate/      # Génération de devis par IA
│   │       ├── stripe/        # Webhooks et checkout Stripe
│   │       └── quotes/        # CRUD devis
│   ├── components/
│   │   ├── ui/                # Composants shadcn/ui
│   │   ├── quotes/            # Composants devis (editor, preview, etc.)
│   │   ├── subscription/      # Composants abonnement
│   │   └── dashboard/         # Composants dashboard
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── supabase/          # Client Supabase (client.ts, server.ts, middleware.ts)
│   │   ├── pdf/               # Génération PDF, QR code EPC, cache
│   │   ├── legal/             # Moteur de risque juridique
│   │   ├── locale/            # Système de locales (BE/FR/CH)
│   │   └── stripe.ts          # Configuration Stripe
│   └── types/                 # Types TypeScript
├── supabase/                  # Migrations SQL
├── public/                    # Assets statiques
└── __tests__/                 # Tests Jest
```

---

## Structure des Fichiers

### Fichiers Clés

| Fichier | Description |
|---------|-------------|
| `src/app/layout.tsx` | Layout racine avec providers |
| `src/app/(dashboard)/layout.tsx` | Layout dashboard avec sidebar |
| `src/middleware.ts` | Protection des routes authentifiées |
| `src/types/database.ts` | Types Supabase + constantes métier |
| `src/lib/supabase/client.ts` | Client Supabase côté client |
| `src/lib/supabase/server.ts` | Client Supabase côté serveur |
| `src/hooks/use-subscription.ts` | Hook gestion abonnement |
| `src/lib/legal/risk-analyzer.ts` | Moteur analyse risque juridique |
| `src/lib/locale/index.ts` | Système locale packs |
| `src/lib/pdf/index.ts` | Export PDF + EPC QR + cache |

### Composants Principaux

| Composant | Chemin | Description |
|-----------|--------|-------------|
| QuoteEditor | `components/quotes/quote-editor.tsx` | Éditeur de devis complet |
| QuickApproveEditor | `components/quotes/quick-approve-editor.tsx` | Validation rapide ligne par ligne |
| QuotePDFPreview | `components/quotes/quote-pdf-preview.tsx` | Prévisualisation PDF |
| LegalRiskAlert | `components/quotes/legal-risk-alert.tsx` | Alertes risque juridique |
| LocaleSelector | `components/locale/locale-selector.tsx` | Sélecteur de locale avec drapeaux |
| DensitySelector | `components/quotes/density-selector.tsx` | Sélecteur densité PDF |

---

## Configuration Environnement

### Variables d'Environnement (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mfctmaxcrfyezbndqzkn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-api03-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (À CONFIGURER POUR PRODUCTION)
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_ULTIMATE_MONTHLY_PRICE_ID=price_...
STRIPE_ULTIMATE_YEARLY_PRICE_ID=price_...
```

### Configuration Stripe

1. Créer un compte sur https://dashboard.stripe.com
2. Créer 3 produits (Starter, Pro, Ultimate) avec prix mensuel et annuel
3. Copier les `price_id` dans les variables d'environnement
4. Configurer le webhook: `https://ton-domaine.com/api/stripe/webhook`
   - Événements à écouter:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.payment_succeeded`

---

## Base de Données Supabase

### Tables Principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (entreprise, logo, etc.) |
| `quotes` | Devis créés |
| `quote_items` | Lignes de devis |
| `subscriptions` | Abonnements utilisateurs |
| `user_sectors` | Secteurs débloqués par utilisateur |
| `usage_stats` | Compteurs d'utilisation mensuels |
| `plans` | Définition des plans et limites |

### Migrations à Exécuter

Les migrations sont dans `supabase/`. Exécuter dans cet ordre:

1. `schema.sql` - Schéma de base (profiles, quotes, quote_items)
2. `migration-subscriptions.sql` - Système d'abonnements
3. `migration-locale.sql` - Colonne locale sur quotes
4. `migration-v2.sql` - Fonctionnalités V2 (si existe)

### Migrations Récentes Appliquées

```sql
-- Ajout colonne locale (Epic 8)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'fr-BE';

-- Correction trigger usage_stats (RLS)
CREATE OR REPLACE FUNCTION increment_quote_count()
RETURNS TRIGGER AS $$
DECLARE
  v_month_year TEXT;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');
  INSERT INTO usage_stats (user_id, month_year, quotes_created)
  VALUES (NEW.user_id, v_month_year, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    quotes_created = usage_stats.quotes_created + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Politiques RLS Importantes

```sql
-- Usage stats (ajoutées manuellement)
CREATE POLICY "Users can insert own usage" ON usage_stats
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_stats
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## Commandes Essentielles

### Développement

```bash
# Démarrer le serveur de développement
cd quotevoice
npm run dev

# Le serveur démarre sur http://localhost:3000 (ou 3001, 3002 si port occupé)
```

### Tests

```bash
# Lancer tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Lancer un fichier de test spécifique
npm test -- --testPathPattern="risk-analyzer"
```

### Build & Production

```bash
# Build de production
npm run build

# Démarrer en mode production
npm start

# Linter
npm run lint
```

### Git

```bash
# Status
git status

# Commit
git add .
git commit -m "Description du commit"

# Push
git push origin master
```

---

## Fonctionnalités Implémentées

### MVP (Epics 1-7) ✅

| Epic | Nom | Stories |
|------|-----|---------|
| 1 | Authentification | Inscription, connexion, déconnexion, reset password |
| 2 | Profil Entreprise | Config profil, upload logo, mentions légales, secteur défaut |
| 3 | Génération IA | Import transcription, analyse IA, détection secteur, génération devis |
| 4 | Édition Devis | Client, prestations, totaux, TVA, notes |
| 5 | Export & Stockage | Preview PDF, download, numérotation, brouillons |
| 6 | Gestion Devis | Liste, recherche, filtrage, duplication, suppression |
| 7 | Dashboard | Vue d'ensemble, statistiques |

### V2 (Epics 8-12) ✅

| Epic | Nom | Stories | Description |
|------|-----|---------|-------------|
| 8 | Locale Packs | 7 | Système BE/FR/CH avec mentions légales automatiques |
| 9 | Risque Juridique | 6 | Moteur d'analyse avec alertes et suggestions |
| 10 | Validation Rapide | 4 | Interface ligne par ligne avec undo (Ctrl+Z) |
| 11 | PDF Adaptatif | 5 | 3 densités, QR code EPC, cache |
| 12 | Abonnements | 6 | Stripe, plans, webhooks, portail client |

### Fonctionnalités Détaillées

#### Système de Locales (Epic 8)
- 3 locales: `fr-BE` (Belgique), `fr-FR` (France), `fr-CH` (Suisse)
- Détection automatique basée sur le profil
- Mentions légales automatiques par pays
- Formatage monétaire adapté (€/CHF)
- Fallback gracieux si locale non supportée

#### Moteur de Risque Juridique (Epic 9)
- Analyse en temps réel du texte des devis
- Détection de patterns à risque (durées excessives, garanties impossibles, etc.)
- Score de risque avec 3 niveaux (low, medium, high)
- Suggestions de correction automatique
- Sensibilité configurable par utilisateur

#### Interface de Validation Rapide (Epic 10)
- Validation ligne par ligne avec preview
- Compteur de progression
- Bouton "Tout approuver"
- Historique d'undo (5 dernières actions)
- Raccourci Ctrl+Z
- Toast avec bouton "Annuler" pendant 10 secondes

#### PDF Adaptatif (Epic 11)
- 3 niveaux de densité: compact, normal, detailed
- QR code EPC pour paiement SEPA (standard EPC069-12)
- Cache LRU pour performance (10MB max, 30min TTL)
- Mentions légales dynamiques selon locale

#### Système d'Abonnements (Epic 12)
- Intégration Stripe Checkout
- Webhooks sécurisés avec vérification signature
- Customer Portal pour gestion abonnement
- Gestion des échecs de paiement
- Alertes d'expiration

---

## Tests

### Structure des Tests

```
__tests__/
├── lib/
│   ├── legal/
│   │   └── risk-analyzer.test.ts    # 45 tests
│   ├── locale/
│   │   └── locale.test.ts           # 32 tests
│   └── pdf/
│       ├── epc-qr.test.ts           # 16 tests
│       └── pdf-cache.test.ts        # 12 tests
└── components/
    └── ...
```

### Résultats des Tests

```
Test Suites: 8 passed, 8 total
Tests:       127 passed, 127 total
```

### Commandes de Test

```bash
# Tous les tests
npm test

# Tests spécifiques
npm test -- risk-analyzer
npm test -- locale
npm test -- epc-qr
npm test -- pdf-cache
```

---

## Déploiement

### Prérequis

1. **Compte Vercel** - https://vercel.com
2. **Compte Stripe** - https://stripe.com (avec produits configurés)
3. **Supabase** - Projet déjà configuré

### Étapes de Déploiement

#### 1. Préparer le Repository GitHub

```bash
# Dans le dossier quotevoice
git remote add origin https://github.com/TON_USERNAME/quotevoice.git
git branch -M main
git push -u origin main
```

#### 2. Déployer sur Vercel

```bash
# Option 1: Via CLI
npx vercel

# Option 2: Via interface web
# - Aller sur https://vercel.com/new
# - Importer le repo GitHub
# - Configurer les variables d'environnement
```

#### 3. Variables d'Environnement sur Vercel

Ajouter toutes les variables de `.env.local` + :
- `NEXT_PUBLIC_APP_URL` = URL Vercel production
- Toutes les clés Stripe en mode `live`

#### 4. Configurer Supabase

1. **Authentication > URL Configuration**
   - Ajouter l'URL Vercel dans "Redirect URLs"

2. **Vérifier les politiques RLS**
   - Toutes les tables doivent avoir les bonnes politiques

#### 5. Configurer Stripe Webhook

1. Aller sur https://dashboard.stripe.com/webhooks
2. Ajouter endpoint: `https://ton-app.vercel.app/api/stripe/webhook`
3. Sélectionner les événements requis
4. Copier le `whsec_...` dans les variables Vercel

---

## Problèmes Résolus

### 1. Erreur React Hooks - "Rendered more hooks than previous render"

**Fichier**: `src/app/(dashboard)/settings/subscription/page.tsx`

**Problème**: `useState` appelé après un early return

**Solution**: Déplacer tous les `useState` avant le `if (loading) return`

```tsx
// AVANT (erreur)
if (loading) return <Loader2 />;
const [openingPortal, setOpeningPortal] = useState(false);

// APRÈS (correct)
const [openingPortal, setOpeningPortal] = useState(false);
// ... autres hooks
if (loading) return <Loader2 />;
```

### 2. Erreur "locale column not found"

**Problème**: Colonne `locale` manquante dans table `quotes`

**Solution**: Exécuter la migration

```sql
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'fr-BE';
```

### 3. Erreur RLS "new row violates row-level security policy"

**Problème**: Le trigger `increment_quote_count()` n'avait pas les permissions

**Solution**: Ajouter `SECURITY DEFINER` à la fonction

```sql
CREATE OR REPLACE FUNCTION increment_quote_count()
RETURNS TRIGGER AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. TypeScript - Map iteration error

**Fichier**: `src/lib/pdf/cache.ts`

**Problème**: `for (const key of map.keys())` nécessite `downlevelIteration`

**Solution**: Utiliser `Array.from(map.keys())`

---

## Prochaines Étapes

### Court Terme

1. [ ] **Configurer Stripe Production**
   - Créer les produits et prix
   - Configurer le webhook

2. [ ] **Déployer sur Vercel**
   - Créer le repo GitHub
   - Lier à Vercel
   - Configurer les variables

3. [ ] **Tests Utilisateurs**
   - Créer quelques comptes test
   - Tester le parcours complet

### Moyen Terme

4. [ ] **Monitoring & Analytics**
   - Ajouter Sentry pour les erreurs
   - Ajouter analytics (Plausible, Posthog)

5. [ ] **SEO & Marketing**
   - Optimiser les meta tags
   - Créer une landing page attractive

6. [ ] **Améliorations UX**
   - Mode sombre complet
   - Raccourcis clavier supplémentaires
   - Notifications push

### Long Terme (V3)

7. [ ] **Nouvelles Fonctionnalités**
   - Export vers logiciels comptables
   - Signature électronique
   - Multi-utilisateurs par entreprise
   - API publique

8. [ ] **Mobile**
   - PWA ou app native
   - Enregistrement vocal intégré

---

## Contacts & Ressources

### Documentation

- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Anthropic Claude](https://docs.anthropic.com)

### Projet

- **Dossier local**: `C:\Users\Djaijo\Desktop\DJAIJOOO\quotevoice`
- **GitHub**: (à configurer)
- **Supabase**: https://supabase.com/dashboard/project/mfctmaxcrfyezbndqzkn

---

## Historique des Sessions

### Session 25 janvier 2026

- Implémentation complète V2 (Epics 8-12)
- 127 tests passants
- Corrections bugs:
  - React hooks order
  - Migration locale
  - RLS usage_stats
- Préparation déploiement production

---

*Document généré automatiquement. Mettre à jour après chaque session de développement.*
