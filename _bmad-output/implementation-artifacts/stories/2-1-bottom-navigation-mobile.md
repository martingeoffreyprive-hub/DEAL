# Story 2.1: Bottom Navigation Mobile

## Metadata
- **Epic**: 2 - Navigation Mobile-First
- **Sprint**: 2
- **Priority**: High
- **Estimation**: 8 points
- **Status**: ready-for-dev

---

## User Story

**En tant qu'** utilisateur mobile
**Je veux** une barre de navigation en bas de l'écran
**Afin de** naviguer facilement avec le pouce

---

## Contexte

La navigation actuelle utilise une sidebar classique qui est inadaptée au mobile. Pour créer une expérience Netflix/Amazon-style, nous devons implémenter une bottom navigation bar moderne avec:
- Navigation accessible au pouce
- Icônes animées et retour visuel
- Menu contextuel via long press
- Touch targets conformes aux standards (44px minimum)

---

## Critères d'Acceptation

- [ ] **5 items maximum**: Accueil, Devis, Créer (+), Finance, Profil
- [ ] **Tap = action principale**: Navigation directe vers la page
- [ ] **Long press = menu contextuel**: Bottom sheet avec sous-options
- [ ] **Icônes animées sur sélection**: Animation scale + couleur DEAL coral
- [ ] **Touch targets >= 44px**: Conformité accessibilité WCAG
- [ ] **Visible uniquement sur mobile**: Hidden sur desktop (> 768px)
- [ ] **Bouton "Créer" central proéminent**: Design différencié (FAB style)

---

## Spécifications Techniques

### Composant: `BottomNavigation`
```
src/components/layout/bottom-navigation.tsx
```

### Structure HTML/CSS
- Position: fixed bottom avec safe-area-inset-bottom
- Height: 64px (+ safe area)
- Background: glass morphism (blur + opacity)
- Z-index: 50 (au-dessus du contenu)

### Items de Navigation
| Icon | Label | Route | Long Press Options |
|------|-------|-------|-------------------|
| Home | Accueil | /dashboard | Stats rapides, Raccourcis |
| FileText | Devis | /quotes | Récents, Brouillons, Signés |
| Plus (FAB) | Créer | /quotes/new | Vocal, Manuel, Template |
| Wallet | Finance | /analytics | CA du mois, Factures |
| User | Profil | /profile | Paramètres, Déconnexion |

### Animation Specs
- Selection: scale 1.0 → 1.15 (spring: stiffness 400, damping 17)
- Color transition: muted → coral (#E85A5A) 200ms
- Icon fill on active state

### Bottom Sheet (Long Press)
- Trigger: 500ms press
- Animation: slide up with backdrop fade
- Items avec icônes et descriptions
- Haptic feedback sur ouverture

---

## Design Tokens

```css
/* Colors */
--nav-bg: rgba(255, 255, 255, 0.85);
--nav-bg-dark: rgba(37, 43, 74, 0.9);
--nav-active: #E85A5A; /* DEAL Coral */
--nav-inactive: #64748B;
--nav-fab-bg: linear-gradient(135deg, #E85A5A 0%, #D64545 100%);

/* Spacing */
--nav-height: 64px;
--nav-item-size: 44px;
--nav-fab-size: 56px;
--nav-safe-area: env(safe-area-inset-bottom, 0px);

/* Effects */
--nav-blur: blur(20px);
--nav-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
```

---

## Dépendances

- `framer-motion` (déjà installé)
- `lucide-react` (déjà installé)
- Composant `Sheet` de shadcn/ui pour bottom sheet

---

## Tests

### Tests Unitaires
- [ ] Rendu des 5 items
- [ ] Navigation au tap
- [ ] Bottom sheet au long press
- [ ] Responsive hidden sur desktop

### Tests E2E
- [ ] Navigation complète mobile
- [ ] Long press menu interactions

---

## Notes d'Implémentation

1. Créer le composant `BottomNavigation` dans `src/components/layout/`
2. Ajouter au layout principal avec condition mobile (`useMediaQuery`)
3. Implémenter les animations Framer Motion
4. Créer le composant `BottomSheet` pour le menu contextuel
5. Tester sur différents devices (iPhone, Android)

---

## Fichiers à Créer/Modifier

### Créer
- `src/components/layout/bottom-navigation.tsx`
- `src/components/layout/bottom-sheet-menu.tsx`

### Modifier
- `src/app/(dashboard)/layout.tsx` - Intégrer BottomNavigation
- `src/hooks/use-media-query.ts` - Créer si inexistant

---

*Story créée le 28 janvier 2026*
