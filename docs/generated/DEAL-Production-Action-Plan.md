# DEAL - Plan d'Action Production v2.0

**Date**: 28 janvier 2026
**Auteur**: Équipe BMM (CTO, Architect, Dev Senior, UX Designer)
**Objectif**: Transformer DEAL en application production-ready avec UX mobile-first

---

## Vision

> Une application de devis professionnels aussi simple qu'une app de messagerie,
> aussi intuitive qu'Instagram, aussi puissante qu'un ERP.

---

## Principes Directeurs

1. **Mobile-first, Desktop-enhanced** - Conception pour smartphone d'abord
2. **Progressive Disclosure** - Cacher la complexité, révéler progressivement
3. **Ludification** - Récompenses, animations, feedback positif
4. **Branding immersif** - Navy (#252B4A) + Coral (#E85A5A) partout
5. **Accessibilité universelle** - Mode Chantier pour conditions difficiles

---

## Phase 1: Fondations (Semaine 1-2)

### 1.1 Sécurité & Stabilité [CRITIQUE]

| Tâche | Priorité | Effort | Détails |
|-------|----------|--------|---------|
| Supprimer `/api/test-supabase` | P0 | 0.5h | Endpoint de debug exposé |
| Rate limiting global | P0 | 4h | Upstash Redis sur tous les endpoints |
| Mettre à jour README.md | P0 | 1h | QuoteVoice → DEAL |
| Audit des secrets .env | P0 | 2h | Vérifier aucune clé exposée |
| CORS configuration | P1 | 2h | Whitelist domaines production |

### 1.2 Branding Cohérent

| Tâche | Priorité | Effort | Détails |
|-------|----------|--------|---------|
| Audit branding complet | P0 | 4h | Identifier tous les "QuoteVoice" restants |
| Mise à jour metadata | P0 | 2h | SEO, Open Graph, favicons |
| Email templates DEAL | P1 | 4h | Transactionnels avec branding |
| Loading states branded | P1 | 2h | DealLoadingSpinner partout |
| Error pages branded | P1 | 2h | 404, 500 avec style DEAL |

---

## Phase 2: Révolution UX/UI (Semaine 2-4)

### 2.1 Nouveau Système de Navigation

**Problème actuel**: Sidebar classique avec 27 items = intimidant pour novices

**Solution proposée**: Navigation contextuelle par zones

```
┌─────────────────────────────────────────────────────────────┐
│  MOBILE (Bottom Navigation Bar)                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [🏠]     [📄]      [➕]      [💰]      [👤]                │
│  Accueil  Devis    Créer    Finance   Profil               │
│                                                              │
│  - Tap: Action principale                                    │
│  - Long press: Menu contextuel avec sous-options            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DESKTOP (Top Navigation + Context Sidebar)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ DEAL [Logo]    🏠 📄 💰 👥 ⚙️   [🔔] [Profil]       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Sidebar contextuelle (apparaît selon la section active):   │
│  - Section Devis → Filtres, Actions rapides                 │
│  - Section Finance → Stats, Exports                          │
│  - Section Profil → Paramètres, Abonnement                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Tâches UI/UX

| Tâche | Priorité | Effort | Détails |
|-------|----------|--------|---------|
| Bottom navigation mobile | P0 | 8h | 5 items max, gestures |
| Top navigation desktop | P0 | 6h | Horizontal, minimaliste |
| Context sidebar | P1 | 8h | Apparaît selon section |
| Supprimer sidebar actuelle | P0 | 4h | Transition progressive |
| Responsive breakpoints | P0 | 4h | 320px, 768px, 1024px, 1440px |
| Touch targets 44px min | P0 | 4h | WCAG mobile compliance |

### 2.3 Écrans Clés à Refondre

| Écran | Problème | Solution |
|-------|----------|----------|
| **Dashboard** | Trop de cartes/stats | Widget personnalisables, "Today" focus |
| **Liste devis** | Tableau classique | Cards visuelles avec preview |
| **Création devis** | Formulaire long | Wizard en 4 étapes avec progress |
| **PDF Preview** | Trop d'options | Presets + mode expert caché |
| **Settings** | Liste interminable | Catégories avec icônes, recherche |

### 2.4 Microinteractions & Ludification

| Élément | Implémentation |
|---------|----------------|
| **Création devis réussie** | Confetti animation + son subtil |
| **Milestone atteint** | Badge animation + notification |
| **Parrainage converti** | Celebration screen |
| **Premier devis** | Onboarding completion animation |
| **Paiement reçu** | Ka-ching sound + visual feedback |
| **Swipe actions** | Archiver, Dupliquer, Supprimer (mobile) |

---

## Phase 3: Panel Administration (Semaine 3-5)

### 3.1 Architecture Admin

```
/admin
├── /dashboard          → KPIs, alertes, actions rapides
├── /users              → Gestion utilisateurs & profils
│   ├── /[id]           → Détail utilisateur
│   └── /[id]/impersonate → Connexion en tant que
├── /subscriptions      → Plans, factures Stripe
├── /content
│   ├── /sectors        → Gestion des 27 secteurs
│   ├── /templates      → Marketplace templates
│   └── /suppliers      → Fournisseurs vérifiés
├── /finance
│   ├── /tokens         → TokenDEAL économie
│   └── /referrals      → Programme parrainage
├── /support
│   ├── /tickets        → Support client
│   └── /docs           → Documentation
├── /system
│   ├── /logs           → Audit logs
│   ├── /api            → Monitoring API
│   └── /settings       → Config globale
└── /analytics          → Rapports détaillés
```

### 3.2 Tâches Panel Admin

| Module | Priorité | Effort | Fonctionnalités |
|--------|----------|--------|-----------------|
| Dashboard Admin | P0 | 8h | KPIs, graphiques temps réel, alertes |
| Users CRUD | P0 | 12h | Liste, détail, edit, impersonate |
| Subscriptions | P1 | 8h | Plans, historique, upgrade/downgrade |
| Sectors Management | P1 | 6h | CRUD secteurs + vocabulaire IA |
| Templates Marketplace | P2 | 10h | Validation, modération, stats |
| Tokens Admin | P1 | 6h | Transactions, ajustements, bonus |
| Referrals Admin | P2 | 6h | Stats, configuration récompenses |
| Suppliers Verified | P2 | 8h | Annuaire, validation, partenariats |
| Audit Logs Viewer | P1 | 6h | Filtres, export, alertes |
| API Monitoring | P1 | 8h | Usage, rate limits, errors |
| Analytics Dashboard | P2 | 12h | Rapports personnalisables |

---

## Phase 4: Optimisations (Semaine 5-6)

### 4.1 Performance

| Tâche | Priorité | Effort | Impact |
|-------|----------|--------|--------|
| Refactor AdvancedQuoteEditor | P1 | 16h | Bundle size, maintenance |
| PDF preview memoization | P1 | 4h | Rerenders réduits |
| Image optimization | P1 | 4h | Next.js Image partout |
| Code splitting routes | P1 | 4h | Initial load time |
| Service Worker (PWA) | P2 | 8h | Offline capability |

### 4.2 Tests & Qualité

| Tâche | Priorité | Effort | Couverture |
|-------|----------|--------|------------|
| Tests E2E (Playwright) | P1 | 16h | Flows critiques |
| Tests composants (Vitest) | P1 | 12h | UI components |
| Tests API (integration) | P1 | 8h | Tous les endpoints |
| Visual regression | P2 | 8h | Brand consistency |

---

## Phase 5: Polish & Launch (Semaine 6-8)

### 5.1 Finalisation

| Tâche | Priorité | Effort |
|-------|----------|--------|
| Documentation API (OpenAPI) | P1 | 8h |
| Guide utilisateur interactif | P1 | 8h |
| Onboarding wizard amélioré | P1 | 12h |
| Monitoring (Sentry) | P1 | 4h |
| Analytics (Mixpanel/PostHog) | P2 | 4h |

### 5.2 Launch Checklist

- [ ] Tous les "QuoteVoice" remplacés
- [ ] Rate limiting actif
- [ ] RGPD compliance vérifié
- [ ] Backup strategy documentée
- [ ] Rollback plan testé
- [ ] Monitoring alertes configurées
- [ ] Support tickets système prêt
- [ ] Documentation utilisateur complète

---

## Estimation Totale

| Phase | Durée | Effort Dev |
|-------|-------|------------|
| Phase 1: Fondations | 2 semaines | 30h |
| Phase 2: UX/UI | 2 semaines | 60h |
| Phase 3: Admin | 2 semaines | 90h |
| Phase 4: Optimisations | 1 semaine | 50h |
| Phase 5: Polish | 1 semaine | 40h |
| **TOTAL** | **8 semaines** | **270h** |

---

## Risques & Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Refonte UX trop ambitieuse | Haut | Moyen | Feature flags, rollout progressif |
| Tests insuffisants | Haut | Moyen | CI/CD obligatoire |
| Performance mobile | Moyen | Moyen | Lighthouse CI checks |
| Migration données | Haut | Bas | Backup avant chaque migration |

---

## Métriques de Succès

### Techniques
- Lighthouse Performance > 90 (mobile)
- FCP < 1.5s
- TTI < 3s
- 0 erreurs critiques Sentry

### UX
- Onboarding completion > 80%
- Task completion rate > 90%
- Mobile usage > 40% du trafic
- Support tickets < 5/semaine

### Business
- Conversion trial → paid > 15%
- Churn rate < 5%/mois
- NPS > 50

---

*Document généré par BMAD Document-Project Workflow v1.2.0*
*Équipe: CTO, Architect, Dev Senior, UX Designer, QA*
