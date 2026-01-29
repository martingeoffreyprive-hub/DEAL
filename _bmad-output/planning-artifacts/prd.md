---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-features
  - step-06-nfr
  - step-07-constraints
  - step-08-risks
  - step-09-final
classification:
  projectType: saas_b2b
  domain: construction_services
  complexity: medium
  projectContext: brownfield
inputDocuments:
  - docs/bmad/01-product-brief.md
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/api-contracts.md
  - docs/data-models.md
  - docs/component-inventory.md
  - docs/development-guide.md
  - docs/DEAL-Brand-Guidelines.md
  - docs/DEAL-Pitch-Deck-Investisseurs.md
  - docs/generated/DEAL-Production-Action-Plan.md
  - docs/generated/DEAL-Admin-Panel-Specs.md
  - docs/generated/DEAL-UX-Design-Vision.md
  - docs/security/SECURITY-POLICY.md
  - _bmad-output/planning-artifacts/epics-and-stories.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 14
workflowType: 'prd'
---

# Product Requirements Document - DEAL

**Author:** Geoffrey
**Date:** 29 janvier 2026

## Success Criteria

### User Success
- Un artisan crée son premier devis IA en moins de 5 minutes après inscription
- Le devis généré nécessite moins de 3 modifications manuelles avant envoi
- L'utilisateur exporte un PDF professionnel en 1 clic
- Satisfaction utilisateur > 4.5/5 (NPS survey post-onboarding)

### Business Success
- **Mois 1 :** 50 utilisateurs inscrits, 25 actifs (50% activation)
- **Mois 3 :** 200 utilisateurs, 10% conversion free→pro (20 payants)
- **Mois 6 :** 500 utilisateurs, MRR 2 500€+
- **Mois 12 :** 1 500 utilisateurs, MRR 10 000€+
- Taux de rétention mois 2 > 40%
- CAC < 25€ par utilisateur acquis

### Technical Success
- Uptime > 99.5%
- Temps de génération IA < 15 secondes
- Temps de chargement pages < 2 secondes
- Zéro fuite de données utilisateur
- Couverture tests endpoints critiques > 80%

### Measurable Outcomes
- Nombre de devis générés par utilisateur par mois > 5
- Taux de conversion devis→facture > 30%
- Temps moyen session dashboard < 10 minutes (efficacité)

## Product Scope

### MVP - Existant en production
- Génération de devis IA (Claude) depuis transcription
- 6 templates PDF professionnels
- Auth Supabase + MFA
- Abonnements Stripe (5 plans)
- Dashboard complet (devis, factures, leads, analytics)
- Admin panel (9 pages)
- Rate limiting Upstash Redis
- RGPD & sécurité (RLS, AES-256, audit)

### Growth Features (Post-lancement)
- Onboarding guidé interactif
- Monitoring applicatif (Sentry/LogRocket)
- Analytics utilisateur avancées
- Intégration DocuSign (signature électronique)
- Localisation NL/DE pour marché belge complet
- App mobile PWA optimisée
- API publique pour intégrations tierces

### Vision (Future)
- Intégration HubSpot CRM bidirectionnelle
- Intégration QuickBooks comptabilité
- Marketplace de templates communautaire
- IA conversationnelle vocale directe (sans Plaud)
- Expansion européenne (FR, LU, NL)

## User Journeys

### Journey 1 : Artisan/Entrepreneur — "Du chantier au devis pro en 5 minutes"

**Persona :** Marc, plombier indépendant à Bruxelles, 38 ans.

