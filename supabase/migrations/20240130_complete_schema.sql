-- =====================================================
-- DEAL v2.0 - Complete Database Schema
-- RGPD Compliant + Workflows + Multi-tenant
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- RGPD: User Consents
-- =====================================================
CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  consent_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  source VARCHAR(50) NOT NULL DEFAULT 'settings',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

CREATE INDEX idx_user_consents_user ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);

-- =====================================================
-- RGPD: Human-in-the-Loop Requests
-- =====================================================
CREATE TABLE IF NOT EXISTS hitl_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  details JSONB DEFAULT '{}',
  level VARCHAR(50) NOT NULL DEFAULT 'confirmation',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),
  decision_reason TEXT
);

CREATE INDEX idx_hitl_user ON hitl_requests(user_id);
CREATE INDEX idx_hitl_status ON hitl_requests(status);
CREATE INDEX idx_hitl_expires ON hitl_requests(expires_at) WHERE status = 'pending';

-- =====================================================
-- User Settings (Extended)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme_variant VARCHAR(50) DEFAULT 'classic',
  accessibility_mode VARCHAR(50) DEFAULT 'standard',
  language VARCHAR(10) DEFAULT 'fr',
  hitl_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  workflow_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Companies (Extended for B2B)
-- =====================================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS sector VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Belgique';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS iban VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS bic VARCHAR(20);

-- =====================================================
-- Profiles (Extended)
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

-- =====================================================
-- Workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  trigger_type VARCHAR(100) NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]',
  human_review JSONB DEFAULT '{"enabled": true, "required_for": []}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflows_user ON workflows(user_id);
CREATE INDEX idx_workflows_enabled ON workflows(enabled) WHERE enabled = true;

-- =====================================================
-- Workflow Executions
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  trigger_data JSONB DEFAULT '{}',
  current_step_id VARCHAR(255),
  results JSONB DEFAULT '{}',
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_workflow_exec_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_exec_user ON workflow_executions(user_id);
CREATE INDEX idx_workflow_exec_status ON workflow_executions(status);

-- =====================================================
-- Invoices (Factures)
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_type VARCHAR(50) NOT NULL DEFAULT 'standard', -- standard, deposit, balance
  status VARCHAR(50) NOT NULL DEFAULT 'draft',

  -- Client info (copied from quote for legal reasons)
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  client_address TEXT,
  client_vat_number VARCHAR(50),

  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 21,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_due DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Peppol / E-invoicing
  peppol_id VARCHAR(100),
  structured_reference VARCHAR(50),
  qr_code_data TEXT,

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,

  notes TEXT,
  payment_terms TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_quote ON invoices(quote_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- =====================================================
-- Invoice Items
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'unité',
  unit_price DECIMAL(12, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 21,
  total DECIMAL(12, 2) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- =====================================================
-- Suppliers / Wholesalers Database
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Belgique',
  vat_number VARCHAR(50),
  api_endpoint VARCHAR(255),
  api_key_encrypted TEXT,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_category ON suppliers(category);
CREATE INDEX idx_suppliers_verified ON suppliers(is_verified);

-- =====================================================
-- User Suppliers (Link table)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  custom_code VARCHAR(100),
  discount_rate DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, supplier_id)
);

