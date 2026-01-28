# DEAL - Epics & Stories v2.0 (Production)

**Date**: 28 janvier 2026
**Version**: 2.0 - Production Ready
**Basé sur**: DEAL-Production-Action-Plan.md, DEAL-Admin-Panel-Specs.md, DEAL-UX-Design-Vision.md

---

## Epic 1: Fondations & Securite (Phase 1)

### Story 1.1: Suppression Endpoint Debug
**En tant que** developpeur securite
**Je veux** supprimer l'endpoint `/api/test-supabase`
**Afin de** eliminer une faille de securite potentielle

**Criteres d'acceptation:**
- [ ] Endpoint `/api/test-supabase` supprime
- [ ] Aucune reference restante dans le code
- [ ] Tests de non-regression passes

### Story 1.2: Rate Limiting Global
**En tant que** developpeur backend
**Je veux** implementer le rate limiting sur tous les endpoints
**Afin de** proteger l'API contre les abus

**Criteres d'acceptation:**
- [ ] Upstash Redis configure pour rate limiting
- [ ] Middleware applique sur `/api/*`
- [ ] Limites: 100 req/min standard, 10 req/min pour IA
- [ ] Headers X-RateLimit-* retournes
- [ ] Tests de rate limiting passes

### Story 1.3: Audit Secrets et Configuration
**En tant que** developpeur securite
**Je veux** auditer tous les secrets et configurations
**Afin de** garantir qu'aucune cle n'est exposee

**Criteres d'acceptation:**
- [ ] Audit complet des fichiers .env*
- [ ] Verification des variables Vercel
- [ ] Aucune cle dans le code source
- [ ] Documentation des secrets requises

### Story 1.4: Configuration CORS Production
**En tant que** developpeur backend
**Je veux** configurer CORS correctement
**Afin de** securiser les requetes cross-origin

**Criteres d'acceptation:**
- [ ] Whitelist des domaines autorises
- [ ] Headers CORS configures
- [ ] Tests depuis domaines non autorises

### Story 1.5: Rebranding QuoteVoice vers DEAL
**En tant que** utilisateur
**Je veux** voir le branding DEAL partout
**Afin de** avoir une experience coherente

**Criteres d'acceptation:**
- [ ] README.md mis a jour
- [ ] package.json name = "deal"
- [ ] Tous les "QuoteVoice" remplaces
- [ ] Metadata SEO mis a jour
- [ ] Open Graph images DEAL

---

## Epic 2: Navigation Mobile-First (Phase 2 - UX Revolution)

### Story 2.1: Bottom Navigation Mobile
**En tant qu'** utilisateur mobile
**Je veux** une barre de navigation en bas de l'ecran
**Afin de** naviguer facilement avec le pouce

**Criteres d'acceptation:**
- [ ] 5 items maximum: Accueil, Devis, Creer, Finance, Profil
- [ ] Tap = action principale
- [ ] Long press = menu contextuel bottom sheet
- [ ] Icones animees sur selection
- [ ] Touch targets >= 44px

### Story 2.2: Suppression Sidebar Classique
**En tant qu'** utilisateur
**Je veux** une interface sans sidebar a gauche
**Afin de** ne pas avoir l'impression d'un CRM/ERP classique

**Criteres d'acceptation:**
- [ ] Sidebar actuelle supprimee
- [ ] Toutes les fonctions accessibles via nouvelle navigation
- [ ] Transition progressive (feature flag)

### Story 2.3: Top Navigation Desktop
**En tant qu'** utilisateur desktop
**Je veux** une navigation horizontale en haut
**Afin de** maximiser l'espace de contenu

**Criteres d'acceptation:**
- [ ] Barre horizontale fixe en haut
- [ ] Logo DEAL a gauche
- [ ] Navigation centrale
- [ ] Notifications + Profil a droite
- [ ] Sticky on scroll

### Story 2.4: Command Palette (Cmd+K)
**En tant qu'** utilisateur avance
**Je veux** acceder rapidement aux actions via clavier
**Afin de** etre plus productif