1. **Découverte** (frustration → curiosité) — Marc termine un chantier à 18h, doit encore faire 3 devis. Découvre DEAL via pub Facebook artisans belges.
2. **Inscription & Onboarding** (curiosité → première victoire) — Inscription 30s, sélection secteur "Plomberie", profil pré-rempli champs belges (TVA, IBAN), upload logo.
3. **Premier devis IA** (victoire → émerveillement) — Colle transcription Plaud, IA extrait client/postes/prix en 12s, ajuste 2 prix, exporte PDF pro avec QR code EPC. 5 min vs 45 min avant.
4. **Usage récurrent** (habitude → dépendance) — 8 devis/semaine, atteint limite free en 4 jours, upgrade Pro, suit ses leads au dashboard.
5. **Ambassadeur** (satisfaction → évangélisation) — Partage code parrainage, gagne TokenDEAL, débloque templates premium.

**Features :** Génération IA, PDF export, secteurs, Stripe upgrade, parrainage, TokenDEAL, profil entreprise.

### Journey 2 : Admin Organisation — "Mon équipe, mes règles"

**Persona :** Sophie, gérante rénovation (8 employés), Liège.

1. **Besoin d'échelle** (frustration → recherche) — Utilise DEAL en solo 2 mois, ses 3 chefs de chantier lui envoient des notes qu'elle traite seule.
2. **Création d'organisation** (action → contrôle) — Crée organisation, invite 3 chefs comme "Member", secrétaire comme "Admin".
3. **Gestion quotidienne** (routine → optimisation) — Vue consolidée devis équipe, approuve avant envoi, suivi leads par membre.
4. **Audit & conformité** (confiance → sérénité) — Logs d'audit, gestion clés API widget.

**Features :** RBAC (4 rôles), organisations, invitations, audit logs, API keys, approbation devis.

### Journey 3 : Admin Système (Super-Admin) — "La tour de contrôle"

**Persona :** Geoffrey, fondateur DEAL.

1. **Monitoring quotidien** (vigilance → satisfaction) — Dashboard KPIs, nouvelles inscriptions, MRR en hausse.
2. **Gestion utilisateurs** (réactivité → résolution) — Retrouve utilisateur, vérifie plan/devis, reset mot de passe, upgrade/downgrade plan.
3. **Configuration produit** (stratégie → exécution) — Ajoute secteurs avec vocabulaire IA, gère templates/tokens, surveille churn.
4. **Sécurité & compliance** (responsabilité → tranquillité) — Audit logs IP/user agent, suspension comptes, export/suppression RGPD.

**Features :** Admin panel 9 pages (Dashboard, Users, Subscriptions, Sectors, Templates, Tokens, Audit, Analytics, Settings).

### Journey 4 : Lead/Prospect — "De visiteur à client"

**Persona :** Thomas, propriétaire maison à Namur.

1. **Découverte widget** (besoin → action) — Visite site web de Marc, voit formulaire contact intégré (widget DEAL), remplit nom/email/tel/besoin.
2. **Soumission** (attente → confirmation) — Envoi via API DEAL, accusé de réception.
3. **Suivi côté artisan** — Lead apparaît dashboard Marc → "New" → "Contacted" → "Qualified" → devis IA généré.
4. **Conversion** (satisfaction → fidélisation) — Thomas reçoit PDF pro, lead passe "Converted".

**Features :** Widget embed, API keys, lead capture, statuts lead, conversion lead→devis.

### Matrice Journey → Features

| Feature | Artisan | Admin Org | Super-Admin | Lead |
|---|---|---|---|---|
| Génération IA devis | ★ | ★ | | |
| PDF export | ★ | ★ | | ★ (reçoit) |
| Profil entreprise | ★ | ★ | | |
| RBAC / Organisations | | ★ | | |
| Admin panel | | | ★ | |
| Widget lead capture | | | | ★ |
| Stripe abonnements | ★ | ★ | ★ (gestion) | |
| Parrainage / Tokens | ★ | ★ | ★ (config) | |
| Audit logs | | ★ | ★ | |
| Analytics | ★ | ★ | ★ | |

## Features & Requirements

