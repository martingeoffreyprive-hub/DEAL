# DEAL - Modèles de Données

## Vue d'Ensemble

Base de données PostgreSQL hébergée sur Supabase avec Row Level Security (RLS) activé.

---

## Entités Principales

### Profile

Profil utilisateur/entreprise.

```typescript
interface Profile {
  id: string;                    // UUID, clé primaire
  company_name: string;          // Nom de l'entreprise
  siret: string | null;          // Numéro TVA (Belgique)
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;       // URL Supabase Storage
  legal_mentions: string | null; // Mentions légales personnalisées
  default_sector: SectorType;    // Secteur par défaut
  quote_prefix: string;          // Préfixe numérotation (ex: "DEV-")
  next_quote_number: number;     // Compteur auto-incrémenté
  // Informations bancaires (QR Code EPC)
  iban: string | null;
  bic: string | null;
  bank_name: string | null;
  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}
```

---

### Quote

Devis avec informations client et totaux calculés.

```typescript
interface Quote {
  id: string;                    // UUID
  user_id: string;               // FK vers auth.users
  quote_number: string;          // Numéro unique (ex: "DEV-2026-0001")
  // Client
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  client_city: string | null;
  client_postal_code: string | null;
  // Métadonnées
  sector: SectorType;            // 27 secteurs possibles
  status: QuoteStatus;           // 7 statuts
  valid_until: string | null;    // Date de validité
  title: string | null;          // Titre du devis
  notes: string | null;          // Notes/conditions
  transcription: string | null;  // Transcription originale
  // Montants (calculés)
  subtotal: number;
  tax_rate: number;              // 0, 6, 12, ou 21%
  tax_amount: number;
  total: number;
  // Fichiers
  pdf_url: string | null;
  signature_url: string | null;
  locale: LocaleCode | null;     // fr-BE, fr-FR, fr-CH
  // Timestamps
  created_at: string;
  updated_at: string;
  finalized_at: string | null;
}
```

**Statuts possibles:**

| Statut | Description |
|--------|-------------|
| `draft` | Brouillon, modifiable |
| `sent` | Envoyé au client |
| `accepted` | Accepté par le client |
| `rejected` | Refusé par le client |
| `finalized` | Finalisé, non modifiable |
| `exported` | Exporté en PDF |
| `archived` | Archivé |

---

### QuoteItem

Ligne de devis.

```typescript
interface QuoteItem {
  id: string;
  quote_id: string;        // FK vers quotes
  description: string;     // Description de la prestation
  quantity: number;
  unit: string;            // 44 unités possibles
  unit_price: number;
  total: number;           // Calculé: quantity * unit_price
  order_index: number;     // Ordre d'affichage
  created_at: string;
}
```

---

### Material

Matériaux estimés (généré par IA).

```typescript
interface Material {
  id: string;
  quote_id: string;
  name: string;
  category: string;        // Catégorie selon secteur
  quantity: number;
  unit: string;
  unit_price: number;
  created_at: string;
}
```

---

### LaborEstimate

Estimation main d'oeuvre (généré par IA).

```typescript
interface LaborEstimate {
  id: string;
  quote_id: string;
  task: string;
  hours: number;
  hourly_rate: number;
  workers: number;
  created_at: string;
}
```

---

## Système d'Abonnements

### Subscription

```typescript
interface Subscription {
  id: string;
  user_id: string;
  plan_name: 'free' | 'pro' | 'business' | 'corporate';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}
```

### Plans et Limites

| Plan | Secteurs | Devis/mois | Prix mensuel | Prix annuel |
|------|----------|------------|--------------|-------------|
| `free` | 1 | 5 | 0€ | 0€ |
| `pro` | 10 | 100 | 29€ | 290€ |
| `business` | ∞ | ∞ | 79€ | 790€ |
| `corporate` | ∞ | ∞ | Sur devis | Sur devis |

### UsageStats

Suivi mensuel de l'utilisation.