**Criteres d'acceptation:**
- [ ] Raccourci Cmd+K / Ctrl+K
- [ ] Recherche fuzzy dans actions
- [ ] Actions recentes listees
- [ ] Navigation clavier complete
- [ ] Design glass morphism DEAL

### Story 2.5: Gestures Mobile
**En tant qu'** utilisateur mobile
**Je veux** utiliser des gestures intuitives
**Afin de** interagir naturellement avec l'app

**Criteres d'acceptation:**
- [ ] Swipe down = refresh
- [ ] Swipe up = bottom sheet
- [ ] Swipe left sur card = archiver
- [ ] Swipe right = actions
- [ ] Long press = menu contextuel

---

## Epic 3: Dashboard Netflix-Style (Phase 2)

### Story 3.1: Hero Section Contextuelle
**En tant qu'** utilisateur
**Je veux** voir un message personnalise a chaque connexion
**Afin de** savoir immediatement mes priorites

**Criteres d'acceptation:**
- [ ] Message de bienvenue avec prenom
- [ ] Statistiques du jour
- [ ] CTAs contextuels (devis en attente, etc.)
- [ ] Fond anime subtle

### Story 3.2: Carousel Devis Recents
**En tant qu'** utilisateur
**Je veux** voir mes devis recents en carousel horizontal
**Afin de** y acceder rapidement style Netflix

**Criteres d'acceptation:**
- [ ] Scroll horizontal natif
- [ ] Cards visuelles avec preview
- [ ] Peek du prochain item
- [ ] Fleches navigation desktop
- [ ] Touch-friendly mobile

### Story 3.3: Dashboard Widgets Personnalisables
**En tant qu'** utilisateur
**Je veux** personnaliser les widgets de mon dashboard
**Afin de** voir les infos qui m'interessent

**Criteres d'acceptation:**
- [ ] Bouton "Editer" layout
- [ ] Drag & drop widgets
- [ ] Widgets: Stats, A faire, Graphique CA, Quick actions
- [ ] Sauvegarde preferences utilisateur

### Story 3.4: Cards Visuelles Devis
**En tant qu'** utilisateur
**Je veux** voir mes devis sous forme de cards
**Afin de** avoir une vue plus attrayante que les tableaux

**Criteres d'acceptation:**
- [ ] Card avec preview miniature PDF
- [ ] Badge statut colore
- [ ] Infos client, montant, date
- [ ] Hover states avec elevation
- [ ] Actions au survol

---

## Epic 4: Creation Devis Wizard (Phase 2)

### Story 4.1: Wizard Multi-Etapes
**En tant qu'** utilisateur
**Je veux** creer un devis en etapes guidees
**Afin de** ne pas etre submerge par un long formulaire

**Criteres d'acceptation:**
- [ ] 4 etapes: Client, Details, Articles, Finaliser
- [ ] Progress bar animee
- [ ] Navigation prev/next
- [ ] Sauvegarde a chaque etape
- [ ] Validation par etape

### Story 4.2: Choix Mode Creation
**En tant qu'** utilisateur
**Je veux** choisir comment creer mon devis
**Afin de** utiliser la methode qui me convient

**Criteres d'acceptation:**
- [ ] 4 modes: Vocal, Manuel, Template, Scanner
- [ ] Cards visuelles pour chaque mode
- [ ] Animation de selection
- [ ] Icones claires

### Story 4.3: Mode Chantier
**En tant qu'** artisan sur chantier
**Je veux** un mode adapte aux conditions difficiles
**Afin de** utiliser l'app meme avec des gants ou en plein soleil

**Criteres d'acceptation:**
- [ ] Toggle Mode Chantier accessible
- [ ] Contraste maximum (WCAG AAA)
- [ ] Boutons 60px minimum
- [ ] Pas de gestures complexes
- [ ] Retour haptique fort

---

## Epic 5: Microinteractions & Ludification (Phase 2)