### F1 — Génération de Devis IA (Core)
- F1.1 [Must ✅] Génération devis depuis transcription texte via Claude API
- F1.2 [Must ✅] Détection automatique du secteur (27 secteurs)
- F1.3 [Must ✅] Extraction client, postes, quantités, prix unitaires
- F1.4 [Must ✅] Vocabulaire IA spécifique par secteur
- F1.5 [Must ✅] Édition manuelle post-génération (WYSIWYG)
- F1.6 [Should ✅] Création manuelle de devis (sans IA)
- F1.7 [Must ✅] Temps de génération < 15 secondes
- F1.8 [Should ✅] Duplication de devis existant

### F2 — Export PDF & Templates
- F2.1 [Must ✅] Export PDF professionnel client-side (@react-pdf)
- F2.2 [Must ✅] 6 templates PDF disponibles
- F2.3 [Must ✅] Logo entreprise sur le PDF
- F2.4 [Must ✅] Numérotation automatique (PREFIX-YYYY-MM-XXXX)
- F2.5 [Should ✅] QR code EPC pour paiement (Belgique)
- F2.6 [Must ✅] Mentions légales configurables
- F2.7 [Must ✅] Taux TVA belge (0%, 6%, 12%, 21%)

### F3 — Authentification & Sécurité
- F3.1 [Must ✅] Auth email/password Supabase
- F3.2 [Should ✅] MFA (2FA)
- F3.3 [Must ✅] Row-Level Security (RLS) sur toutes les tables
- F3.4 [Must ✅] Rate limiting Upstash Redis (10/min IA, 100/min général, 5/15min auth)
- F3.5 [Must ✅] Chiffrement AES-256 données sensibles
- F3.6 [Must ✅] RGPD : export et suppression données utilisateur
- F3.7 [Must ✅] Headers sécurité (CSP, HSTS, X-Frame-Options)

### F4 — Abonnements & Paiement
- F4.1 [Must ✅] 4 plans : Free, Pro (29€), Business (99€), Corporate (custom)
- F4.2 [Must ✅] Intégration Stripe Checkout
- F4.3 [Must ✅] Webhooks Stripe (subscription events)
- F4.4 [Must ✅] Limites par plan (devis/mois, secteurs, features)
- F4.5 [Must ✅] Upgrade/downgrade en self-service
- F4.6 [Should ✅] Prompt upgrade quand limite atteinte

### F5 — Dashboard & Analytics
- F5.1 [Must ✅] Dashboard principal (devis, factures, leads, analytics)
- F5.2 [Must ✅] Filtres et recherche sur devis (statut, secteur, date, client)
- F5.3 [Must ✅] Statuts devis : draft, sent, accepted, rejected, finalized, exported, archived
- F5.4 [Should ✅] Analytics tendances devis et revenus
- F5.5 [Should ✅] Historique devis avec timestamps

### F6 — Organisations & RBAC
- F6.1 [Must ✅] Création d'organisation
- F6.2 [Must ✅] 4 rôles hiérarchiques : Owner, Admin, Member, Viewer
- F6.3 [Must ✅] Invitation par email
- F6.4 [Must ✅] Permissions granulaires par rôle (CRUD devis, team, settings)
- F6.5 [Should ✅] Vue consolidée devis équipe
- F6.6 [Should ✅] Approbation devis par Owner/Admin

### F7 — Lead Management & Widget
- F7.1 [Must ✅] Widget embeddable pour sites clients
- F7.2 [Must ✅] Gestion clés API (permissions, rate limiting)
- F7.3 [Must ✅] Capture leads : nom, email, tel, description
- F7.4 [Must ✅] Statuts lead : New, Contacted, Qualified, Converted, Lost
- F7.5 [Should ✅] Conversion lead → devis
- F7.6 [Should ✅] Recherche et filtrage leads

