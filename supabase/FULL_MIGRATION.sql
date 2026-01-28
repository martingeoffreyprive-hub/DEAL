-- ============================================================
-- DEAL - FULL ENTERPRISE MIGRATION
-- Exécuter dans Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- ============================================================
-- PART 1: AUDIT LOGS
-- ============================================================

-- Create enum for audit action types
DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'CREATE', 'READ', 'UPDATE', 'DELETE',
    'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT',
    'SEND', 'APPROVE', 'REJECT', 'API_CALL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for resource types
DO $$ BEGIN
  CREATE TYPE audit_resource AS ENUM (
    'quote', 'quote_item', 'profile', 'subscription',
    'user', 'organization', 'team_member', 'api_key', 'settings'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Main audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action audit_action NOT NULL,
  resource_type audit_resource NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_date ON audit_logs(user_id, action, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID, p_user_email TEXT, p_action audit_action,
  p_resource_type audit_resource, p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}', p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL, p_organization_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, details, ip_address, user_agent, organization_id)
  VALUES (p_user_id, p_user_email, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent, p_organization_id)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID) RETURNS void AS $$
DECLARE v_month_year TEXT;
BEGIN
  v_month_year := to_char(CURRENT_DATE, 'YYYY-MM');
  INSERT INTO usage_stats (user_id, month_year, ai_requests)
  VALUES (p_user_id, v_month_year, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET ai_requests = usage_stats.ai_requests + 1, updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION increment_ai_usage TO authenticated;

-- ============================================================
-- PART 2: ORGANIZATIONS & TEAMS
-- ============================================================

-- Organization member roles
DO $$ BEGIN
  CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Invitation status
DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  siret TEXT,
  vat_number TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'BE',
  email TEXT,
  phone TEXT,
  website TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role org_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);

-- Organization invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status invitation_status DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  UNIQUE(organization_id, email, status)
);

CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);

-- Add organization_id to quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_organization ON quotes(organization_id);

-- RLS for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their organizations" ON organizations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid()));

CREATE POLICY "Owners and admins can update organizations" ON organizations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid() AND organization_members.role IN ('owner', 'admin')));

CREATE POLICY "Authenticated users can create organizations" ON organizations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only owners can delete organizations" ON organizations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid() AND organization_members.role = 'owner'));

CREATE POLICY "Members can view organization members" ON organization_members FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members AS om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Owners and admins can remove members" ON organization_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM organization_members AS om WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')) OR organization_members.user_id = auth.uid());

CREATE POLICY "Users can view their pending invitations" ON organization_invitations FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND status = 'pending');

-- Helper functions
CREATE OR REPLACE FUNCTION create_organization(p_name TEXT, p_slug TEXT, p_email TEXT DEFAULT NULL, p_siret TEXT DEFAULT NULL) RETURNS UUID AS $$
DECLARE v_org_id UUID; v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'User must be authenticated'; END IF;
  INSERT INTO organizations (name, slug, email, siret, created_by) VALUES (p_name, p_slug, p_email, p_siret, v_user_id) RETURNING id INTO v_org_id;
  INSERT INTO organization_members (organization_id, user_id, role) VALUES (v_org_id, v_user_id, 'owner');
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_organizations() RETURNS TABLE (id UUID, name TEXT, slug TEXT, logo_url TEXT, role org_role, member_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.name, o.slug, o.logo_url, om.role, (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) AS member_count
  FROM organizations o INNER JOIN organization_members om ON om.organization_id = o.id
  WHERE om.user_id = auth.uid() ORDER BY om.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_organization TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organizations TO authenticated;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PART 3: API KEYS
-- ============================================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['quotes:read', 'quotes:write'],
  rate_limit INTEGER DEFAULT 100,
  last_used_at TIMESTAMPTZ,
  request_count BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_logs_key ON api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_request_logs(created_at DESC);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys" ON api_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own API keys" ON api_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own API keys" ON api_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own API keys" ON api_keys FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their API request logs" ON api_request_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- PART 4: PERFORMANCE INDEXES
-- ============================================================

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_pagination ON quotes(user_id, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_quotes_analytics ON quotes(user_id, created_at, status, total);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_sector ON quotes(user_id, sector);
CREATE INDEX IF NOT EXISTS idx_quotes_date_range ON quotes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_client_name ON quotes(user_id, client_name);
CREATE INDEX IF NOT EXISTS idx_quotes_dashboard ON quotes(user_id, status, created_at DESC) WHERE status IN ('draft', 'sent', 'accepted');

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_quotes_search ON quotes USING GIN (
  to_tsvector('french', coalesce(client_name, '') || ' ' || coalesce(title, '') || ' ' || coalesce(notes, '') || ' ' || coalesce(quote_number, ''))
);

-- Quote items indexes
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quote_items_description ON quote_items USING GIN (to_tsvector('french', description));

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_siret ON profiles(siret) WHERE siret IS NOT NULL;

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring ON subscriptions(current_period_end) WHERE status = 'active';

-- Dashboard stats function
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS TABLE (total_quotes BIGINT, draft_count BIGINT, sent_count BIGINT, accepted_count BIGINT, total_revenue NUMERIC, this_month_quotes BIGINT, this_month_revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT, COUNT(*) FILTER (WHERE status = 'draft')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'sent')::BIGINT,
    COUNT(*) FILTER (WHERE status IN ('accepted', 'finalized'))::BIGINT,
    COALESCE(SUM(total) FILTER (WHERE status IN ('accepted', 'finalized')), 0),
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::BIGINT,
    COALESCE(SUM(total) FILTER (WHERE status IN ('accepted', 'finalized') AND created_at >= date_trunc('month', CURRENT_DATE)), 0)
  FROM quotes WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search function
CREATE OR REPLACE FUNCTION search_quotes(p_user_id UUID, p_search_query TEXT, p_limit INTEGER DEFAULT 20, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (id UUID, quote_number TEXT, client_name TEXT, title TEXT, status TEXT, total NUMERIC, created_at TIMESTAMPTZ, rank REAL) AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.quote_number, q.client_name, q.title, q.status, q.total, q.created_at,
    ts_rank(to_tsvector('french', coalesce(q.client_name, '') || ' ' || coalesce(q.title, '') || ' ' || coalesce(q.notes, '') || ' ' || coalesce(q.quote_number, '')),
      plainto_tsquery('french', p_search_query)) AS rank
  FROM quotes q
  WHERE q.user_id = p_user_id
    AND to_tsvector('french', coalesce(q.client_name, '') || ' ' || coalesce(q.title, '') || ' ' || coalesce(q.notes, '') || ' ' || coalesce(q.quote_number, ''))
        @@ plainto_tsquery('french', p_search_query)
  ORDER BY rank DESC, q.created_at DESC LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_quotes TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats TO authenticated;

-- Update statistics
ANALYZE quotes;
ANALYZE quote_items;
ANALYZE profiles;
ANALYZE subscriptions;

-- ============================================================
-- MIGRATION COMPLETE!
-- ============================================================
