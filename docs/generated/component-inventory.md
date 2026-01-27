# DEAL - Inventaire des Composants

## Vue d'Ensemble

| Catégorie | Nombre | Description |
|-----------|--------|-------------|
| UI (shadcn) | 28 | Composants Radix primitifs |
| Brand | 5 | Logo, spinner, empty states |
| Quotes | 10 | Éditeur, PDF, filtres |
| Layout | 2 | Header, sidebar |
| Subscription | 2 | Usage, alertes |
| Settings | 1 | Sélecteur de thème |
| Performance | 2 | Web Vitals, lazy loading |
| Autres | 8 | Auth, notifications, etc. |

**Total: 58 composants**

---

## Composants UI (shadcn/Radix)

| Composant | Fichier | Description |
|-----------|---------|-------------|
| AlertDialog | `ui/alert-dialog.tsx` | Dialogue de confirmation |
| Alert | `ui/alert.tsx` | Messages d'alerte |
| Avatar | `ui/avatar.tsx` | Avatar utilisateur |
| Badge | `ui/badge.tsx` | Labels/tags |
| Button | `ui/button.tsx` | Bouton avec variants |
| Card | `ui/card.tsx` | Carte conteneur |
| Collapsible | `ui/collapsible.tsx` | Section pliable |
| Dialog | `ui/dialog.tsx` | Modal dialogue |
| DropdownMenu | `ui/dropdown-menu.tsx` | Menu déroulant |
| Input | `ui/input.tsx` | Champ de saisie |
| Label | `ui/label.tsx` | Label de formulaire |
| Popover | `ui/popover.tsx` | Popover flottant |
| Progress | `ui/progress.tsx` | Barre de progression |
| ScrollArea | `ui/scroll-area.tsx` | Zone scrollable |
| Select | `ui/select.tsx` | Liste déroulante |
| Separator | `ui/separator.tsx` | Séparateur visuel |
| Skeleton | `ui/skeleton.tsx` | Placeholder loading |
| Switch | `ui/switch.tsx` | Toggle on/off |
| Table | `ui/table.tsx` | Tableau de données |
| Tabs | `ui/tabs.tsx` | Navigation par onglets |
| Textarea | `ui/textarea.tsx` | Zone de texte |
| Toast | `ui/toast.tsx` | Notification toast |
| Toaster | `ui/toaster.tsx` | Container toasts |
| Tooltip | `ui/tooltip.tsx` | Infobulle |
| DataTable | `ui/data-table.tsx` | Tableau avancé |
| SkipLink | `ui/skip-link.tsx` | Accessibilité |
| InteractiveTooltip | `ui/interactive-tooltip.tsx` | Tooltip cliquable |

---

## Composants Brand

### DealLogo

```tsx
// src/components/brand/DealLogo.tsx
<DealLogo size="md" variant="full" />
```

| Prop | Type | Description |
|------|------|-------------|
| `size` | `"sm" \| "md" \| "lg"` | Taille du logo |
| `variant` | `"full" \| "icon"` | Logo complet ou icône |

### DealLogoFull

Logo complet avec texte "DEAL".

### DealIconD

Icône "D" seule pour favicon/mobile.

### DealLoadingSpinner

```tsx
<DealLoadingSpinner size="lg" text="Chargement..." />
```

Animation de chargement avec logo DEAL.

### DealEmptyState

```tsx
<DealEmptyState
  title="Aucun devis"
  description="Créez votre premier devis"
  action={<Button>Nouveau devis</Button>}
/>
```

État vide avec illustration.

### SplashScreen

Écran de démarrage avec animation du logo.

---

## Composants Quotes

### AdvancedEditor

Éditeur de devis complet avec drag & drop.

```tsx
// src/components/quotes/advanced-editor.tsx
<AdvancedEditor
  quote={quote}
  items={items}
  onSave={handleSave}
  onGeneratePDF={handlePDF}
/>
```

**Fonctionnalités:**
- Drag & drop des lignes (@dnd-kit)
- Édition inline
- Calcul automatique des totaux
- Validation en temps réel

### QuickApproveEditor

Éditeur simplifié pour validation rapide post-génération IA.

### QuotePDFDocument

Document PDF React-PDF.

```tsx
// src/components/quotes/quote-pdf-document.tsx
<QuotePDFDocument
  quote={quote}
  items={items}
  profile={profile}
  template="modern"
  density="normal"
  showQRCode={true}
/>
```

### QuotePDFPreview

Prévisualisation PDF dans le navigateur.

### PDFTemplateSelector

Sélection des 6 templates PDF avec aperçu.

| Template | Description |
|----------|-------------|
| `classic` | Template classique sobre |
| `modern` | Design moderne épuré |
| `professional` | Professionnel avec bordures |
| `minimal` | Minimaliste |
| `elegant` | Élégant avec touches dorées |
| `bold` | Audacieux, couleurs vives |

