-- Performance Metrics Table for Web Vitals Tracking
-- Stores Core Web Vitals data for performance monitoring

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL CHECK (metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP')),
  metric_value NUMERIC NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  url TEXT NOT NULL,
  user_agent TEXT,
  connection_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by metric and time
CREATE INDEX IF NOT EXISTS idx_performance_metrics_query
ON performance_metrics(metric_name, created_at DESC);

-- Index for URL-based analysis
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url
ON performance_metrics(url, metric_name, created_at DESC);

-- Partition by month for efficient storage (optional, uncomment if needed)
-- Note: Requires PostgreSQL 10+
-- CREATE TABLE performance_metrics_partitioned (
--   LIKE performance_metrics INCLUDING ALL
-- ) PARTITION BY RANGE (created_at);

-- Function to get performance summary
CREATE OR REPLACE FUNCTION get_performance_summary(
  p_days INT DEFAULT 7,
  p_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  metric_name TEXT,
  avg_value NUMERIC,
  p75_value NUMERIC,
  p90_value NUMERIC,
  good_percent NUMERIC,
  needs_improvement_percent NUMERIC,
  poor_percent NUMERIC,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.metric_name,
    ROUND(AVG(pm.metric_value)::NUMERIC, 2) AS avg_value,
    ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pm.metric_value)::NUMERIC, 2) AS p75_value,
    ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY pm.metric_value)::NUMERIC, 2) AS p90_value,
    ROUND((COUNT(*) FILTER (WHERE pm.rating = 'good')::NUMERIC / COUNT(*)::NUMERIC * 100), 2) AS good_percent,
    ROUND((COUNT(*) FILTER (WHERE pm.rating = 'needs-improvement')::NUMERIC / COUNT(*)::NUMERIC * 100), 2) AS needs_improvement_percent,
    ROUND((COUNT(*) FILTER (WHERE pm.rating = 'poor')::NUMERIC / COUNT(*)::NUMERIC * 100), 2) AS poor_percent,
    COUNT(*)::BIGINT AS total_count
  FROM performance_metrics pm
  WHERE pm.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND (p_url IS NULL OR pm.url = p_url)
  GROUP BY pm.metric_name
  ORDER BY pm.metric_name;
END;
$$;

-- Auto-cleanup old metrics (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT ON performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_performance_summary TO authenticated;

-- RLS Policy - anyone can insert (metrics are anonymous)
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view performance metrics"
  ON performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
