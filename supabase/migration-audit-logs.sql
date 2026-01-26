-- Migration: Create audit_logs table for security and compliance
-- This table tracks all user actions for auditing and compliance purposes

-- Create enum for audit action types
DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'IMPORT',
    'SEND',
    'APPROVE',
    'REJECT',
    'API_CALL'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create enum for resource types
DO $$ BEGIN
  CREATE TYPE audit_resource AS ENUM (
    'quote',
    'quote_item',
    'profile',
    'subscription',
    'user',
    'organization',
    'team_member',
    'api_key',
    'settings'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Main audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,

  -- What action was performed
  action audit_action NOT NULL,
  resource_type audit_resource NOT NULL,
  resource_id UUID,

  -- Additional context
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,

  -- Organization context (for multi-tenant)
  organization_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action_date
  ON audit_logs(user_id, action, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own audit logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Only service role can insert audit logs (from API routes)
-- No INSERT policy for authenticated users - they must go through API

-- Function to create audit log entries (called from application)
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_user_email TEXT,
  p_action audit_action,
  p_resource_type audit_resource,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    organization_id
  ) VALUES (
    p_user_id,
    p_user_email,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent,
    p_organization_id
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment AI usage (for tracking)
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_month_year TEXT;
BEGIN
  v_month_year := to_char(CURRENT_DATE, 'YYYY-MM');

  INSERT INTO usage_stats (user_id, month_year, ai_requests)
  VALUES (p_user_id, v_month_year, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    ai_requests = usage_stats.ai_requests + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for audit log summaries (admin dashboard)
CREATE OR REPLACE VIEW audit_log_summary AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  action,
  resource_type,
  COUNT(*) as count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), action, resource_type
ORDER BY date DESC, count DESC;

-- Grant execute permission to authenticated users for the audit function
GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION increment_ai_usage TO authenticated;

-- Cleanup old audit logs (run as cron job)
-- Keeps logs for 2 years for compliance, then deletes
-- DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '2 years';