### QuoteFilters

Filtres pour la liste des devis.

```tsx
<QuoteFilters
  onFilterChange={handleFilter}
  sectors={sectors}
  statuses={statuses}
/>
```

### QuoteComments

Système de commentaires sur les devis.

### LegalRiskAlert

Alerte silencieuse pour risques juridiques détectés.

### ComplianceAlert

Alerte de conformité RGPD/légale.

---

## Composants Layout

### Header

```tsx
// src/components/layout/header.tsx
<Header user={user} notifications={notifications} />
```

Barre de navigation principale avec:
- Logo DEAL
- Navigation
- Notifications
- Menu utilisateur

### Sidebar

```tsx
// src/components/layout/sidebar.tsx
<Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
```

Navigation latérale avec sections:
- Dashboard
- Devis
- Factures
- Leads
- Analytics
- Paramètres

---

## Composants Subscription

### UsageCard

Affichage de l'utilisation du plan.

```tsx
// src/components/subscription/usage-card.tsx
<UsageCard
  plan="pro"
  quotesUsed={45}
  aiRequestsUsed={12}
/>
```

### SubscriptionAlert

Alertes d'abonnement (limite proche, expiration).

---

## Composants Settings

### ThemeSelector

Sélecteur de thème avec variants.

```tsx
// src/components/settings/theme-selector.tsx
<ThemeSelector
  currentTheme={theme}
  onThemeChange={setTheme}
/>
```

**Dépendance manquante:** `@/components/ui/radio-group`

---

## Composants Performance

### WebVitals

Collection des métriques Web Vitals.

```tsx
// src/components/performance/web-vitals.tsx
<WebVitals />
```

Envoie les métriques (LCP, FID, CLS, TTFB) vers `/api/analytics/vitals`.

### LazyComponent

Wrapper pour chargement paresseux.

```tsx
// src/components/performance/lazy-component.tsx
<LazyComponent
  loader={() => import('./HeavyComponent')}
  fallback={<Skeleton />}
/>
```

---

## Composants Auth

### RequireOnboarding

HOC pour rediriger vers onboarding si non complété.

```tsx
<RequireOnboarding>
  <ProtectedContent />
</RequireOnboarding>
```

---

## Composants Notifications

### NotificationBell

Cloche de notifications avec badge compteur.

---

## Composants Locale

### LocaleSelector

Sélecteur de locale (BE/FR/CH).

```tsx
<LocaleSelector
  value={locale}
  onChange={setLocale}
/>
```

---

## Composants Demo

### DemoModeSwitcher

Permet de simuler différents plans d'abonnement.

```tsx
<DemoModeSwitcher />
```

---

## Composants Animation

### PageTransition

Transitions de page avec Framer Motion.

```tsx
<PageTransition>
  <PageContent />
</PageTransition>
```

---

## Composants Widget

### QuoteRequestWidget

Widget externe embeddable pour demandes de devis.

```tsx
// Intégration externe
<script src="https://deal.app/widget.js" data-api-key="deal_xxx"></script>
```

---

## Composants Command

### CommandPalette

Palette de commandes (Ctrl+K).

---

## Providers

### ThemeProvider

Provider pour next-themes.

### ThemeToggle

Bouton toggle dark/light mode.

---

## Arborescence Complète

```
src/components/
├── animations/
│   └── page-transition.tsx
├── auth/
│   └── require-onboarding.tsx
├── brand/
│   ├── DealEmptyState.tsx
│   ├── DealIconD.tsx
│   ├── DealLoadingSpinner.tsx
│   ├── DealLogo.tsx
│   ├── DealLogoFull.tsx
│   └── SplashScreen.tsx
├── command-palette/
│   └── command-palette.tsx
├── demo/
│   └── DemoModeSwitcher.tsx
├── layout/
│   ├── header.tsx
│   └── sidebar.tsx
├── locale/
│   └── locale-selector.tsx
├── notifications/
│   └── notification-bell.tsx
├── performance/
│   ├── lazy-component.tsx
│   └── web-vitals.tsx
├── quotes/
│   ├── advanced-editor.tsx
│   ├── compliance-alert.tsx
│   ├── legal-risk-alert.tsx
│   ├── pdf-template-selector.tsx
│   ├── quick-approve-editor.tsx
│   ├── quote-comments.tsx
│   ├── quote-filters.tsx
│   ├── quote-pdf-document.tsx
│   └── quote-pdf-preview.tsx
├── settings/
│   └── theme-selector.tsx
├── subscription/
│   ├── subscription-alert.tsx
│   └── usage-card.tsx
├── ui/
│   └── [28 composants shadcn]
├── widget/
│   └── quote-request-widget.tsx
├── theme-provider.tsx
└── theme-toggle.tsx
```

---

*Documentation générée par BMAD Document-Project Workflow - 26/01/2026*
