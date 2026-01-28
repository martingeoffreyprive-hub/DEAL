-- ============================================
-- DEAL - Migration: Add locale column to quotes
-- ============================================
-- Epic 8 Story 8.7: Migration des devis existants vers nouvelle locale
--
-- This migration adds a locale column to store the locale used
-- when creating each quote. This preserves historical formatting
-- when users change their global locale.
--
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- Add locale column to quotes table
-- Default to 'fr-BE' for existing quotes
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'fr-BE';

-- Add comment for documentation
COMMENT ON COLUMN quotes.locale IS 'Locale code used when the quote was created (fr-BE, fr-FR, fr-CH). Preserves formatting for historical quotes.';

-- Create an index for potential locale-based queries
CREATE INDEX IF NOT EXISTS idx_quotes_locale ON quotes(locale);

-- Verification query (optional - run to check the change)
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'quotes' AND column_name = 'locale';