### F8 — Admin Panel (Super-Admin)
- F8.1 [Must ✅] Dashboard KPIs (users, MRR, devis/jour)
- F8.2 [Must ✅] Gestion utilisateurs (suspend, delete, reset pwd, change plan)
- F8.3 [Must ✅] Gestion abonnements (MRR, ARR, churn, paiements échoués)
- F8.4 [Must ✅] Gestion secteurs (27 secteurs + vocabulaire IA)
- F8.5 [Should ✅] Gestion templates
- F8.6 [Should ✅] Gestion TokenDEAL
- F8.7 [Must ✅] Audit logs (actions, IP, user agent, timestamps)
- F8.8 [Should ✅] Analytics système
- F8.9 [Must ✅] Accès par email whitelist uniquement

### F9 — Profil & Onboarding
- F9.1 [Must ✅] Profil entreprise (nom, TVA, adresse, tel, IBAN/BIC)
- F9.2 [Must ✅] Upload logo (max 2MB, JPG/PNG)
- F9.3 [Must ✅] Sélection secteur par défaut
- F9.4 [Should ✅] Préfixe numérotation devis configurable
- F9.5 [Should 🔜] Onboarding guidé interactif

### F10 — Parrainage & TokenDEAL
- F10.1 [Should ✅] Codes parrainage et tracking
- F10.2 [Could ✅] Niveaux ambassadeur (Bronze→Platinum)
- F10.3 [Could ✅] Économie TokenDEAL (gains, dépenses, marketplace)
- F10.4 [Could ✅] Historique transactions tokens

### F11 — Growth Features (Post-lancement)
- F11.1 [Should 🔜] Monitoring applicatif (Sentry/LogRocket)
- F11.2 [Could 🔜] Analytics utilisateur avancées
- F11.3 [Could 🔜] Intégration DocuSign (signature électronique)
- F11.4 [Could 🔜] Localisation NL/DE
- F11.5 [Could 🔜] App mobile PWA
- F11.6 [Could 🔜] API publique pour intégrations tierces

**Résumé :** 45 requirements — 38 existants (84%) — 7 planifiés — 26 Must, 13 Should, 6 Could

## Non-Functional Requirements

### NFR1 — Performance
- NFR1.1 Temps de génération devis IA < 15s (P95 latence Claude API)
- NFR1.2 Temps de chargement pages < 2s (Lighthouse FCP/LCP)
- NFR1.3 Time to Interactive < 3s (Lighthouse TTI)
- NFR1.4 Génération PDF client-side < 5s
- NFR1.5 Requêtes API standard < 500ms (P95)
- NFR1.6 Concurrent users supportés : 500+

### NFR2 — Sécurité
- NFR2.1 Authentification Supabase Auth + JWT + refresh tokens
- NFR2.2 MFA TOTP 2FA optionnel
- NFR2.3 Isolation données RLS PostgreSQL sur toutes les tables
- NFR2.4 Chiffrement at-rest AES-256 données sensibles
- NFR2.5 Chiffrement in-transit TLS 1.3 (HTTPS enforced)
- NFR2.6 Rate limiting Upstash Redis (10/min IA, 100/min API, 5/15min auth)
- NFR2.7 Headers sécurité : CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- NFR2.8 OWASP Top 10 : protection XSS, CSRF, SQLi via RLS + parameterized queries
- NFR2.9 Audit trail : toute action admin loggée (IP, user agent, timestamp)

### NFR3 — Fiabilité & Disponibilité
- NFR3.1 Uptime > 99.5% (< 3.6h downtime/mois)
- NFR3.2 Backup DB automatique Supabase (point-in-time recovery)
- NFR3.3 Graceful degradation : app fonctionnelle sans IA (mode manuel)
- NFR3.4 Error handling : pages d'erreur user-friendly, retry automatique API
- NFR3.5 Zero data loss : transactions DB pour opérations critiques

