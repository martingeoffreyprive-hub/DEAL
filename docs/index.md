# DEAL - Documentation Index

> **Master Index for AI-Assisted Development**
> Last Updated: 2026-01-28 | Version: 2.0.0

---

## Project Overview

| Attribute | Value |
|-----------|-------|
| **Name** | DEAL - Devis Enterprise Automatisés en Ligne |
| **Type** | Monolith Web Application |
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Hosting** | Vercel |
| **Production URL** | https://dealofficialapp.com |

---

## Quick Reference

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (Edge/Serverless) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (+ MFA) |
| Payments | Stripe |
| AI | Anthropic Claude |
| Rate Limiting | Upstash Redis |

### Architecture Pattern

- **App Router** avec Route Groups `(admin)`, `(auth)`, `(dashboard)`
- **Server Components** par défaut, Client Components où nécessaire
- **Middleware** Edge pour auth, rate limiting, CORS
- **PWA** Progressive Web App installable

---

## Generated Documentation

### Core Documentation

- [Source Tree Analysis](./source-tree-analysis.md) - Structure complète du projet
- [Development Guide](./development-guide.md) - Guide de développement
- [Deployment Guide](./deployment-guide.md) - Guide de déploiement

### Generated Artifacts

- [DEAL Production Action Plan](./generated/DEAL-Production-Action-Plan.md) - Plan d'action production
- [DEAL Admin Panel Specs](./generated/DEAL-Admin-Panel-Specs.md) - Spécifications admin
- [DEAL UX Design Vision](./generated/DEAL-UX-Design-Vision.md) - Vision UX/UI

### State & Reports

- [Project Scan Report](./project-scan-report.json) - État du scan projet

---

## Existing Documentation

### Brand & Marketing

- [Brand Guidelines](./DEAL-Brand-Guidelines.md) - Charte graphique
- [Pitch Deck Investisseurs](./DEAL-Pitch-Deck-Investisseurs.md) - Présentation investisseurs

---

## Key Entry Points

| Entry Point | Path | Description |
|-------------|------|-------------|
| Landing Page | `src/app/page.tsx` | Page d'accueil publique |
| Login | `src/app/(auth)/login/page.tsx` | Authentification |
| Dashboard | `src/app/(dashboard)/dashboard/page.tsx` | Tableau de bord |
| Quotes | `src/app/(dashboard)/quotes/page.tsx` | Gestion devis |
| Admin | `src/app/(admin)/admin/page.tsx` | Panneau admin |
| API Root | `src/app/api/` | 26 endpoints REST |

---

## Database Schema

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `profiles` | Profils utilisateurs | id, email, full_name, company_name, role |
| `quotes` | Devis | id, user_id, client_name, total_amount, status |
| `quote_items` | Lignes de devis | id, quote_id, description, quantity, unit_price |
| `subscriptions` | Abonnements | user_id, plan_name, status, stripe_subscription_id |
| `invoices` | Factures | id, quote_id, status, pdf_url |
| `leads` | Prospects | id, user_id, name, email, status |

### Support Tables

- `plans` - Plans d'abonnement
- `user_sectors` - Secteurs débloqués
- `usage_stats` - Statistiques d'utilisation
- `audit_logs` - Logs d'audit
- `notifications` - Notifications utilisateur

---

## API Endpoints Summary

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/callback` | OAuth callback |
| GET | `/api/auth/logout` | Déconnexion |

### Quotes (Core)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotes` | Liste des devis |
| POST | `/api/quotes` | Créer un devis |
| GET | `/api/quotes/[id]` | Détail devis |
| PUT | `/api/quotes/[id]` | Modifier devis |
| DELETE | `/api/quotes/[id]` | Supprimer devis |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/update-plan` | Changer plan utilisateur |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-assistant` | Assistant IA |
| POST | `/api/generate` | Génération PDF |

### Stripe

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/stripe/webhook` | Webhooks Stripe |
| POST | `/api/stripe/create-checkout` | Créer checkout |
| POST | `/api/stripe/create-portal` | Portail client |

---

## Getting Started

### For Developers

```bash
# Clone
git clone https://github.com/martingeoffreyprive-hub/DEAL.git
cd DEAL

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your credentials

# Run
npm run dev
```

### For AI Agents

When working on this project:

1. **Read this index first** for context
2. **Check source-tree-analysis.md** for file locations
3. **Reference development-guide.md** for conventions
4. **Use project-scan-report.json** for technical details

---

## Security Notes

- **Admin Access**: Controlled by email whitelist in `middleware.ts`
- **Rate Limiting**: Upstash Redis (100 req/min general, 10 req/min AI)
- **Auth**: Supabase with optional MFA
- **CSP**: Temporarily disabled (compatibility issues)

---

## Contact & Support

- **GitHub**: https://github.com/martingeoffreyprive-hub/DEAL
- **Production**: https://dealofficialapp.com

---

*Generated by document-project workflow | BMAD Method*
