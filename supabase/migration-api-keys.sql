-- Migration: API Keys for Public API v1
-- Enterprise-grade API authentication system

-- ===========================================
-- API KEYS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Key details
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (qv_live_xxxxxxxx)
  key_hash TEXT NOT NULL, -- SHA-256 hash of full key

  -- Permissions
  scopes TEXT[] DEFAULT ARRAY['quotes:read', 'quotes:write'],

  -- Rate limits (per minute)
  rate_limit INTEGER DEFAULT 100,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  request_count BIGINT DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- ===========================================
-- API REQUEST LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request details
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- HTTP details
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,

  -- Performance
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,

  -- Context
  ip_address TEXT,
  user_agent TEXT,

  -- Error tracking
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_api_logs_key ON api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_path ON api_request_logs(path);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_request_logs(status_code);

-- Partition by month for performance (optional, requires pg_partman extension)
-- CREATE INDEX IF NOT EXISTS idx_api_logs_month ON api_request_logs(date_trunc('month', created_at));

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

-- API Keys: Users can manage their own keys
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- API Logs: Users can view logs for their keys
CREATE POLICY "Users can view their API request logs"
  ON api_request_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to verify API key and get user
CREATE OR REPLACE FUNCTION verify_api_key(p_key_hash TEXT)
RETURNS TABLE (
  user_id UUID,
  organization_id UUID,
  scopes TEXT[],
  rate_limit INTEGER
) AS $$
DECLARE
  v_key RECORD;
BEGIN
  -- Find active, non-expired key
  SELECT * INTO v_key
  FROM api_keys ak
  WHERE ak.key_hash = p_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > now());

  IF v_key IS NULL THEN
    RETURN;
  END IF;

  -- Update last used and request count
  UPDATE api_keys
  SET last_used_at = now(),
      request_count = request_count + 1
  WHERE id = v_key.id;

  -- Return key info
  RETURN QUERY SELECT v_key.user_id, v_key.organization_id, v_key.scopes, v_key.rate_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log API request
CREATE OR REPLACE FUNCTION log_api_request(
  p_api_key_id UUID,
  p_user_id UUID,
  p_method TEXT,
  p_path TEXT,
  p_status_code INTEGER,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO api_request_logs (
    api_key_id, user_id, method, path, status_code,
    response_time_ms, ip_address, user_agent, error_message
  ) VALUES (
    p_api_key_id, p_user_id, p_method, p_path, p_status_code,
    p_response_time_ms, p_ip_address, p_user_agent, p_error_message
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API usage stats
CREATE OR REPLACE FUNCTION get_api_usage_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  total_requests BIGINT,
  successful_requests BIGINT,
  failed_requests BIGINT,
  avg_response_time NUMERIC,
  requests_by_day JSON
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT
      date_trunc('day', created_at)::date as day,
      COUNT(*) as count
    FROM api_request_logs
    WHERE user_id = p_user_id
      AND created_at > now() - (p_days || ' days')::interval
    GROUP BY date_trunc('day', created_at)::date
    ORDER BY day
  )
  SELECT
    COUNT(*)::BIGINT as total_requests,
    COUNT(*) FILTER (WHERE status_code < 400)::BIGINT as successful_requests,
    COUNT(*) FILTER (WHERE status_code >= 400)::BIGINT as failed_requests,
    ROUND(AVG(response_time_ms)::numeric, 2) as avg_response_time,
    (SELECT json_agg(json_build_object('date', day, 'count', count)) FROM daily_stats) as requests_by_day
  FROM api_request_logs
  WHERE user_id = p_user_id
    AND created_at > now() - (p_days || ' days')::interval;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION verify_api_key TO authenticated;
GRANT EXECUTE ON FUNCTION log_api_request TO authenticated;
GRANT EXECUTE ON FUNCTION get_api_usage_stats TO authenticated;

-- ===========================================
-- CLEANUP OLD LOGS (run as cron job)
-- ===========================================
-- DELETE FROM api_request_logs WHERE created_at < NOW() - INTERVAL '90 days';
