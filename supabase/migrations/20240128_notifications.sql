-- Notifications Table for In-App Notifications
-- Migration: 20240128_notifications.sql

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications"
      ON notifications
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications"
      ON notifications
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'System can insert notifications'
  ) THEN
    CREATE POLICY "System can insert notifications"
      ON notifications
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function to create notification when comment is added
CREATE OR REPLACE FUNCTION notify_quote_comment()
RETURNS TRIGGER AS $$
DECLARE
  quote_owner_id UUID;
  quote_number VARCHAR;
  commenter_name VARCHAR;
BEGIN
  -- Get the quote owner and number
  SELECT user_id, quote_number INTO quote_owner_id, quote_number
  FROM quotes
  WHERE id = NEW.quote_id;

  -- Get commenter name
  SELECT COALESCE(full_name, 'Un utilisateur') INTO commenter_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Don't notify if the commenter is the quote owner
  IF quote_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      quote_owner_id,
      'comment',
      'Nouveau commentaire',
      commenter_name || ' a commenté le devis ' || quote_number,
      '/quotes/' || NEW.quote_id
    );
  END IF;

  -- Also notify team members who have commented on this quote
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT DISTINCT qc.user_id, 'comment', 'Nouveau commentaire',
    commenter_name || ' a répondu sur le devis ' || quote_number,
    '/quotes/' || NEW.quote_id
  FROM quote_comments qc
  WHERE qc.quote_id = NEW.quote_id
    AND qc.user_id != NEW.user_id
    AND qc.user_id != quote_owner_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment notifications
DROP TRIGGER IF EXISTS on_quote_comment_notify ON quote_comments;
CREATE TRIGGER on_quote_comment_notify
  AFTER INSERT ON quote_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_comment();

-- Grant permissions
GRANT ALL ON notifications TO authenticated;
