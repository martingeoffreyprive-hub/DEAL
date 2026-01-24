# QuoteVoice - Architecture Document

## 1. Vue d'Ensemble

### 1.1 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Next.js   │  │  shadcn/ui  │  │   @react-pdf/renderer   │  │
│  │  App Router │  │  Components │  │      PDF Generation     │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   API Routes    │  │  Server Actions │  │   Middleware    │  │
│  │  /api/generate  │  │  saveQuote()    │  │  Auth Check     │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────┐  ┌─────────────────────────────────────────┐
│   ANTHROPIC API   │  │              SUPABASE                    │
│  ┌─────────────┐  │  │  ┌──────────┐ ┌─────────┐ ┌──────────┐  │
│  │   Claude    │  │  │  │   Auth   │ │ Storage │ │ Database │  │
│  │   Sonnet    │  │  │  │          │ │  (PDF)  │ │ (Postgres)│  │
│  └─────────────┘  │  │  └──────────┘ └─────────┘ └──────────┘  │
└───────────────────┘  └─────────────────────────────────────────┘
```

### 1.2 Flux de Données Principal

```
1. User colle transcription
         │
         ▼
2. POST /api/generate
         │
         ▼
3. Claude API analyse et génère
         │
         ▼
4. Retour JSON structuré
         │
         ▼
5. Affichage éditeur
         │
         ▼
6. Modifications utilisateur
         │
         ▼
7. Sauvegarde Supabase
         │
         ▼
8. Génération PDF client-side
         │
         ▼
9. Upload PDF → Supabase Storage
```

## 2. Structure du Projet

```
quotevoice/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── quotes/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── generate/route.ts
│   │   │   └── pdf/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   ├── quotes/
│   │   │   ├── transcription-input.tsx
│   │   │   ├── quote-editor.tsx
│   │   │   ├── quote-preview.tsx
│   │   │   ├── quote-pdf.tsx
│   │   │   └── quote-list.tsx
│   │   ├── profile/
│   │   │   └── company-form.tsx
│   │   └── layout/
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── mobile-nav.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── anthropic/
│   │   │   └── client.ts
│   │   ├── pdf/
│   │   │   └── generator.tsx
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-quotes.ts
│   │   └── use-profile.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── quote.ts
│   │   └── api.ts
│   └── actions/
│       ├── auth.ts
│       ├── quotes.ts
│       └── profile.ts
├── supabase/
│   └── schema.sql
├── public/
│   └── fonts/
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 3. Modèle de Données

### 3.1 Diagramme ERD

```
┌─────────────────┐       ┌─────────────────────┐
│     profiles    │       │       quotes        │
├─────────────────┤       ├─────────────────────┤
│ id (PK, FK)     │───┐   │ id (PK)             │
│ company_name    │   │   │ user_id (FK)        │───┐
│ siret           │   │   │ client_name         │   │
│ address         │   │   │ client_email        │   │
│ phone           │   │   │ client_address      │   │
│ email           │   │   │ sector              │   │
│ logo_url        │   │   │ status              │   │
│ legal_mentions  │   │   │ quote_number        │   │
│ default_sector  │   │   │ valid_until         │   │
│ created_at      │   │   │ notes               │   │
│ updated_at      │   │   │ subtotal            │   │
└─────────────────┘   │   │ tax_rate            │   │
                      │   │ tax_amount          │   │
                      │   │ total               │   │
                      │   │ pdf_url             │   │
                      │   │ transcription       │   │
                      │   │ created_at          │   │
                      │   │ updated_at          │   │
                      │   └──────────┬──────────┘   │
                      │              │              │
                      └──────────────┼──────────────┘
                                     │
                                     │ 1:N
                                     ▼
                      ┌─────────────────────────┐
                      │      quote_items        │
                      ├─────────────────────────┤
                      │ id (PK)                 │
                      │ quote_id (FK)           │
                      │ description             │
                      │ quantity                │
                      │ unit                    │
                      │ unit_price              │
                      │ total                   │
                      │ order_index             │
                      │ created_at              │
                      └─────────────────────────┘
```

### 3.2 Tables

