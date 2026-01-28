# DEAL Brand Guidelines 2026

---

## Brand Identity

### Tagline
**"Votre voix a de la valeur, Deal lui donne un prix"**

### Mission
Transformer les descriptions vocales en devis professionnels en 60 secondes pour les artisans et independants.

---

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Navy Dark** | `#151833` | Backgrounds, main container |
| **Navy** | `#252B4A` | Cards, icon backgrounds |
| **Navy Light** | `#2E3555` | Hover states, borders |
| **Coral** | `#E85A5A` | Primary accent, CTAs, highlights |
| **Coral Light** | `#F06B6B` | Hover states |
| **Coral Dark** | `#D14949` | Active states |
| **White** | `#FFFFFF` | Text, icons |

### Color Ratios
- **70%** Navy tones (backgrounds)
- **20%** White (text, icons)
- **10%** Coral (accents, CTAs)

### CSS Variables

```css
:root {
  --deal-navy-dark: #151833;
  --deal-navy: #252B4A;
  --deal-navy-light: #2E3555;
  --deal-coral: #E85A5A;
  --deal-coral-light: #F06B6B;
  --deal-coral-dark: #D14949;
  --deal-white: #FFFFFF;
}
```

### Tailwind Classes

```
bg-deal-navy-dark    // #151833
bg-deal-navy         // #252B4A
bg-deal-coral        // #E85A5A
text-deal-coral      // #E85A5A
border-deal-coral    // #E85A5A
```

---

## Logo

### Logo Wordmark

```
DEAL.
     ^-- Red dot
```

- **Font**: Inter, 800 weight (Extra Bold)
- **Letter spacing**: 0.08em
- **Color**: White (#FFFFFF)
- **Dot**: Coral (#E85A5A)

### Logo Icon (D)

```
┌─────────────┐
│             │
│   D   |     │  <-- Coral accent stripe
│       |     │
│             │
└─────────────┘
    Navy background (#252B4A)
    Rounded corners (14px radius on 64px)
    White D letter
    Coral accent stripe on right
```

### Logo Variants

| Variant | Background | Letter | Accent |
|---------|------------|--------|--------|
| **Primary** | Navy #252B4A | White | Coral |
| **White** | White | Navy | Coral |
| **Dark** | Dark #151833 | White | Coral |
| **Light** | Light #F8FAFC | Navy | Coral |

### Logo Spacing

- Minimum clear space: 50% of logo height on all sides
- Minimum size: 16px (icon), 80px (wordmark)

---

## Typography

### Font Family
**Inter** (Google Fonts)

### Font Weights
- 400 Regular - Body text
- 500 Medium - Labels, navigation
- 600 Semibold - Subheadings
- 700 Bold - Headings
- 800 Extra Bold - Logo, hero text

### Scale

| Element | Size | Weight |
|---------|------|--------|
| H1 | 56-72px | 800 |
| H2 | 42px | 700 |
| H3 | 24px | 600 |
| Body | 16-18px | 400 |
| Small | 14px | 400 |
| Caption | 12px | 500 |

---

## Components

### Buttons

**Primary (Coral)**
```css
.btn-deal {
  background: #E85A5A;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 12px;
}
.btn-deal:hover {
  background: #D14949;
}
```

**Outline**
```css
.btn-deal-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}
.btn-deal-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

### Cards
```css
.card-deal {
  background: #252B4A;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}
.card-deal:hover {
  border-color: rgba(232, 90, 90, 0.3);
}
```

### Badges
```css
.badge-deal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(232, 90, 90, 0.2);
  color: #E85A5A;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
}
```

### Dot Indicator
```css
.deal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E85A5A;
}
```

---

## Gradients

### Background Gradient
```css
.bg-deal-gradient {
  background: linear-gradient(135deg, #1E2144 0%, #151833 50%, #1E2144 100%);
}
```

### Radial Overlay (for hero sections)
```css
.bg-deal-gradient-radial {
  background: radial-gradient(
    circle at 70% 30%,
    rgba(232, 90, 90, 0.15) 0%,
    transparent 50%
  );
}
```

### Coral Gradient (for special accents)
```css
.bg-deal-gradient-coral {
  background: linear-gradient(135deg, #E85A5A 0%, #D14949 100%);
}
```

---

## Usage Examples

### Header
```jsx
<header className="bg-deal-gradient">
  <nav className="flex items-center gap-3">
    <DealIconD size="lg" variant="primary" />
    <span className="text-2xl font-extrabold text-white tracking-wider">DEAL</span>
    <span className="deal-dot"></span>
  </nav>
</header>
```

### Hero Section
```jsx
<section className="bg-deal-gradient relative">
  <div className="absolute inset-0 bg-deal-gradient-radial" />
  <div className="relative z-10">
    <div className="badge-deal">
      <Sparkles />
      <span>Propulse par l'IA</span>
    </div>
    <h1 className="text-white text-6xl font-extrabold">
      Votre voix a de la valeur,
      <span className="text-deal-coral"> Deal lui donne un prix</span>
    </h1>
  </div>
</section>
```

### Feature Card
```jsx
<div className="card-deal p-6">
  <div className="w-12 h-12 rounded-xl bg-deal-coral/20 flex items-center justify-center">
    <Icon className="w-6 h-6 text-deal-coral" />
  </div>
  <h3 className="text-white font-semibold mt-4">Feature Title</h3>
  <p className="text-gray-400 mt-2">Feature description.</p>
</div>
```

---

## File Locations

| Asset | Path |
|-------|------|
| Icon Component | `src/components/brand/DealIconD.tsx` |
| Logo Component | `src/components/brand/DealLogoFull.tsx` |
| Combined Logo | `src/components/brand/DealLogo.tsx` |
| CSS Utilities | `src/app/globals.css` |
| Tailwind Config | `tailwind.config.ts` |

---

## Do's and Don'ts

### Do's
- Use coral sparingly for emphasis
- Maintain high contrast with white text on dark backgrounds
- Use the red dot after "DEAL" in the wordmark
- Keep the icon's coral accent stripe visible

### Don'ts
- Don't use coral for large background areas
- Don't stretch or distort the logo
- Don't use other accent colors
- Don't remove the red dot from the wordmark
- Don't use low contrast color combinations

---

*Brand Guidelines v2.0 - January 2026*
*www.dealofficialapp.com*
