# DEAL - Index de la Documentation Projet

> **Point d'entrée principal** pour le développement assisté par IA.
> Dernière mise à jour : 28 janvier 2026 | Version : 3.0.0 | Niveau de scan : Exhaustif

---

## Vue d'ensemble du Projet

| Attribut | Valeur |
|----------|--------|
| **Nom** | DEAL - Devis Intelligents pour Artisans Belges |
| **Type** | Application web Full-Stack SaaS (monolithe) |
| **Framework** | Next.js 14 (App Router) + TypeScript 5.7.2 |
| **Base de données** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui + Framer Motion |
| **Hébergement** | Vercel |
| **Production** | https://www.dealofficialapp.com |
| **GitHub** | https://github.com/martingeoffreyprive-hub/DEAL |

---

## Statistiques du Projet (28/01/2026)

| Métrique | Valeur |
|----------|--------|
| **Endpoints API** | 47 |
| **Composants React** | 80 (49 custom + 31 shadcn/ui) |
| **Pages** | 39 |
| **Layouts** | 4 |
| **Contextes React** | 7 |
| **Modules lib** | 59 fichiers, 335+ exports |
| **Tables BDD** | 30+ |
| **Migrations** | 17 |
| **Fonctions/Triggers BDD** | 30+ |
| **Fichiers de tests** | 9 |

---

## Documentation Générée

### Documents Principaux

