-- ============================================================================
-- Migration: Security Hardening (Sprint 9, Story 1.1)
-- Date: 2026-01-29
-- Description: Fix missing RLS on template_purchases, add processed_stripe_events RLS
-- ============================================================================

-- 1. Enable RLS on template_purchases (was missing)
ALTER TABLE IF EXISTS template_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own template purchases"
  ON template_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own template purchases"
  ON template_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Create processed_stripe_events table if not exists (idempotency)
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on processed_stripe_events (service role only — no user policies)
ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies = only service role can access

-- 3. Ensure vat_rates is readable by anyone (system reference table)
-- RLS deliberately NOT enabled — public data

-- 4. Add missing policies for organizations if needed
DO $$
BEGIN
  -- organizations table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

    -- Owner can manage organization
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Org members can view organization') THEN
      CREATE POLICY "Org members can view organization"
        ON organizations FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Owner can manage organization') THEN
      CREATE POLICY "Owner can manage organization"
        ON organizations FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'owner'
          )
        );
    END IF;
  END IF;

  -- organization_members table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') THEN
    ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organization_members' AND policyname = 'Members can view own org members') THEN
      CREATE POLICY "Members can view own org members"
        ON organization_members FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
          )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organization_members' AND policyname = 'Admin can manage org members') THEN
      CREATE POLICY "Admin can manage org members"
        ON organization_members FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
          )
        );
    END IF;
  END IF;

  -- organization_invitations table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_invitations') THEN
    ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organization_invitations' AND policyname = 'Admin can manage invitations') THEN
      CREATE POLICY "Admin can manage invitations"
        ON organization_invitations FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_invitations.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
          )
        );
    END IF;
  END IF;
END $$;
