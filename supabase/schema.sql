-- ============================================
-- DEAL - Schéma SQL Supabase
-- ============================================
-- Exécuter ce script dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TYPES ENUM
-- ============================================

-- Secteurs d'activité
CREATE TYPE sector_type AS ENUM (
  'BTP',
  'IT',
  'CONSEIL',
  'ARTISAN',
  'SERVICES',
  'AUTRE'
);

-- Statuts de devis
CREATE TYPE quote_status AS ENUM (
  'draft',
  'finalized',
  'exported',
  'archived'
);

-- ============================================
-- TABLE: profiles
-- Extension de auth.users pour les données entreprise
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  siret TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  legal_mentions TEXT DEFAULT 'Conditions de paiement : 30 jours à réception de facture. Pénalités de retard : 3 fois le taux d''intérêt légal.',
  default_sector sector_type DEFAULT 'AUTRE',
  quote_prefix TEXT DEFAULT 'DEV',
  next_quote_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX idx_profiles_company_name ON profiles(company_name);

-- ============================================
-- TABLE: quotes
-- Stockage des devis
-- ============================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Numérotation
  quote_number TEXT NOT NULL,

  -- Informations client
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  client_city TEXT,
  client_postal_code TEXT,

  -- Métadonnées
  sector sector_type NOT NULL DEFAULT 'AUTRE',
  status quote_status NOT NULL DEFAULT 'draft',
  valid_until DATE,

  -- Contenu
  title TEXT,
  notes TEXT,
  transcription TEXT,

  -- Montants
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- Fichier PDF
  pdf_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,

  -- Contraintes
  CONSTRAINT unique_quote_number_per_user UNIQUE(user_id, quote_number)
);

-- Index pour les recherches et filtres
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_client_name ON quotes(client_name);

-- ============================================
-- TABLE: quote_items
-- Lignes de prestation des devis
-- ============================================
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

  -- Contenu
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unité',
  unit_price NUMERIC(12, 2) NOT NULL,

  -- Total calculé
  total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

  -- Ordre d'affichage
  order_index INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes
CREATE INDEX idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX idx_quote_items_order ON quote_items(quote_id, order_index);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les totaux du devis
CREATE OR REPLACE FUNCTION calculate_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal NUMERIC(12, 2);
  v_tax_rate NUMERIC(5, 2);
  v_tax_amount NUMERIC(12, 2);
  v_total NUMERIC(12, 2);
BEGIN
  -- Récupérer le sous-total
  SELECT COALESCE(SUM(total), 0) INTO v_subtotal
  FROM quote_items
  WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id);

  -- Récupérer le taux de TVA
  SELECT tax_rate INTO v_tax_rate
  FROM quotes
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);

  -- Calculer TVA et total
  v_tax_amount := ROUND(v_subtotal * v_tax_rate / 100, 2);
  v_total := v_subtotal + v_tax_amount;

  -- Mettre à jour le devis
  UPDATE quotes
  SET
    subtotal = v_subtotal,
    tax_amount = v_tax_amount,
    total = v_total,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer le numéro de devis
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
  v_prefix TEXT;
  v_next_number INTEGER;
  v_year TEXT;
  v_month TEXT;
BEGIN
  -- Récupérer le préfixe et le prochain numéro
  SELECT quote_prefix, next_quote_number INTO v_prefix, v_next_number
  FROM profiles
  WHERE id = NEW.user_id;

  -- Valeurs par défaut si profil non configuré
  v_prefix := COALESCE(v_prefix, 'DEV');
  v_next_number := COALESCE(v_next_number, 1);

  -- Générer le numéro : PREFIX-YYYY-MM-XXXX
  v_year := TO_CHAR(NOW(), 'YYYY');
  v_month := TO_CHAR(NOW(), 'MM');
  NEW.quote_number := v_prefix || '-' || v_year || '-' || v_month || '-' || LPAD(v_next_number::TEXT, 4, '0');

  -- Incrémenter le compteur
  UPDATE profiles
  SET next_quote_number = v_next_number + 1
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer le profil après inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger updated_at sur profiles
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger updated_at sur quotes
CREATE TRIGGER trigger_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger calcul totaux après modification items
CREATE TRIGGER trigger_calculate_totals_insert
  AFTER INSERT ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quote_totals();