### NFR4 — Scalabilité
- NFR4.1 Architecture serverless (Vercel) — auto-scaling
- NFR4.2 PostgreSQL Supabase — scaling vertical + connection pooling
- NFR4.3 Cache Upstash Redis pour rate limiting + sessions
- NFR4.4 CDN Vercel Edge Network pour assets statiques
- NFR4.5 Objectif mois 12 : 1 500 utilisateurs, 10 000+ devis/mois

### NFR5 — Conformité & Légal
- NFR5.1 RGPD : droit d'accès, rectification, suppression, portabilité
- NFR5.2 Consentement cookies conforme ePrivacy
- NFR5.3 Mentions légales configurables par utilisateur sur devis
- NFR5.4 TVA belge : conformité taux 0/6/12/21%
- NFR5.5 Conservation données : devis 10 ans, logs 2 ans
- NFR5.6 Localisation données : hébergement EU (Supabase region eu-west)

### NFR6 — Maintenabilité & Qualité
- NFR6.1 Stack : Next.js 14, TypeScript strict, Tailwind CSS, shadcn/ui
- NFR6.2 Tests : couverture endpoints critiques > 80%
- NFR6.3 CI/CD : Vercel auto-deploy sur push main
- NFR6.4 Code quality : ESLint + Prettier enforced
- NFR6.5 Documentation : API contracts, data models, architecture docs
- NFR6.6 Monitoring : Sentry/LogRocket planifié

### NFR7 — Accessibilité & UX
- NFR7.1 Responsive mobile-first (breakpoints sm/md/lg/xl)
- NFR7.2 Accessibilité WCAG 2.1 AA minimum
- NFR7.3 Langue : français (principal), NL/DE planifié
- NFR7.4 Navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions)
- NFR7.5 PWA planifié — mode hors ligne consultation devis

**Résumé NFR :** 34 requirements — 7 domaines

## Constraints & Assumptions

### Constraints

**Techniques**
- C1 Stack fixé : Next.js 14, TypeScript, Supabase, Vercel — pas de migration à court terme
- C2 Claude API uniquement — dépendance Anthropic (disponibilité, pricing)
- C3 PDF client-side (@react-pdf) — limité par puissance device client
- C4 Supabase Auth — pas de SSO/OAuth social pour le MVP
- C5 Serverless Vercel — timeout 10s (hobby) / 60s (pro) sur API routes

**Business**
- C6 Marché belge FR uniquement au lancement — NL/DE en phase Growth
- C7 Budget bootstrap — optimisation coûts infrastructure
- C8 Équipe réduite (1 fondateur/développeur) — priorisation stricte
- C9 Pré-lancement — MVP existant, pas encore en production
- C10 Pricing fixé : Free / Pro 29€ / Business 99€ / Corporate custom

**Légales**
- C11 RGPD obligation EU — données hébergées EU (Supabase eu-west)
- C12 TVA belge 4 taux obligatoires (0/6/12/21%)
- C13 Facturation électronique — normes et mentions légales belges

### Assumptions

**Marché**
- A1 Les artisans belges francophones ont smartphone + email
- A2 Le pain point "rédaction devis" est prioritaire vs facturation
- A3 Pro à 29€/mois acceptable pour artisan indépendant
- A4 Transcription vocale (Plaud) est un use case courant — copier-coller texte libre comme alternative
- A5 50 utilisateurs atteignables mois 1 via marketing digital

**Techniques**
- A6 Claude API stable et dans le budget (< 0.10€/devis)
- A7 Supabase free tier suffisant pour les 3 premiers mois
- A8 Vercel hobby tier supporte le trafic initial
- A9 Qualité IA suffisante pour 27 secteurs
- A10 Rate limiting actuel prévient les abus efficacement

**Utilisateurs**
- A11 Les artisans acceptent de coller une transcription texte
- A12 Le workflow devis IA → édition → PDF est intuitif
- A13 Les équipes Business ont besoin de RBAC granulaire

### Dependencies

