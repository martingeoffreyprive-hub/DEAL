-- Quote Comments Table for Real-time Collaboration
-- Migration: 20240128_quote_comments.sql

-- Create quote_comments table
CREATE TABLE IF NOT EXISTS quote_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quote_comments_quote_id ON quote_comments(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_comments_user_id ON quote_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_comments_created_at ON quote_comments(quote_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE quote_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view comments on quotes they have access to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view comments on their quotes'
  ) THEN
    CREATE POLICY "Users can view comments on their quotes"
      ON quote_comments
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM quotes q
          WHERE q.id = quote_comments.quote_id
          AND (
            q.user_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM organization_members om
              WHERE om.user_id = auth.uid()
              AND om.organization_id = q.organization_id
            )
          )
        )
      );
  END IF;
END $$;

-- Users can insert comments on quotes they have access to
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can add comments on accessible quotes'
  ) THEN
    CREATE POLICY "Users can add comments on accessible quotes"
      ON quote_comments
      FOR INSERT
      WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
          SELECT 1 FROM quotes q
          WHERE q.id = quote_comments.quote_id
          AND (
            q.user_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM organization_members om
              WHERE om.user_id = auth.uid()
              AND om.organization_id = q.organization_id
            )
          )
        )
      );
  END IF;
END $$;

-- Users can delete their own comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own comments'
  ) THEN
    CREATE POLICY "Users can delete their own comments"
      ON quote_comments
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update their own comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own comments'
  ) THEN
    CREATE POLICY "Users can update their own comments"
      ON quote_comments
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_quote_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quote_comments_updated_at ON quote_comments;
CREATE TRIGGER quote_comments_updated_at
  BEFORE UPDATE ON quote_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_quote_comment_updated_at();

-- Enable Realtime for quote_comments
ALTER PUBLICATION supabase_realtime ADD TABLE quote_comments;

-- Grant permissions
GRANT ALL ON quote_comments TO authenticated;
GRANT SELECT ON quote_comments TO anon;
