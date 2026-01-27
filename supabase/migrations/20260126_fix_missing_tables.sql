-- Migration: Fix missing tables and columns
-- Date: 2026-01-26
-- Description: Adds missing tables and columns for full functionality

-- =====================================================
-- 1. FIX PROFILES TABLE
-- =====================================================

-- Add full_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN full_name VARCHAR(255);
    END IF;
END $$;

-- Add email column if it doesn't exist (for display purposes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- =====================================================
-- 2. CREATE SUBSCRIPTIONS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL DEFAULT 'free',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can manage own subscription" ON subscriptions;

-- Create policy
CREATE POLICY "Users can manage own subscription" ON subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE QUOTE_COMMENTS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS quote_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quote_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if exist
DROP POLICY IF EXISTS "Users can view comments on own quotes" ON quote_comments;
DROP POLICY IF EXISTS "Users can create comments" ON quote_comments;
DROP POLICY IF EXISTS "Users can manage own comments" ON quote_comments;

-- Create policies
CREATE POLICY "Users can view comments on own quotes" ON quote_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM quotes
            WHERE quotes.id = quote_comments.quote_id
            AND quotes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create comments" ON quote_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own comments" ON quote_comments
    FOR ALL USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_quote_comments_quote ON quote_comments(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_comments_user ON quote_comments(user_id);

-- =====================================================
-- 4. CREATE USAGE_STATS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: "2026-01"
    quotes_created INTEGER DEFAULT 0,
    ai_requests INTEGER DEFAULT 0,
    pdf_exports INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own usage stats" ON usage_stats;
CREATE POLICY "Users can manage own usage stats" ON usage_stats
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 5. ENSURE PROFILES TABLE EXISTS WITH ALL COLUMNS
-- =====================================================

-- Make sure profiles table has all required columns
DO $$
BEGIN
    -- company_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
        ALTER TABLE profiles ADD COLUMN company_name VARCHAR(255);
    END IF;

    -- siret (TVA number)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'siret') THEN
        ALTER TABLE profiles ADD COLUMN siret VARCHAR(50);
    END IF;

    -- address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
    END IF;

    -- city
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
        ALTER TABLE profiles ADD COLUMN city VARCHAR(255);
    END IF;

    -- postal_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'postal_code') THEN
        ALTER TABLE profiles ADD COLUMN postal_code VARCHAR(20);
    END IF;

    -- phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(50);
    END IF;

    -- website
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
        ALTER TABLE profiles ADD COLUMN website VARCHAR(255);
    END IF;

    -- logo_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'logo_url') THEN
        ALTER TABLE profiles ADD COLUMN logo_url TEXT;
    END IF;

    -- legal_mentions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'legal_mentions') THEN
        ALTER TABLE profiles ADD COLUMN legal_mentions TEXT;
    END IF;

    -- default_sector
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'default_sector') THEN
        ALTER TABLE profiles ADD COLUMN default_sector VARCHAR(50) DEFAULT 'AUTRE';
    END IF;

    -- quote_prefix
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'quote_prefix') THEN
        ALTER TABLE profiles ADD COLUMN quote_prefix VARCHAR(20) DEFAULT 'DEV-';
    END IF;

    -- next_quote_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'next_quote_number') THEN
        ALTER TABLE profiles ADD COLUMN next_quote_number INTEGER DEFAULT 1;
    END IF;

    -- Banking info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'iban') THEN
        ALTER TABLE profiles ADD COLUMN iban VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bic') THEN
        ALTER TABLE profiles ADD COLUMN bic VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bank_name') THEN
        ALTER TABLE profiles ADD COLUMN bank_name VARCHAR(255);
    END IF;

    -- Onboarding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_step') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- 6. CREATE DEFAULT SUBSCRIPTION FOR EXISTING USERS
-- =====================================================

INSERT INTO subscriptions (user_id, plan_name, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT (user_id) DO NOTHING;
