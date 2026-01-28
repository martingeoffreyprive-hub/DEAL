-- Performance Indexes for DEAL
-- Optimizes queries for large datasets

-- =============================================
-- CREATE AUDIT_LOGS TABLE (if not exists)
-- =============================================

-- Drop existing audit_logs table if it has wrong structure
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'entity_type') THEN
      DROP TABLE audit_logs CASCADE;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users can view own audit logs'
  ) THEN
    CREATE POLICY "Users can view own audit logs"
      ON audit_logs FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================
-- QUOTES TABLE INDEXES
-- =============================================

-- Index for user's quotes listing with pagination (most common query)
CREATE INDEX IF NOT EXISTS idx_quotes_user_pagination
ON quotes(user_id, created_at DESC, id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_quotes_user_status
ON quotes(user_id, status, created_at DESC);

-- Index for analytics queries (revenue by period)
CREATE INDEX IF NOT EXISTS idx_quotes_analytics
ON quotes(user_id, created_at, status, total);

-- Index for sector filtering
CREATE INDEX IF NOT EXISTS idx_quotes_sector
ON quotes(user_id, sector, created_at DESC);

-- Index for client search
CREATE INDEX IF NOT EXISTS idx_quotes_client_name
ON quotes(user_id, client_name);

-- Full-text search index for quotes (if columns exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'client_name'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_quotes_search
    ON quotes USING GIN (
      to_tsvector('french',
        COALESCE(client_name, '') || ' ' ||
        COALESCE(client_email, '') || ' ' ||
        COALESCE(notes, '') || ' ' ||
        COALESCE(quote_number, '')
      )
    );
  END IF;
END $$;

-- =============================================
-- QUOTE ITEMS TABLE INDEXES (conditional)
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quote_items') THEN
    -- Index for fetching items by quote
    CREATE INDEX IF NOT EXISTS idx_quote_items_quote
    ON quote_items(quote_id, order_index);

    -- Index for description search
    CREATE INDEX IF NOT EXISTS idx_quote_items_search
    ON quote_items USING GIN (to_tsvector('french', COALESCE(description, '')));
  END IF;
END $$;

-- =============================================
-- ORGANIZATIONS TABLE INDEXES (conditional)
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    CREATE INDEX IF NOT EXISTS idx_organizations_slug
    ON organizations(slug);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') THEN
    CREATE INDEX IF NOT EXISTS idx_org_members_org
    ON organization_members(organization_id, role);

    CREATE INDEX IF NOT EXISTS idx_org_members_user
    ON organization_members(user_id, organization_id);
  END IF;
END $$;

-- =============================================
-- SUBSCRIPTIONS TABLE INDEXES (conditional)
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user
    ON subscriptions(user_id, status);

    CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe
    ON subscriptions(stripe_customer_id)
    WHERE stripe_customer_id IS NOT NULL;
  END IF;
END $$;

-- =============================================
-- USAGE STATS TABLE INDEXES (conditional)
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_stats') THEN
    CREATE INDEX IF NOT EXISTS idx_usage_stats_lookup
    ON usage_stats(user_id, month_year);
  END IF;
END $$;

-- =============================================
-- AUDIT LOGS TABLE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user
ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
ON audit_logs(entity_type, entity_id, created_at DESC);

-- =============================================
-- PROFILES TABLE INDEXES (conditional)
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_company
    ON profiles USING GIN (to_tsvector('french', COALESCE(company_name, '')));
  END IF;
END $$;

-- =============================================
-- HELPER FUNCTION: Search Quotes
-- =============================================

DROP FUNCTION IF EXISTS search_quotes(UUID, TEXT, INT, INT);

CREATE OR REPLACE FUNCTION search_quotes(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  quote_number TEXT,
  client_name TEXT,
  client_email TEXT,
  status TEXT,
  total NUMERIC,
  created_at TIMESTAMPTZ,
  rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.quote_number,
    q.client_name,
    q.client_email,
    q.status::TEXT,
    q.total,
    q.created_at,
    ts_rank(
      to_tsvector('french',
        COALESCE(q.client_name, '') || ' ' ||
        COALESCE(q.client_email, '') || ' ' ||
        COALESCE(q.notes, '') || ' ' ||
        COALESCE(q.quote_number, '')
      ),
      plainto_tsquery('french', p_search_term)
    ) AS rank
  FROM quotes q
  WHERE q.user_id = p_user_id
    AND to_tsvector('french',
      COALESCE(q.client_name, '') || ' ' ||
      COALESCE(q.client_email, '') || ' ' ||
      COALESCE(q.notes, '') || ' ' ||
      COALESCE(q.quote_number, '')
    ) @@ plainto_tsquery('french', p_search_term)
  ORDER BY rank DESC, q.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =============================================
-- HELPER FUNCTION: Get Quote Stats
-- =============================================

DROP FUNCTION IF EXISTS get_user_quote_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_quote_stats(p_user_id UUID)
RETURNS TABLE (
  total_quotes BIGINT,
  total_revenue NUMERIC,
  quotes_this_month BIGINT,
  revenue_this_month NUMERIC,
  avg_quote_value NUMERIC,
  acceptance_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_month_start DATE := date_trunc('month', CURRENT_DATE);
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_quotes,
    COALESCE(SUM(q.total), 0) AS total_revenue,
    COUNT(*) FILTER (WHERE q.created_at >= v_month_start)::BIGINT AS quotes_this_month,
    COALESCE(SUM(q.total) FILTER (WHERE q.created_at >= v_month_start), 0) AS revenue_this_month,
    COALESCE(AVG(q.total), 0) AS avg_quote_value,
    CASE
      WHEN COUNT(*) FILTER (WHERE q.status IN ('sent', 'accepted', 'rejected')) > 0
      THEN (COUNT(*) FILTER (WHERE q.status = 'accepted')::NUMERIC /
            COUNT(*) FILTER (WHERE q.status IN ('sent', 'accepted', 'rejected'))::NUMERIC * 100)
      ELSE 0
    END AS acceptance_rate
  FROM quotes q
  WHERE q.user_id = p_user_id;
END;
$$;

-- =============================================
-- HELPER FUNCTION: Log Audit Event
-- =============================================

DROP FUNCTION IF EXISTS log_audit_event(TEXT, TEXT, UUID, JSONB, JSONB);

CREATE OR REPLACE FUNCTION log_audit_event(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_quotes TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_quote_stats TO authenticated;
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;