```typescript
interface UsageStats {
  id: string;
  user_id: string;
  month_year: string;      // Format: "2026-01"
  quotes_created: number;
  ai_requests: number;
  pdf_exports: number;
  created_at: string;
  updated_at: string;
}
```

---

## Énumérations

### SectorType (27 valeurs)

```typescript
type SectorType =
  | 'ELECTRICITE'    | 'PLOMBERIE'     | 'CHAUFFAGE'
  | 'CONSTRUCTION'   | 'RENOVATION'    | 'PEINTURE'
  | 'MENUISERIE'     | 'TOITURE'       | 'JARDINAGE'
  | 'NETTOYAGE'      | 'DEMENAGEMENT'  | 'INFORMATIQUE'
  | 'COMPTABILITE'   | 'JURIDIQUE'     | 'CONSEIL'
  | 'FORMATION'      | 'EVENEMENTIEL'  | 'RESTAURATION'
  | 'TRANSPORT'      | 'DEPANNAGE'     | 'SECURITE'
  | 'SANTE'          | 'BEAUTE'        | 'PHOTO_VIDEO'
  | 'DESIGN'         | 'MARKETING'     | 'AUTRE';
```

### Unités (44 valeurs)

```typescript
const UNITS = [
  'unité', 'heure', 'jour', 'forfait', 'm²', 'm³', 'ml', 'kg',
  'lot', 'pièce', 'semaine', 'mois', 'point', 'arbre', 'passage',
  'carton', 'camion', 'licence', 'utilisateur', 'dossier', 'acte',
  'mission', 'participant', 'session', 'personne', 'km', 'trajet',
  'colis', 'palette', 'intervention', 'agent', 'nuit', 'séance',
  'consultation', 'prestation', 'photo', 'vidéo', 'projet',
  'campagne', 'an'
];
```

---

## Configuration par Secteur

Chaque secteur a une configuration complète:

```typescript
interface SectorConfig {
  label: string;              // Label affiché
  icon: string;               // Nom icône Lucide
  defaultSections: string[];  // Sections par défaut
  units: string[];            // Unités recommandées
  materialCategories: string[]; // Catégories matériaux
  commonServices: string[];   // Services courants
  aiContext: string;          // Contexte pour l'IA
  documentTitle: string;      // Titre du PDF
  taxRate: number;            // TVA par défaut (6 ou 21%)
}
```

**Exemple - Électricité:**

```typescript
{
  label: 'Électricité',
  icon: 'Zap',
  defaultSections: ['Installation électrique', 'Mise en conformité', 'Dépannage'],
  units: ['unité', 'point', 'ml', 'forfait', 'heure'],
  materialCategories: ['Câbles', 'Prises/Interrupteurs', 'Tableau électrique', 'Éclairage', 'Domotique', 'Protection'],
  commonServices: ['Installation prise', 'Remplacement tableau', 'Mise à la terre', 'Éclairage LED', 'Certification RGIE'],
  aiContext: 'électricien professionnel, normes RGIE, installations électriques résidentielles et tertiaires',
  documentTitle: 'DEVIS ÉLECTRICITÉ',
  taxRate: 21
}
```

---

## Taux de TVA Belges

| Taux | Description | Secteurs |
|------|-------------|----------|
| 0% | Exonéré | Santé |
| 6% | Taux réduit | Rénovation (>10 ans), Toiture |
| 12% | Taux intermédiaire | Restauration |
| 21% | Taux normal | Tous les autres |

---

## Row Level Security (RLS)

Toutes les tables ont RLS activé:

```sql
-- Exemple policy pour quotes
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotes"
  ON quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Relations

```
auth.users
    │
    ├──> profiles (1:1)
    │
    ├──> quotes (1:N)
    │       │
    │       ├──> quote_items (1:N)
    │       ├──> materials (1:N)
    │       └──> labor_estimates (1:N)
    │
    ├──> subscriptions (1:1)
    │
    ├──> usage_stats (1:N par mois)
    │
    ├──> user_sectors (1:N)
    │
    └──> api_keys (1:N)
```

---

*Documentation générée par BMAD Document-Project Workflow - 26/01/2026*
