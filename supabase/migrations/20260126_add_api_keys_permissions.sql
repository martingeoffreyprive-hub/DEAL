-- Migration: Add permissions column to api_keys if not exists
-- Date: 2026-01-26
-- Description: Adds the permissions JSONB column to api_keys table

-- Add permissions column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'api_keys' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE api_keys ADD COLUMN permissions JSONB DEFAULT '["widget:create_lead"]';
    END IF;
END $$;

-- Add rate_limit_remaining column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'api_keys' AND column_name = 'rate_limit_remaining'
    ) THEN
        ALTER TABLE api_keys ADD COLUMN rate_limit_remaining INTEGER DEFAULT 100;
    END IF;
END $$;

-- Add revoked_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'api_keys' AND column_name = 'revoked_at'
    ) THEN
        ALTER TABLE api_keys ADD COLUMN revoked_at TIMESTAMPTZ;
    END IF;
END $$;