| Service | Criticité | Fallback |
|---|---|---|
| Anthropic Claude API | Haute | Mode création manuelle |
| Supabase (Auth+DB+Storage) | Critique | Aucun (migration lourde) |
| Stripe | Haute | Facturation manuelle temporaire |
| Vercel | Haute | Déploiement alternatif (Netlify, Railway) |
| Upstash Redis | Moyenne | Rate limiting in-memory dégradé |

## Risks & Mitigations

### Risques Techniques
- RT1 [Moy/Haut] Claude API indisponible → fallback création manuelle, monitoring latence, alerting > 20s
- RT2 [Faible/Critique] Supabase downtime → point-in-time recovery, backup, monitoring uptime externe
- RT3 [Haute/Moy] Dépassement limites free tier → monitoring usage, budget alerte, plan upgrade pré-approuvé
- RT4 [Moy/Moy] Performance PDF dégradée sur mobile → optimisation templates, lazy loading, test devices bas de gamme
- RT5 [Faible/Critique] Faille sécurité RLS → audit systématique, tests d'intrusion pré-lancement
- RT6 [Moy/Haut] Coût IA explose → monitoring coût/devis, cache réponses, quota par plan

### Risques Business
- RB1 [Moy/Haut] Adoption < 50 users mois 1 → multi-canal (Facebook, terrain, fédérations artisans)
- RB2 [Moy/Haut] Conversion free→pro < 10% → A/B test limites, offre essai Pro 14j
- RB3 [Moy/Haut] Churn élevé mois 2 → onboarding guidé, email drip, feature discovery
- RB4 [Faible/Moy] Pricing inadapté → benchmark concurrents, survey, ajustement
- RB5 [Haute/Critique] Bus factor 1 → documentation exhaustive, architecture simple, code maintenable

### Risques Produit
- RP1 [Moy/Haut] Qualité IA insuffisante certains secteurs → focus 10 secteurs prioritaires, feedback loop
- RP2 [Moy/Haut] UX trop complexe pour artisans non-tech → user testing, simplification, tutoriels vidéo
- RP3 [Moy/Faible] Widget lead capture faible adoption → feature secondaire, focus core
- RP4 [Faible/Faible] RBAC sur-engineered → utile pour upsell Business

### Top 3 Risques Prioritaires
1. RB5 — Bus factor 1 → Documentation + architecture simple
2. RT1/RT6 — Dépendance Claude API → Fallback manuel + monitoring coût
3. RB1/RB3 — Adoption et rétention → Onboarding guidé + multi-canal

## Final Summary

### Document Overview
- **Produit :** DEAL — SaaS B2B de génération de devis IA pour artisans belges
- **Auteur :** Geoffrey
- **Date :** 29 janvier 2026
- **Classification :** SaaS B2B, Construction Services, Medium complexity, Brownfield
- **Statut :** Pré-lancement, MVP 84% implémenté

### Chiffres clés
- 4 types d'utilisateurs : Artisan, Admin Org, Super-Admin, Lead/Prospect
- 4 user journeys narratifs validés
- 11 domaines fonctionnels, 45 requirements (38 existants, 7 planifiés)
- 34 non-functional requirements sur 7 domaines
- 13 contraintes (5 tech, 5 business, 3 légales)
- 13 hypothèses (5 marché, 5 tech, 3 utilisateurs)
- 5 dépendances externes
- 15 risques identifiés avec mitigations

### Objectifs de lancement
- Mois 1 : 50 utilisateurs, 25 actifs
- Mois 3 : 200 utilisateurs, 20 payants
- Mois 12 : 1 500 utilisateurs, MRR 10 000€+

### Prochaines étapes recommandées
1. Stabilisation et tests pré-lancement (audit RLS, tests endpoints critiques)
2. Onboarding guidé interactif (F9.5)
3. Monitoring applicatif (F11.1 — Sentry/LogRocket)
4. Stratégie acquisition multi-canal
5. User testing avec 5-10 artisans beta