| Document | Description |
|----------|-------------|
| [Vue d'ensemble du projet](./project-overview.md) | Résumé, stack technique, marché cible, modèle économique |
| [Architecture](./architecture.md) | Architecture applicative, données, sécurité, performance, modules métier |
| [Contrats API](./api-contracts.md) | 47 endpoints détaillés avec authentification, schémas, rate limiting |
| [Modèles de données](./data-models.md) | 30+ tables, RLS, 30+ fonctions/triggers, 17 migrations |
| [Inventaire des composants](./component-inventory.md) | 80 composants React, design system, accessibilité |
| [Guide de développement](./development-guide.md) | Installation, configuration, tests, conventions de code |

### Documentation Existante

| Document | Description |
|----------|-------------|
| [Charte graphique](./DEAL-Brand-Guidelines.md) | Identité visuelle DEAL |
| [Pitch Deck](./DEAL-Pitch-Deck-Investisseurs.md) | Présentation investisseurs |
| [Plan d'action production](./generated/DEAL-Production-Action-Plan.md) | Plan 5 phases |
| [Specs Admin Panel](./generated/DEAL-Admin-Panel-Specs.md) | Spécifications admin 16 modules |
| [Vision UX Design](./generated/DEAL-UX-Design-Vision.md) | Vision UX 2026 |
| [Politique de sécurité](./security/SECURITY-POLICY.md) | Politique de sécurité |
| [Plan incidents](./security/INCIDENT-RESPONSE.md) | Plan de réponse aux incidents |

---

## Stack Technique

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 14.2.35 | Framework React avec App Router |
| React | 18.3.1 | Bibliothèque UI |
| TypeScript | 5.7.2 | Typage statique |
| Tailwind CSS | 3.4.17 | Styling utility-first |
| shadcn/ui | latest | Composants Radix UI (31) |
| Framer Motion | 11.15.0 | Animations |
| @react-pdf/renderer | 4.1.5 | Génération PDF (6 templates) |
| Recharts | 2.15.0 | Graphiques |

### Backend & Services

| Technologie | Version | Usage |
|-------------|---------|-------|
| Supabase | 2.47.10 | BDD + Auth + Storage + Realtime |
| Anthropic Claude | claude-sonnet-4-20250514 | IA génération de devis |
| Stripe | 20.2.0 | Paiements, abonnements |
| Upstash Redis | 1.28.0 | Rate limiting (4 niveaux), cache IA |

### Tests

| Technologie | Version | Usage |
|-------------|---------|-------|
| Vitest | 4.0.18 | Tests unitaires |
| Playwright | 1.49.1 | Tests E2E |
| @testing-library/react | 16.1.0 | Tests composants |

---

## Architecture des Routes

### Routes Publiques (12)
`/` `/login` `/register` `/forgot-password` `/reset-password` `/mfa-verify` `/pricing` `/onboarding` `/b2c` `/docs/user-guide`

### Routes Dashboard (21) — Auth requise
`/dashboard` `/quotes` `/quotes/new` `/quotes/[id]` `/invoices` `/leads` `/team` `/tokens` `/templates` `/suppliers` `/referral` `/analytics` `/profile` `/settings/subscription` `/settings/security` `/settings/integrations` `/settings/appearance` `/settings/widget` `/settings/workflows` `/settings/privacy`

### Routes Admin (9)
`/admin` `/admin/users` `/admin/subscriptions` `/admin/audit-logs` `/admin/sectors` `/admin/templates` `/admin/tokens` `/admin/analytics` `/admin/settings`

---

## Modules Métier

| Module | Description | Endpoints | Tables Clés |
|--------|-------------|-----------|-------------|
| **Devis** | Génération IA, édition manuelle, PDF, commentaires temps réel | 8 | quotes, quote_items, quote_materials, quote_labor |
| **Facturation** | Standard/acompte/solde, Peppol BIS 3.0 XML | 4 | invoices, invoice_items |
| **CRM/Leads** | Capture widget, gestion prospects | 4 | leads |
| **Organisations** | Multi-tenant, RBAC (4 rôles), invitations | — | organizations, organization_members |
| **Abonnements** | 5 plans (freemium→enterprise), Stripe | 3 | plans, subscriptions |
| **Tokens** | Monnaie interne (TokenDEAL), récompenses | 2 | token_transactions |
| **Parrainage** | Programme ambassadeur, 4 niveaux | 4 | referrals |
| **Fournisseurs** | Base de données, catalogue produits | — | suppliers, user_suppliers |
| **Templates** | Marketplace, achat de modèles | — | document_templates, template_purchases |

---

## Sécurité

| Fonctionnalité | Implémentation |
|----------------|----------------|
| **Authentification** | Supabase Auth + MFA TOTP |
| **Autorisation** | RBAC 4 rôles (owner/admin/member/viewer) |
| **Rate Limiting** | Upstash Redis — général 100/min, IA 10/min, auth 5/15min, API 100/min |
| **Row-Level Security** | PostgreSQL RLS sur toutes les tables |
| **Chiffrement** | AES-256-GCM données sensibles |
| **RGPD** | 15 types de consentement, HITL (18 actions), rétention des données |
| **Audit** | Journalisation complète des actions sensibles |
| **En-têtes sécurité** | X-Frame-Options DENY, HSTS, X-Content-Type-Options |
| **Admin** | Whitelist email + vérification rôle |

---

## Services Externes

| Service | Usage | Statut |
|---------|-------|--------|
| **Anthropic Claude** | Génération IA de devis | Production |
| **Stripe** | Paiements, abonnements | Production |
| **Supabase** | BDD, Auth, Storage, Realtime | Production |
| **Upstash Redis** | Rate limiting, cache IA | Production |
| **DocuSign** | Signature électronique | Disponible (placeholder) |
| **HubSpot** | CRM sync | Disponible (placeholder) |
| **QuickBooks** | Comptabilité | Disponible (placeholder) |

---

## Pour Commencer

```bash
# 1. Cloner le projet
git clone https://github.com/martingeoffreyprive-hub/DEAL.git
cd DEAL

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY, STRIPE_*, UPSTASH_*

# 4. Lancer en développement
npm run dev
```

Voir le [Guide de développement](./development-guide.md) pour les détails complets.

---

## Branding

| Élément | Valeur |
|---------|--------|
| **Couleur primaire** | Navy #252B4A |
| **Couleur accent** | Coral #E85A5A |
| **Police** | Inter (Google Fonts) |
| **Logo** | DEAL. (wordmark + point coral) |
| **Slogan** | "Votre voix a de la valeur, Deal lui donne un prix" |

---

## Méta-documentation

| Propriété | Valeur |
|-----------|--------|
| **Niveau de scan** | Exhaustif (tous les fichiers source analysés) |
| **Date du scan** | 28 janvier 2026 |
| **Workflow** | BMAD Document Project v1.2.0 |
| **Fichier d'état** | [project-scan-report.json](./project-scan-report.json) |

---

*Généré par le workflow document-project | Méthode BMAD | Scan Exhaustif | 28/01/2026*