### Story 5.1: Celebration Devis Signe
**En tant qu'** utilisateur
**Je veux** voir une animation de celebration
**Afin de** ressentir la satisfaction d'un devis signe

**Criteres d'acceptation:**
- [ ] Confetti animation
- [ ] Son subtil (optionnel)
- [ ] Message de felicitation
- [ ] Montant affiche clairement
- [ ] CTA creer facture

### Story 5.2: System de Badges
**En tant qu'** utilisateur
**Je veux** debloquer des badges pour mes accomplissements
**Afin de** etre motive a utiliser l'app

**Criteres d'acceptation:**
- [ ] Badge Premier devis
- [ ] Badge 10 devis
- [ ] Badge 10K euros CA
- [ ] Animation deblocage
- [ ] Page profil badges

### Story 5.3: Transitions Fluides
**En tant qu'** utilisateur
**Je veux** des transitions animees entre les ecrans
**Afin de** avoir une experience fluide et moderne

**Criteres d'acceptation:**
- [ ] Framer Motion integre
- [ ] Page transitions spring physics
- [ ] Skeleton loading branded
- [ ] Micro-animations sur interactions

---

## Epic 6: Panel Admin - Dashboard (Phase 3)

### Story 6.1: Admin Dashboard KPIs
**En tant qu'** administrateur
**Je veux** voir les KPIs en temps reel
**Afin de** monitorer la sante de l'application

**Criteres d'acceptation:**
- [ ] Users actifs (24h, 7j, 30j)
- [ ] Nouveaux inscrits
- [ ] MRR/ARR
- [ ] Devis generes
- [ ] Graphiques temps reel

### Story 6.2: Admin Alertes Systeme
**En tant qu'** administrateur
**Je veux** voir les alertes systeme
**Afin de** reagir rapidement aux problemes

**Criteres d'acceptation:**
- [ ] Alertes erreurs API
- [ ] Alertes rate limiting
- [ ] Alertes paiements echoues
- [ ] Notifications push

### Story 6.3: Admin Actions Rapides
**En tant qu'** administrateur
**Je veux** acceder rapidement aux actions courantes
**Afin de** etre efficace dans mon administration

**Criteres d'acceptation:**
- [ ] Boutons: Nouveau user, Bonus tokens, Annonce
- [ ] Recherche globale
- [ ] Raccourcis clavier

---

## Epic 7: Panel Admin - Gestion Users (Phase 3)

### Story 7.1: Liste Users avec Filtres
**En tant qu'** administrateur
**Je veux** voir et filtrer la liste des utilisateurs
**Afin de** trouver rapidement un utilisateur

**Criteres d'acceptation:**
- [ ] Tableau avec pagination
- [ ] Filtres: plan, statut, secteur, date
- [ ] Recherche par nom/email
- [ ] Export CSV

### Story 7.2: Detail User
**En tant qu'** administrateur
**Je veux** voir le profil complet d'un utilisateur
**Afin de** comprendre son utilisation

**Criteres d'acceptation:**
- [ ] Infos compte
- [ ] Historique abonnement
- [ ] Devis generes
- [ ] Tokens utilises
- [ ] Logs d'activite

### Story 7.3: Impersonation User
**En tant qu'** administrateur
**Je veux** me connecter en tant qu'un utilisateur
**Afin de** debugger ses problemes

**Criteres d'acceptation:**
- [ ] Bouton "Se connecter en tant que"
- [ ] Banniere visible "Mode admin"
- [ ] Retour facile au compte admin
- [ ] Logs de l'impersonation

### Story 7.4: Actions User
**En tant qu'** administrateur
**Je veux** effectuer des actions sur un compte
**Afin de** gerer les situations particulieres

**Criteres d'acceptation:**
- [ ] Suspendre/reactiver
- [ ] Reset mot de passe
- [ ] Ajuster tokens
- [ ] Changer plan
- [ ] Supprimer compte

---

## Epic 8: Panel Admin - Secteurs & Content (Phase 3)

### Story 8.1: CRUD Secteurs
**En tant qu'** administrateur
**Je veux** gerer les 27 secteurs d'activite
**Afin de** maintenir la pertinence de l'IA

