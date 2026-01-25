-- Migration: Create processed_stripe_events table for idempotency
-- This table tracks Stripe webhook events to prevent replay attacks

CREATE TABLE IF NOT EXISTS processed_stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by event_id
CREATE INDEX IF NOT EXISTS idx_processed_stripe_events_event_id
  ON processed_stripe_events(event_id);

-- Clean up old events (optional: events older than 30 days)
-- Can be run periodically as a cron job
-- DELETE FROM processed_stripe_events WHERE processed_at < NOW() - INTERVAL '30 days';

-- RLS: Only service role can access this table (webhook handler)
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;

-- No policies needed - service role bypasses RLS