-- =====================================================
-- Document Templates
-- =====================================================
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system templates
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'quote', -- quote, invoice, contract
  category VARCHAR(100),
  template_data JSONB NOT NULL, -- Layout, styles, placeholders
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(8, 2) DEFAULT 0,
  downloads_count INT DEFAULT 0,
  rating DECIMAL(3, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_user ON document_templates(user_id);
CREATE INDEX idx_templates_type ON document_templates(type);
CREATE INDEX idx_templates_public ON document_templates(is_public) WHERE is_public = true;

-- =====================================================
-- Template Purchases
-- =====================================================
CREATE TABLE IF NOT EXISTS template_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  price_paid DECIMAL(8, 2) NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- =====================================================
-- Referral Program
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email VARCHAR(255) NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, signed_up, converted, rewarded
  reward_type VARCHAR(50), -- month_free, cash, tokens
  reward_amount DECIMAL(10, 2),
  reward_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- =====================================================
-- TokenDEAL (Internal Currency)
-- =====================================================
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL, -- Can be negative for spending
  balance_after INT NOT NULL,
  type VARCHAR(50) NOT NULL, -- earn, spend, bonus, refund
  source VARCHAR(100) NOT NULL, -- referral, review, purchase, etc.
  reference_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tokens_user ON token_transactions(user_id);
CREATE INDEX idx_tokens_type ON token_transactions(type);

-- Add token balance to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS token_balance INT DEFAULT 0;

-- =====================================================
-- CSV Import Jobs
-- =====================================================
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size INT NOT NULL,
  import_type VARCHAR(100) NOT NULL, -- clients, products, suppliers
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_rows INT,
  processed_rows INT DEFAULT 0,
  success_rows INT DEFAULT 0,
  error_rows INT DEFAULT 0,
  error_details JSONB DEFAULT '[]',
  mapping_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_imports_user ON import_jobs(user_id);
CREATE INDEX idx_imports_status ON import_jobs(status);

-- =====================================================
-- Vector Embeddings (for AI search)
-- =====================================================
-- Note: Requires pgvector extension
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type VARCHAR(100) NOT NULL, -- quote, product, client, document
  content_id UUID NOT NULL,
  content_text TEXT NOT NULL,
  -- embedding VECTOR(1536), -- Uncomment when pgvector is available
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_embeddings_user ON embeddings(user_id);
CREATE INDEX idx_embeddings_type ON embeddings(content_type);
-- CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- =====================================================
-- Session Logs (for RGPD compliance)
-- =====================================================
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_logs_user ON session_logs(user_id);
CREATE INDEX idx_session_logs_created ON session_logs(created_at);

-- =====================================================
-- Leads (Widget / Form submissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  work_type VARCHAR(100),
  description TEXT,
  source VARCHAR(100) NOT NULL DEFAULT 'manual', -- manual, widget, email, form, chatbot
  source_details JSONB DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'new', -- new, contacted, qualified, converted, lost
  assigned_to UUID REFERENCES auth.users(id),
  quote_id UUID REFERENCES quotes(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

CREATE INDEX idx_leads_user ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- Leads RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- API Keys (for widget integration)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  permissions JSONB DEFAULT '["widget:create_lead"]',
  rate_limit_per_hour INT DEFAULT 100,
  rate_limit_remaining INT DEFAULT 100,
  rate_limit_reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE revoked = false;

-- API Keys RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own api keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- User Settings Extension (referral code)
-- =====================================================
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;

-- =====================================================
-- Quotes Extensions
-- =====================================================
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'manual';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS workflow_execution_id UUID REFERENCES workflow_executions(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS watermark_enabled BOOLEAN DEFAULT false;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS watermark_config JSONB;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS pdf_password VARCHAR(255);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(255);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- User Consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own consents" ON user_consents
  FOR ALL USING (auth.uid() = user_id);

-- HITL Requests
ALTER TABLE hitl_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hitl requests" ON hitl_requests
  FOR ALL USING (auth.uid() = user_id);

-- User Settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workflows" ON workflows
  FOR ALL USING (auth.uid() = user_id);

-- Workflow Executions
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own executions" ON workflow_executions
  FOR ALL USING (auth.uid() = user_id);

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

-- Invoice Items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoice items" ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()
    )
  );

-- Suppliers (public read, admin write)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view verified suppliers" ON suppliers
  FOR SELECT USING (is_verified = true);

-- User Suppliers
ALTER TABLE user_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own supplier links" ON user_suppliers
  FOR ALL USING (auth.uid() = user_id);

-- Document Templates
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view public or own templates" ON document_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own templates" ON document_templates
  FOR ALL USING (auth.uid() = user_id);

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own referrals" ON referrals
  FOR ALL USING (auth.uid() = referrer_id);

-- Token Transactions
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON token_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Import Jobs
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own imports" ON import_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Embeddings
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own embeddings" ON embeddings
  FOR ALL USING (auth.uid() = user_id);

-- Session Logs (users can only view, not delete)
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own session logs" ON session_logs
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- Functions
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_year VARCHAR(4);
  v_count INT;
  v_number VARCHAR(50);
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COUNT(*) + 1 INTO v_count
  FROM invoices
  WHERE user_id = p_user_id
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  v_number := 'F' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');

  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_name VARCHAR;
  v_code VARCHAR;
  v_exists BOOLEAN;
BEGIN
  SELECT COALESCE(
    LOWER(REGEXP_REPLACE(first_name || '-' || last_name, '[^a-zA-Z0-9-]', '', 'g')),
    'user'
  ) INTO v_name
  FROM profiles WHERE id = p_user_id;

  v_code := v_name || '-' || SUBSTRING(p_user_id::TEXT, 1, 4);

  SELECT EXISTS(SELECT 1 FROM referrals WHERE referral_code = v_code) INTO v_exists;

  IF v_exists THEN
    v_code := v_code || '-' || FLOOR(RANDOM() * 1000)::INT;
  END IF;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Add tokens to user
CREATE OR REPLACE FUNCTION add_tokens(
  p_user_id UUID,
  p_amount INT,
  p_type VARCHAR,
  p_source VARCHAR,
  p_description TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_balance INT;
BEGIN
  -- Get current balance
  SELECT COALESCE(token_balance, 0) INTO v_balance
  FROM profiles WHERE id = p_user_id;

  v_balance := v_balance + p_amount;

  -- Update balance
  UPDATE profiles SET token_balance = v_balance WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO token_transactions (user_id, amount, balance_after, type, source, description)
  VALUES (p_user_id, p_amount, v_balance, p_type, p_source, p_description);

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Seed Data: Belgian VAT Rates
-- =====================================================
CREATE TABLE IF NOT EXISTS vat_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_code VARCHAR(2) NOT NULL DEFAULT 'BE',
  rate DECIMAL(5, 2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  conditions TEXT,
  is_default BOOLEAN DEFAULT false
);

INSERT INTO vat_rates (country_code, rate, name, description, conditions, is_default) VALUES
  ('BE', 21.00, 'TVA Standard', 'Taux normal', NULL, true),
  ('BE', 6.00, 'TVA Réduit (Rénovation)', 'Rénovation de logements de plus de 10 ans', 'Habitation privée de plus de 10 ans, travaux de transformation', false),
  ('BE', 6.00, 'TVA Réduit (Social)', 'Logements sociaux et établissements pour personnes handicapées', 'Logements sociaux', false),
  ('BE', 0.00, 'Exonéré / Export', 'Livraisons intracommunautaires et exportations', 'Numéro TVA valide requis', false)
ON CONFLICT DO NOTHING;

COMMIT;
