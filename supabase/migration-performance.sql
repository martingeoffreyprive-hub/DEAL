-- Migration: Performance Optimization
-- Database indexes for enterprise-grade performance

-- ===========================================
-- QUOTES TABLE INDEXES
-- ===========================================

-- Index for pagination (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_quotes_pagination
  ON quotes(user_id, created_at DESC, id);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_quotes_analytics
  ON quotes(user_id, created_at, status, total);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_quotes_status
  ON quotes(user_id, status);

-- Index for sector filtering
CREATE INDEX IF NOT EXISTS idx_quotes_sector
  ON quotes(user_id, sector);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_quotes_date_range
  ON quotes(user_id, created_at DESC);

-- Index for client search
CREATE INDEX IF NOT EXISTS idx_quotes_client_name
  ON quotes(user_id, client_name);

-- Composite index for common dashboard query
CREATE INDEX IF NOT EXISTS idx_quotes_dashboard
  ON quotes(user_id, status, created_at DESC)
  WHERE status IN ('draft', 'sent', 'accepted');

-- Full-text search index on quotes
-- Using GIN index for efficient text search
CREATE INDEX IF NOT EXISTS idx_quotes_search
  ON quotes USING GIN (
    to_tsvector('french',
      coalesce(client_name, '') || ' ' ||
      coalesce(title, '') || ' ' ||
      coalesce(notes, '') || ' ' ||
      coalesce(quote_number, '')
    )
  );

-- ===========================================
-- QUOTE ITEMS TABLE INDEXES
-- ===========================================

-- Index for fetching items by quote
CREATE INDEX IF NOT EXISTS idx_quote_items_quote
  ON quote_items(quote_id, order_index);

-- Index for item search
CREATE INDEX IF NOT EXISTS idx_quote_items_description
  ON quote_items USING GIN (to_tsvector('french', description));

-- ===========================================
-- PROFILES TABLE INDEXES
-- ===========================================

-- Index for company search
CREATE INDEX IF NOT EXISTS idx_profiles_company
  ON profiles(company_name);

-- Index for SIRET lookup
CREATE INDEX IF NOT EXISTS idx_profiles_siret
  ON profiles(siret) WHERE siret IS NOT NULL;

-- ===========================================
-- SUBSCRIPTIONS TABLE INDEXES
-- ===========================================

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
  ON subscriptions(user_id, status)
  WHERE status = 'active';

-- Index for expiring subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring
  ON subscriptions(current_period_end)
  WHERE status = 'active';

-- ===========================================
-- USAGE STATS TABLE INDEXES
-- ===========================================

-- Index for monthly lookups
CREATE INDEX IF NOT EXISTS idx_usage_stats_month
  ON usage_stats(user_id, month_year);

-- ===========================================
-- AUDIT LOGS TABLE INDEXES
-- ===========================================

-- Index for user activity
CREATE INDEX IF NOT EXISTS idx_audit_user_activity
  ON audit_logs(user_id, created_at DESC);

-- Index for resource history
CREATE INDEX IF NOT EXISTS idx_audit_resource_history
  ON audit_logs(resource_type, resource_id, created_at DESC);

-- Index for action type filtering
CREATE INDEX IF NOT EXISTS idx_audit_action_type
  ON audit_logs(action, created_at DESC);

-- Partial index for recent logs (last 30 days)
CREATE INDEX IF NOT EXISTS idx_audit_recent
  ON audit_logs(created_at DESC)
  WHERE created_at > now() - INTERVAL '30 days';

-- ===========================================
-- API REQUEST LOGS INDEXES
-- ===========================================

-- Index for API usage analytics
CREATE INDEX IF NOT EXISTS idx_api_logs_analytics
  ON api_request_logs(user_id, created_at DESC, status_code);

-- Partial index for errors only
CREATE INDEX IF NOT EXISTS idx_api_logs_errors
  ON api_request_logs(created_at DESC, status_code)
  WHERE status_code >= 400;

-- ===========================================
-- ORGANIZATIONS TABLE INDEXES
-- ===========================================

-- Index for slug lookup
CREATE INDEX IF NOT EXISTS idx_organizations_slug
  ON organizations(slug);

-- Index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_organizations_stripe
  ON organizations(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- ===========================================
-- ORGANIZATION MEMBERS INDEXES
-- ===========================================

-- Index for member lookup by user
CREATE INDEX IF NOT EXISTS idx_org_members_user_orgs
  ON organization_members(user_id, organization_id);

-- Index for role filtering
CREATE INDEX IF NOT EXISTS idx_org_members_role
  ON organization_members(organization_id, role);

-- ===========================================
-- HELPER FUNCTIONS FOR SEARCH
-- ===========================================

-- Function for full-text quote search
CREATE OR REPLACE FUNCTION search_quotes(
  p_user_id UUID,
  p_search_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  quote_number TEXT,
  client_name TEXT,
  title TEXT,
  status TEXT,
  total NUMERIC,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.quote_number,
    q.client_name,
    q.title,
    q.status,
    q.total,
    q.created_at,
    ts_rank(
      to_tsvector('french',
        coalesce(q.client_name, '') || ' ' ||
        coalesce(q.title, '') || ' ' ||
        coalesce(q.notes, '') || ' ' ||
        coalesce(q.quote_number, '')
      ),
      plainto_tsquery('french', p_search_query)
    ) AS rank
  FROM quotes q
  WHERE q.user_id = p_user_id
    AND to_tsvector('french',
      coalesce(q.client_name, '') || ' ' ||
      coalesce(q.title, '') || ' ' ||
      coalesce(q.notes, '') || ' ' ||
      coalesce(q.quote_number, '')
    ) @@ plainto_tsquery('french', p_search_query)
  ORDER BY rank DESC, q.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for dashboard stats (optimized)
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  total_quotes BIGINT,
  draft_count BIGINT,
  sent_count BIGINT,
  accepted_count BIGINT,
  total_revenue NUMERIC,
  this_month_quotes BIGINT,
  this_month_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_quotes,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as draft_count,
    COUNT(*) FILTER (WHERE status = 'sent')::BIGINT as sent_count,
    COUNT(*) FILTER (WHERE status IN ('accepted', 'finalized'))::BIGINT as accepted_count,
    COALESCE(SUM(total) FILTER (WHERE status IN ('accepted', 'finalized')), 0) as total_revenue,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::BIGINT as this_month_quotes,
    COALESCE(SUM(total) FILTER (
      WHERE status IN ('accepted', 'finalized')
      AND created_at >= date_trunc('month', CURRENT_DATE)
    ), 0) as this_month_revenue
  FROM quotes
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION search_quotes TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats TO authenticated;

-- ===========================================
-- VACUUM AND ANALYZE
-- ===========================================
-- Run these commands periodically (e.g., via cron job):
-- VACUUM ANALYZE quotes;
-- VACUUM ANALYZE quote_items;
-- VACUUM ANALYZE audit_logs;
-- VACUUM ANALYZE api_request_logs;

-- ===========================================
-- STATISTICS UPDATE
-- ===========================================
-- Ensure statistics are up to date for query planner
ANALYZE quotes;
ANALYZE quote_items;
ANALYZE profiles;
ANALYZE subscriptions;