#### profiles
Extension de auth.users pour les données entreprise.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK, FK → auth.users |
| company_name | text | NOT NULL |
| siret | text | |
| address | text | |
| phone | text | |
| email | text | |
| logo_url | text | |
| legal_mentions | text | |
| default_sector | text | DEFAULT 'AUTRE' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### quotes
Stockage des devis.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK → auth.users, NOT NULL |
| client_name | text | NOT NULL |
| client_email | text | |
| client_address | text | |
| sector | text | NOT NULL |
| status | text | DEFAULT 'draft' |
| quote_number | text | UNIQUE |
| valid_until | date | |
| notes | text | |
| subtotal | numeric(10,2) | DEFAULT 0 |
| tax_rate | numeric(5,2) | DEFAULT 20 |
| tax_amount | numeric(10,2) | DEFAULT 0 |
| total | numeric(10,2) | DEFAULT 0 |
| pdf_url | text | |
| transcription | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### quote_items
Lignes de prestation.

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| quote_id | uuid | FK → quotes, ON DELETE CASCADE |
| description | text | NOT NULL |
| quantity | numeric(10,2) | DEFAULT 1 |
| unit | text | DEFAULT 'unité' |
| unit_price | numeric(10,2) | NOT NULL |
| total | numeric(10,2) | GENERATED |
| order_index | integer | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |

## 4. Sécurité - Row Level Security (RLS)

### 4.1 Politique profiles
```sql
-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 4.2 Politique quotes
```sql
-- Users can only access their own quotes
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes"
  ON quotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON quotes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
  ON quotes FOR DELETE
  USING (auth.uid() = user_id);
```

### 4.3 Politique quote_items
```sql
-- Users can only access items of their own quotes
CREATE POLICY "Users can manage own quote items"
  ON quote_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );
```

## 5. API Endpoints

### 5.1 POST /api/generate
Génération de devis via Claude.

**Request:**
```json
{
  "transcription": "string",
  "sector": "string (optional)"
}
```

**Response:**
```json
{
  "sector": "BTP",
  "client": {
    "name": "M. Dupont",
    "address": "12 rue des Lilas, 75001 Paris"
  },
  "items": [
    {
      "description": "Remplacement chauffe-eau 200L",
      "quantity": 1,
      "unit": "forfait",
      "unitPrice": 850
    }
  ],
  "notes": "Délai d'intervention sous 48h"
}
```

### 5.2 Claude API Prompt Structure

```
Tu es un assistant spécialisé dans la création de devis professionnels.
Analyse cette transcription d'un échange commercial et génère un devis structuré.

Secteur détecté ou imposé : {sector}

TRANSCRIPTION :
{transcription}

Retourne un JSON avec :
- sector : le secteur d'activité détecté
- client : { name, email, address, phone }
- items : [{ description, quantity, unit, unitPrice }]
- notes : remarques ou conditions particulières

Utilise un vocabulaire professionnel adapté au secteur {sector}.
Les descriptions doivent être claires et détaillées.
Estime des prix réalistes pour le marché français.
```

## 6. Composants Principaux

### 6.1 TranscriptionInput
- Textarea pleine largeur
- Compteur de caractères
- Bouton "Générer le devis"
- État de chargement avec skeleton

### 6.2 QuoteEditor
- Formulaire React Hook Form
- Validation Zod
- Sections : Client, Prestations, Totaux
- Ajout/Suppression dynamique de lignes
- Calcul automatique des totaux

### 6.3 QuotePDF
- Composant @react-pdf/renderer
- En-tête avec logo et coordonnées
- Tableau des prestations
- Récapitulatif TVA/Total
- Mentions légales en pied de page

## 7. États et Workflow des Devis

```
┌─────────┐     ┌──────────┐     ┌───────────┐
│  draft  │────▶│ finalized│────▶│  exported │
└─────────┘     └──────────┘     └───────────┘
     │                                  │
     │                                  │
     ▼                                  ▼
┌─────────┐                      ┌───────────┐
│ deleted │                      │  archived │
└─────────┘                      └───────────┘
```

## 8. Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 9. Considérations de Performance

### 9.1 Optimisations
- Lazy loading des composants lourds (PDF)
- Debounce sur les calculs de totaux
- Cache des requêtes Supabase avec React Query
- Images optimisées avec next/image

### 9.2 Bundle Size
- Import dynamique de @react-pdf/renderer
- Tree-shaking shadcn/ui
- Fonts en local (pas de Google Fonts externe)