**Criteres d'acceptation:**
- [ ] Liste des secteurs avec stats
- [ ] Edition nom/description
- [ ] Gestion vocabulaire IA
- [ ] Activer/desactiver

### Story 8.2: Vocabulaire IA par Secteur
**En tant qu'** administrateur
**Je veux** definir le vocabulaire specifique par secteur
**Afin d'** ameliorer la qualite des devis generes

**Criteres d'acceptation:**
- [ ] Liste termes specifiques
- [ ] Unites de mesure
- [ ] Fourchettes de prix
- [ ] Import/export CSV

### Story 8.3: Templates Marketplace
**En tant qu'** administrateur
**Je veux** moderer les templates du marketplace
**Afin de** garantir leur qualite

**Criteres d'acceptation:**
- [ ] Liste templates en attente
- [ ] Preview template
- [ ] Approuver/rejeter
- [ ] Stats utilisation

---

## Epic 9: Panel Admin - TokenDEAL Economy (Phase 3)

### Story 9.1: Dashboard Tokens
**En tant qu'** administrateur
**Je veux** voir l'economie des tokens
**Afin de** comprendre l'utilisation

**Criteres d'acceptation:**
- [ ] Tokens en circulation
- [ ] Consommation moyenne
- [ ] Top consommateurs
- [ ] Graphique tendance

### Story 9.2: Gestion Bonus Tokens
**En tant qu'** administrateur
**Je veux** attribuer des bonus tokens
**Afin de** recompenser ou compenser des utilisateurs

**Criteres d'acceptation:**
- [ ] Attribution individuelle
- [ ] Attribution en masse
- [ ] Motif obligatoire
- [ ] Historique des bonus

### Story 9.3: Configuration Prix Tokens
**En tant qu'** administrateur
**Je veux** configurer les prix des tokens
**Afin d'** ajuster l'economie

**Criteres d'acceptation:**
- [ ] Prix par pack
- [ ] Remises volume
- [ ] Tokens inclus par plan
- [ ] Historique modifications

---

## Epic 10: Panel Admin - Analytics (Phase 3)

### Story 10.1: Rapports Personnalisables
**En tant qu'** administrateur
**Je veux** creer des rapports personnalises
**Afin d'** analyser des metriques specifiques

**Criteres d'acceptation:**
- [ ] Builder de rapports
- [ ] Selection metriques
- [ ] Filtres temporels
- [ ] Export PDF/CSV

### Story 10.2: Cohortes Utilisateurs
**En tant qu'** administrateur
**Je veux** analyser les cohortes d'utilisateurs
**Afin de** comprendre la retention

**Criteres d'acceptation:**
- [ ] Tableau cohortes
- [ ] Retention par semaine/mois
- [ ] Graphique retention curve
- [ ] Segmentation par plan

### Story 10.3: Funnel Conversion
**En tant qu'** administrateur
**Je veux** voir les funnels de conversion
**Afin d'** optimiser l'onboarding

**Criteres d'acceptation:**
- [ ] Etapes: Inscription > Profil > Premier devis > Premium
- [ ] Taux conversion par etape
- [ ] Identification points de friction

---

## Epic 11: Optimisations Performance (Phase 4)

### Story 11.1: Refactor AdvancedQuoteEditor
**En tant que** developpeur
**Je veux** refactorer le composant AdvancedQuoteEditor
**Afin de** reduire le bundle size et ameliorer la maintenance

**Criteres d'acceptation:**
- [ ] Composant decompose en sous-composants
- [ ] Code splitting implemente
- [ ] Bundle size reduit de 30%+
- [ ] Tests unitaires

### Story 11.2: PDF Preview Memoization
**En tant qu'** utilisateur
**Je veux** une preview PDF qui ne re-render pas inutilement
**Afin d'** avoir une experience fluide

**Criteres d'acceptation:**
- [ ] useMemo/useCallback optimises
- [ ] Re-renders mesures et reduits
- [ ] Performance profiling passe