CREATE TRIGGER trigger_calculate_totals_update
  AFTER UPDATE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quote_totals();

CREATE TRIGGER trigger_calculate_totals_delete
  AFTER DELETE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quote_totals();

-- Trigger génération numéro de devis
CREATE TRIGGER trigger_generate_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW
  WHEN (NEW.quote_number IS NULL OR NEW.quote_number = '')
  EXECUTE FUNCTION generate_quote_number();

-- Trigger création profil après inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: profiles
-- ============================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLICIES: quotes
-- ============================================

-- Les utilisateurs peuvent voir leurs propres devis
CREATE POLICY "Users can view own quotes"
  ON quotes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres devis
CREATE POLICY "Users can insert own quotes"
  ON quotes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs propres devis
CREATE POLICY "Users can update own quotes"
  ON quotes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres devis
CREATE POLICY "Users can delete own quotes"
  ON quotes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: quote_items
-- ============================================

-- Les utilisateurs peuvent voir les lignes de leurs devis
CREATE POLICY "Users can view own quote items"
  ON quote_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des lignes sur leurs devis
CREATE POLICY "Users can insert own quote items"
  ON quote_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier les lignes de leurs devis
CREATE POLICY "Users can update own quote items"
  ON quote_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer les lignes de leurs devis
CREATE POLICY "Users can delete own quote items"
  ON quote_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.user_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Créer le bucket pour les logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Créer le bucket pour les PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Policy pour les logos : lecture publique
CREATE POLICY "Public can view logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'logos');

-- Policy pour les logos : upload par propriétaire
CREATE POLICY "Users can upload own logo"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy pour les logos : modification par propriétaire
CREATE POLICY "Users can update own logo"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy pour les logos : suppression par propriétaire
CREATE POLICY "Users can delete own logo"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy pour les PDFs : lecture par propriétaire
CREATE POLICY "Users can view own pdfs"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy pour les PDFs : upload par propriétaire
CREATE POLICY "Users can upload own pdfs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy pour les PDFs : suppression par propriétaire
CREATE POLICY "Users can delete own pdfs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'pdfs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- DONNÉES DE DÉMONSTRATION (optionnel)
-- ============================================

-- Décommenter pour insérer des données de test
-- ATTENTION : Nécessite un utilisateur existant

/*
-- Exemple de profil
INSERT INTO profiles (id, company_name, siret, address, city, postal_code, phone, email, default_sector)
VALUES (
  'YOUR_USER_UUID_HERE',
  'Entreprise Test',
  '12345678901234',
  '123 Rue de Test',
  'Paris',
  '75001',
  '0123456789',
  'contact@test.fr',
  'IT'
);

-- Exemple de devis
INSERT INTO quotes (user_id, client_name, client_email, sector, title, notes)
VALUES (
  'YOUR_USER_UUID_HERE',
  'Client Test',
  'client@test.fr',
  'IT',
  'Développement application web',
  'Projet à démarrer sous 2 semaines'
);

-- Exemple de lignes de devis
INSERT INTO quote_items (quote_id, description, quantity, unit, unit_price, order_index)
VALUES
  ('QUOTE_UUID_HERE', 'Développement frontend React', 10, 'jours', 500.00, 1),
  ('QUOTE_UUID_HERE', 'Développement backend Node.js', 8, 'jours', 550.00, 2),
  ('QUOTE_UUID_HERE', 'Intégration et tests', 3, 'jours', 450.00, 3);
*/

-- ============================================
-- FIN DU SCHÉMA
-- ============================================
