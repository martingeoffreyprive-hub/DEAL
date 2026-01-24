-- ============================================
-- QuoteVoice - Migration v2
-- Ajoute le support des informations bancaires belges,
-- la signature et les nouveaux statuts
-- ============================================
-- Exécuter ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- 1. Ajouter les colonnes bancaires au profil
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS bic TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- ============================================
-- 2. Ajouter la colonne signature aux devis
-- ============================================
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- ============================================
-- 3. Mettre à jour le type ENUM des statuts
-- ============================================

-- Étape 1: Supprimer la valeur par défaut
ALTER TABLE quotes ALTER COLUMN status DROP DEFAULT;

-- Étape 2: Modifier le type de la colonne temporairement en TEXT
ALTER TABLE quotes ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Étape 3: Supprimer l'ancien type enum
DROP TYPE IF EXISTS quote_status;

-- Étape 4: Créer le nouveau type enum
CREATE TYPE quote_status AS ENUM (
  'draft',
  'sent',
  'accepted',
  'rejected'
);

-- Étape 5: Convertir les anciennes valeurs vers les nouvelles
UPDATE quotes SET status = 'draft' WHERE status IN ('finalized', 'exported', 'archived');

-- Étape 6: Remettre le type enum sur la colonne
ALTER TABLE quotes ALTER COLUMN status TYPE quote_status USING status::quote_status;

-- Étape 7: Remettre la valeur par défaut
ALTER TABLE quotes ALTER COLUMN status SET DEFAULT 'draft';

-- ============================================
-- 4. Mettre à jour le taux de TVA par défaut (21% belge)
-- ============================================
ALTER TABLE quotes ALTER COLUMN tax_rate SET DEFAULT 21.00;

-- ============================================
-- 5. Créer le bucket pour les signatures
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false)
ON CONFLICT (id) DO NOTHING;

-- Policy pour les signatures : lecture par propriétaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own signatures'
  ) THEN
    CREATE POLICY "Users can view own signatures"
      ON storage.objects
      FOR SELECT
      USING (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Policy pour les signatures : upload par propriétaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload own signatures'
  ) THEN
    CREATE POLICY "Users can upload own signatures"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- Policy pour les signatures : suppression par propriétaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own signatures'
  ) THEN
    CREATE POLICY "Users can delete own signatures"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'signatures'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- ============================================
-- 6. Tables optionnelles pour matériaux et main d'œuvre
-- ============================================

-- Table des matériaux
CREATE TABLE IF NOT EXISTS quote_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Autre',
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unité',
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_quote_materials_quote_id ON quote_materials(quote_id);

-- RLS pour les matériaux
ALTER TABLE quote_materials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own quote materials'
  ) THEN
    CREATE POLICY "Users can view own quote materials"
      ON quote_materials
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_materials.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own quote materials'
  ) THEN
    CREATE POLICY "Users can insert own quote materials"
      ON quote_materials
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_materials.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own quote materials'
  ) THEN
    CREATE POLICY "Users can update own quote materials"
      ON quote_materials
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_materials.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own quote materials'
  ) THEN
    CREATE POLICY "Users can delete own quote materials"
      ON quote_materials
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_materials.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Table des estimations de main d'œuvre
CREATE TABLE IF NOT EXISTS quote_labor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  hours NUMERIC(10, 2) NOT NULL DEFAULT 1,
  hourly_rate NUMERIC(12, 2) NOT NULL DEFAULT 45,
  workers INTEGER NOT NULL DEFAULT 1,
  total NUMERIC(12, 2) GENERATED ALWAYS AS (hours * hourly_rate * workers) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_quote_labor_quote_id ON quote_labor(quote_id);

-- RLS pour les estimations
ALTER TABLE quote_labor ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own quote labor'
  ) THEN
    CREATE POLICY "Users can view own quote labor"
      ON quote_labor
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_labor.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own quote labor'
  ) THEN
    CREATE POLICY "Users can insert own quote labor"
      ON quote_labor
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_labor.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own quote labor'
  ) THEN
    CREATE POLICY "Users can update own quote labor"
      ON quote_labor
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_labor.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own quote labor'
  ) THEN
    CREATE POLICY "Users can delete own quote labor"
      ON quote_labor
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_labor.quote_id
          AND quotes.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