### Story 11.3: PWA Service Worker
**En tant qu'** utilisateur
**Je veux** utiliser l'app hors-ligne
**Afin de** ne pas dependre de la connexion

**Criteres d'acceptation:**
- [ ] Service worker installe
- [ ] Cache assets statiques
- [ ] Mode offline basique
- [ ] Sync a la reconnexion

---

## Epic 12: Tests & Qualite (Phase 4)

### Story 12.1: Tests E2E Playwright
**En tant que** developpeur
**Je veux** des tests E2E sur les flows critiques
**Afin de** eviter les regressions

**Criteres d'acceptation:**
- [ ] Flow inscription
- [ ] Flow creation devis
- [ ] Flow export PDF
- [ ] CI/CD integration

### Story 12.2: Tests Composants Vitest
**En tant que** developpeur
**Je veux** des tests unitaires sur les composants UI
**Afin de** garantir leur fonctionnement

**Criteres d'acceptation:**
- [ ] Couverture > 70%
- [ ] Composants critiques testes
- [ ] Snapshots visuels

### Story 12.3: Tests API Integration
**En tant que** developpeur
**Je veux** des tests d'integration sur les APIs
**Afin de** valider les contrats

**Criteres d'acceptation:**
- [ ] Tous endpoints testes
- [ ] Cas erreur couverts
- [ ] Auth flows valides

---

## Epic 13: Polish & Launch (Phase 5)

### Story 13.1: Onboarding Wizard Ameliore
**En tant que** nouvel utilisateur
**Je veux** un onboarding guide et engageant
**Afin de** comprendre rapidement l'app

**Criteres d'acceptation:**
- [ ] 4 etapes maximum
- [ ] Illustrations animees
- [ ] Skip possible
- [ ] Tracking completion

### Story 13.2: Documentation API OpenAPI
**En tant que** developpeur externe
**Je veux** une documentation API complete
**Afin d'** integrer DEAL dans mes systemes

**Criteres d'acceptation:**
- [ ] Spec OpenAPI 3.0
- [ ] Swagger UI integre
- [ ] Exemples par endpoint
- [ ] Authentication documente

### Story 13.3: Monitoring Sentry
**En tant que** developpeur
**Je veux** un monitoring des erreurs en production
**Afin de** reagir rapidement aux bugs

**Criteres d'acceptation:**
- [ ] Sentry SDK integre
- [ ] Source maps uploadees
- [ ] Alertes configurees
- [ ] Performance monitoring

### Story 13.4: Analytics PostHog
**En tant que** product manager
**Je veux** des analytics produit detailles
**Afin de** comprendre l'usage

**Criteres d'acceptation:**
- [ ] PostHog SDK integre
- [ ] Events cles track
- [ ] Feature flags prets
- [ ] Funnels configures

---

## Priorites de Developpement

### Sprint 1 - Securite & Fondations
- Epic 1: Stories 1.1 a 1.5 (CRITIQUE)

### Sprint 2 - Navigation Revolution
- Epic 2: Stories 2.1 a 2.5

### Sprint 3 - Dashboard & Cards
- Epic 3: Stories 3.1 a 3.4
- Epic 4: Stories 4.1 a 4.3

### Sprint 4 - Ludification & Admin Base
- Epic 5: Stories 5.1 a 5.3
- Epic 6: Stories 6.1 a 6.3

### Sprint 5 - Admin Users & Content
- Epic 7: Stories 7.1 a 7.4
- Epic 8: Stories 8.1 a 8.3

### Sprint 6 - Admin Tokens & Analytics
- Epic 9: Stories 9.1 a 9.3
- Epic 10: Stories 10.1 a 10.3

### Sprint 7 - Performance
- Epic 11: Stories 11.1 a 11.3
- Epic 12: Stories 12.1 a 12.3

### Sprint 8 - Launch
- Epic 13: Stories 13.1 a 13.4

---

*Document genere le 28 janvier 2026*
*DEAL v2.0 - Production Ready*
