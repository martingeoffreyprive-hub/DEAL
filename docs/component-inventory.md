# Inventaire des Composants DEAL

> Catalogue complet des 80 composants React du projet DEAL, organises par categorie fonctionnelle.
> Derniere mise a jour : Janvier 2026

---

## Table des matieres

1. [Vue d'ensemble](#vue-densemble)
2. [Layout et Navigation](#layout-et-navigation)
3. [Tableau de bord](#tableau-de-bord)
4. [Devis et PDF](#devis-et-pdf)
5. [Marque et Identite](#marque-et-identite)
6. [Authentification et Onboarding](#authentification-et-onboarding)
7. [Parametres et Themes](#parametres-et-themes)
8. [Abonnement](#abonnement)
9. [Notifications](#notifications)
10. [Animations et Performance](#animations-et-performance)
11. [Gamification](#gamification)
12. [Localisation](#localisation)
13. [Palette de commandes](#palette-de-commandes)
14. [Administration](#administration)
15. [Demo](#demo)
16. [Widget](#widget)
17. [Composants shadcn/ui](#composants-shadcnui)
18. [Contextes React](#contextes-react)
19. [Systeme de design](#systeme-de-design)
20. [Accessibilite](#accessibilite)
21. [Distribution de la complexite](#distribution-de-la-complexite)

---

## Vue d'ensemble

| Categorie | Nombre | Composants cles |
|---|---|---|
| Layout et Navigation | 4 | Header, BottomNavigation |
| Tableau de bord | 2 | HeroSection, QuoteCarousel |
| Devis / PDF | 12 | QuotePDFDocument, QuotePDFPreview, QuoteWizard |
| Marque / Identite | 9 | DealLogo, SplashScreen, BrandConstants |
| Auth et Onboarding | 2 | RequireOnboarding, OnboardingWizard |
| Parametres et Themes | 4 | ConstructionModeToggle, ThemeProvider |
| Abonnement | 2 | SubscriptionAlert, UsageCard |
| Notifications | 1 | NotificationBell |
| Animations et Performance | 4 | PageTransition, LazyComponent, WebVitals |
| Gamification | 2 | BadgeSystem, QuoteCelebration |
| Localisation | 1 | LocaleSelector |
| Palette de commandes | 2 | CommandPalette, index |
| Administration | 1 | UserDetailModal |
| Demo | 1 | DemoModeSwitcher |
| Widget | 1 | QuoteRequestWidget |
| shadcn/ui | 31 | 27 standard + 4 personnalises |
| **Total** | **80** | |

---

## Layout et Navigation

### Header
- **Role** : Barre de navigation principale de l'application
- **Fonctionnalites** : Navigation responsive, menu utilisateur, liens contextuels

### BottomNavigation
- **Lignes** : ~269
- **Role** : Navigation mobile fixee en bas de l'ecran
- **Fonctionnalites** :
  - Retour haptique (`navigator.vibrate`) lors de la selection d'un onglet
  - Indicateur visuel de l'onglet actif
  - Adaptation responsive (masque sur desktop)
  - Navigation entre les sections principales : tableau de bord, devis, parametres

### BottomSheetMenu
- **Role** : Menu contextuel en feuille glissante depuis le bas de l'ecran
- **Fonctionnalites** : Animation de glissement, geste de fermeture, overlay

### Sidebar
- **Role** : Navigation laterale pour les ecrans desktop
- **Fonctionnalites** : Menu repliable, sections organisees, indicateurs de navigation

---

## Tableau de bord

### HeroSection
- **Role** : Section d'accueil personnalisee du tableau de bord
- **Fonctionnalites** :
  - Message d'accueil base sur l'heure du jour (matin, apres-midi, soir)
  - Resume des statistiques cles (devis en cours, montants)
  - Appels a l'action rapides

### QuoteCarousel
- **Role** : Carrousel horizontal des devis recents
- **Fonctionnalites** :
  - Defilement horizontal fluide (scroll snap)
  - Cartes de devis avec apercu rapide
  - Navigation tactile et souris

---

## Devis et PDF

### QuotePDFDocument
- **Lignes** : ~725
- **Role** : Document PDF genere via `@react-pdf/renderer`
- **Fonctionnalites** :
  - Mise en page professionnelle multi-pages
  - Integration du logo et des informations de l'entreprise
  - Tableau des lignes de devis avec calcul automatique
  - QR code EPC pour le paiement
  - Mentions legales et conditions generales
  - Support multi-templates

### QuotePDFPreview
- **Lignes** : ~1467
- **Role** : Apercu en temps reel du PDF dans le navigateur
- **Fonctionnalites** :
  - Rendu HTML fidele au PDF final
  - Mise a jour reactive des modifications
  - Zoom et navigation entre les pages
  - Mode impression

### QuoteWizard
- **Role** : Assistant etape par etape pour la creation de devis
- **Fonctionnalites** : Formulaire multi-etapes, validation progressive, sauvegarde automatique

### AdvancedEditor
- **Role** : Editeur avance pour la modification detaillee des devis
- **Fonctionnalites** : Edition inline, drag-and-drop des lignes (via dnd-kit), calculs automatiques

### QuoteFilters
- **Role** : Filtrage et recherche des devis existants
- **Fonctionnalites** : Filtres par statut, date, client, montant

### QuoteComments
- **Role** : Systeme de commentaires en temps reel sur les devis
- **Fonctionnalites** :
  - Commentaires en temps reel via Supabase Realtime
  - Mentions d'utilisateurs
  - Historique des discussions

### ComplianceAlert
- **Role** : Alerte de conformite pour les devis
- **Fonctionnalites** : Verification des mentions obligatoires, alertes visuelles

### LegalRiskAlert
- **Role** : Alerte de risque juridique
- **Fonctionnalites** : Detection des clauses problematiques, suggestions de correction

### CreationModeSelector
- **Role** : Selection du mode de creation de devis (assistant IA, manuel, modele)

### PDFTemplateSelector
- **Role** : Choix du template PDF parmi les modeles disponibles

### QuickApproveEditor
- **Role** : Editeur simplifie pour l'approbation rapide des devis

---

## Marque et Identite

### DealLogo
- **Role** : Logo DEAL standard pour l'interface

### DealLogoFull
- **Role** : Logo DEAL complet avec le texte

### DealLogoForPDF
- **Role** : Version du logo optimisee pour le rendu PDF (`@react-pdf/renderer`)

### DealIconD
- **Role** : Icone "D" seule, utilisee pour le favicon et les espaces reduits

### DealLoadingSpinner
- **Role** : Indicateur de chargement anime aux couleurs de la marque

### DealEmptyState
- **Role** : Illustration et message pour les etats vides (aucun devis, aucun resultat)

### DealWatermark
- **Role** : Filigrane DEAL applique sur les documents en mode gratuit

### SplashScreen
- **Role** : Ecran de demarrage anime lors du premier chargement

### BrandConstants
- **Role** : Fichier de constantes de la marque (couleurs, typographie, espacements)
- **Exporte** : Palette de couleurs, tailles de police, tokens de design

---

## Authentification et Onboarding

### RequireOnboarding
- **Role** : Composant de garde (guard) qui redirige vers l'onboarding si le profil est incomplet

### OnboardingWizard
- **Lignes** : 600+
- **Role** : Assistant d'integration pour les nouveaux utilisateurs
- **Fonctionnalites** :
  - Formulaire multi-etapes (informations personnelles, entreprise, preferences)
  - Upload de logo
  - Configuration initiale du compte
  - Validation avec Zod

---

## Parametres et Themes

### ConstructionModeToggle
- **Lignes** : ~273
- **Role** : Bascule pour le mode construction/maintenance
- **Fonctionnalites** :
  - Exporte un contexte React (`ConstructionModeContext`)
  - Persistance de l'etat dans le stockage local
  - Indicateur visuel du mode actif

### ThemeSelector
- **Role** : Selection du theme de couleur de l'application

### ThemeProvider
- **Role** : Fournisseur du contexte de theme (via `next-themes`)
- **Fonctionnalites** : Theme clair/sombre, detection automatique des preferences systeme

### ThemeToggle
- **Role** : Bouton de bascule rapide entre theme clair et sombre

---

## Abonnement

### SubscriptionAlert
- **Role** : Banniere d'alerte pour l'etat de l'abonnement
- **Fonctionnalites** : Avertissement d'expiration, limites atteintes, invitation a la mise a niveau

### UsageCard
- **Role** : Carte affichant l'utilisation actuelle par rapport aux limites du plan
- **Fonctionnalites** : Barre de progression, statistiques d'usage (devis crees, stockage)

---

## Notifications

### NotificationBell
- **Role** : Cloche de notification avec compteur en temps reel
- **Fonctionnalites** :
  - Abonnement Supabase Realtime pour les nouvelles notifications
  - Badge avec compteur non-lu
  - Menu deroulant avec la liste des notifications
  - Marquage comme lu

---

## Animations et Performance

### PageTransition
- **Role** : Animation de transition entre les pages
- **Fonctionnalites** : Animation d'entree/sortie via Framer Motion

### SmoothTransitions
- **Role** : Animations de transition fluides pour les elements de l'interface
- **Fonctionnalites** : Animations CSS et Framer Motion, variantes configurables

### LazyComponent
- **Role** : Chargement paresseux des composants lourds
- **Fonctionnalites** : `React.lazy` + Suspense, indicateur de chargement

### WebVitals
- **Role** : Suivi des metriques de performance Web Vitals
- **Fonctionnalites** :
  - Mesure CLS, FID, FCP, LCP, TTFB
  - Rapport via la bibliotheque `web-vitals`
  - Envoi des metriques a l'analytique

---

## Gamification

### BadgeSystem
- **Role** : Systeme de badges et recompenses
- **Fonctionnalites** : Attribution de badges selon les actions (premier devis, 10 devis, etc.)

### QuoteCelebration
- **Role** : Animation de celebration lors de la creation d'un devis
- **Fonctionnalites** : Animation confetti, message de felicitations

---

## Localisation

### LocaleSelector
- **Role** : Selecteur de langue de l'application
- **Fonctionnalites** : Changement de locale, persistance de la preference

---

## Palette de commandes

### CommandPalette
- **Role** : Palette de commandes accessible via raccourci clavier (Cmd+K / Ctrl+K)
- **Fonctionnalites** :
  - Recherche rapide de devis, clients, actions
  - Navigation par clavier
  - Utilise la bibliotheque `cmdk`

### index
- **Role** : Point d'entree et barrel export du module CommandPalette

---

## Administration

### UserDetailModal
- **Role** : Modale de detail d'un utilisateur dans le panneau d'administration
- **Fonctionnalites** : Informations du compte, historique, gestion du plan d'abonnement

---

## Demo

### DemoModeSwitcher
- **Role** : Bascule pour activer/desactiver le mode demonstration
- **Fonctionnalites** : Donnees fictives, navigation libre sans compte

---

## Widget

### QuoteRequestWidget
- **Lignes** : ~519
- **Role** : Widget embarquable pour les sites web clients (demande de devis)
- **Fonctionnalites** :
  - Formulaire en 3 etapes (coordonnees, description du projet, confirmation)
  - Conformite RGPD (consentement explicite, case a cocher)
  - Personnalisation visuelle (couleurs, textes)
  - API de communication avec l'application DEAL

---

## Composants shadcn/ui

### 27 composants standard

| Composant | Base Radix UI |
|---|---|
| Accordion | `@radix-ui/react-collapsible` |
| Alert | - |
| AlertDialog | `@radix-ui/react-alert-dialog` |
| Avatar | `@radix-ui/react-avatar` |
| Badge | - |
| Button | `@radix-ui/react-slot` |
| Card | - |
| Checkbox | `@radix-ui/react-checkbox` |
| Collapsible | `@radix-ui/react-collapsible` |
| Dialog | `@radix-ui/react-dialog` |
| DropdownMenu | `@radix-ui/react-dropdown-menu` |
| Input | - |
| Label | `@radix-ui/react-label` |
| Popover | `@radix-ui/react-popover` |
| Progress | `@radix-ui/react-progress` |
| RadioGroup | `@radix-ui/react-radio-group` |
| ScrollArea | `@radix-ui/react-scroll-area` |
| Select | `@radix-ui/react-select` |
| Separator | `@radix-ui/react-separator` |
| Slider | `@radix-ui/react-slider` |
| Switch | `@radix-ui/react-switch` |
| Tabs | `@radix-ui/react-tabs` |
| Textarea | - |
| Toast / Toaster / useToast | `@radix-ui/react-toast` |
| Tooltip | `@radix-ui/react-tooltip` |

### 4 composants personnalises

| Composant | Lignes | Description |
|---|---|---|
| **data-table** | ~371 | Tableau de donnees avec tri, filtrage, pagination et selection |
| **interactive-tooltip** | ~345 | Tooltip avance avec interactions riches (cliquable, formulaire inline) |
| **skip-link** | ~51 | Lien d'evitement pour l'accessibilite (navigation clavier) |
| **swipeable-card** | ~268 | Carte glissable avec actions gestuelles (approuver, rejeter) |

---

## Contextes React

L'application utilise 7 contextes React principaux :

| Contexte | Fournisseur | Role |
|---|---|---|
| **AuthContext** | Supabase Auth | Etat d'authentification, session, utilisateur |
| **ThemeContext** | ThemeProvider (next-themes) | Theme clair/sombre, preferences |
| **ConstructionModeContext** | ConstructionModeToggle | Mode construction/maintenance |
| **SubscriptionContext** | - | Plan actif, limites, usage |
| **OnboardingContext** | - | Etat de progression de l'onboarding |
| **NotificationContext** | - | Notifications en temps reel |
| **LocaleContext** | - | Langue et localisation |

---

## Systeme de design

### Couleurs

La palette DEAL est definie dans `BrandConstants` et `tailwind.config` :

- **Primaire** : Bleu DEAL (`#2563EB` et variantes)
- **Secondaire** : Nuances de gris
- **Succes** : Vert (`green-500`)
- **Avertissement** : Orange (`amber-500`)
- **Erreur** : Rouge (`red-500`)
- **Surface** : Blanc / gris fonce selon le theme

### Typographie

- **Police principale** : Inter (variable)
- **Titres** : Poids semi-bold a bold, tailles `text-xl` a `text-4xl`
- **Corps** : Poids regular, taille `text-sm` a `text-base`
- **Code** : Monospace

### Mouvement et animations

- **Bibliotheque** : Framer Motion
- **Transitions de page** : Fondu + translation (`PageTransition`)
- **Micro-interactions** : Animations CSS (`tailwindcss-animate`)
- **Duree standard** : 200ms pour les interactions, 300ms pour les transitions
- **Courbe** : `ease-in-out` par defaut

---

## Accessibilite

### Patterns implementes

| Pattern | Implementation | Composant(s) |
|---|---|---|
| **Skip Link** | Lien d'evitement vers le contenu principal | `skip-link` (shadcn personnalise) |
| **Attributs ARIA** | `aria-label`, `aria-describedby`, `aria-live` | Tous les composants interactifs |
| **Retour haptique** | `navigator.vibrate()` sur les interactions tactiles | `BottomNavigation` |
| **Texte pour lecteurs d'ecran** | Classes `sr-only` de Tailwind | Labels, etats, descriptions |
| **Navigation clavier** | Focus visible, tabulation logique | Formulaires, menus, palette de commandes |
| **Contraste** | Conformite WCAG AA | Palette de couleurs du design system |
| **Roles semantiques** | `role="navigation"`, `role="dialog"`, etc. | Composants de structure |

---

## Distribution de la complexite

### Composants par nombre de lignes

| Categorie | Composants |
|---|---|
| **> 1000 lignes** | QuotePDFPreview (1467) |
| **500 - 1000 lignes** | QuotePDFDocument (725), OnboardingWizard (600+), QuoteRequestWidget (519) |
| **250 - 500 lignes** | data-table (371), interactive-tooltip (345), ConstructionModeToggle (273), BottomNavigation (269), swipeable-card (268) |
| **< 250 lignes** | Tous les autres composants (majorite) |

### Repartition par complexite

```
Faible (< 100 lignes)    : ████████████████████████████  ~55 composants
Moyenne (100-300 lignes)  : ██████████                    ~16 composants
Elevee (300-700 lignes)   : █████                         ~6 composants
Tres elevee (> 700 lignes): ██                            ~3 composants
```

---

*Document genere pour le projet DEAL v2.0.0*
