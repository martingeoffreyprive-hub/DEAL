-- Migration: Multi-Organization and Team System
-- Enterprise-grade multi-tenant architecture with RBAC

-- ===========================================
-- ENUMS
-- ===========================================

-- Organization member roles
DO $$ BEGIN
  CREATE TYPE org_role AS ENUM (
    'owner',    -- Full control, billing, can delete organization
    'admin',    -- Manage members, settings, full CRUD on all resources
    'member',   -- Create/edit own resources, view team resources
    'viewer'    -- Read-only access to team resources
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Invitation status
DO $$ BEGIN
  CREATE TYPE invitation_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'expired'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================
-- ORGANIZATIONS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',

  -- Business info
  siret TEXT,
  vat_number TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'BE',

  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,

  -- Billing
  stripe_customer_id TEXT UNIQUE,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- ===========================================
-- ORGANIZATION MEMBERS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role and permissions
  role org_role NOT NULL DEFAULT 'member',

  -- Metadata
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Unique constraint: one membership per user per org
  UNIQUE(organization_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);

-- ===========================================
-- ORGANIZATION INVITATIONS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Invitation details
  email TEXT NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),

  -- Status
  status invitation_status DEFAULT 'pending',

  -- Timestamps
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,

  -- Prevent duplicate pending invitations
  UNIQUE(organization_id, email, status)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_invitations_org ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON organization_invitations(token);

-- ===========================================
-- ADD ORGANIZATION REFERENCE TO QUOTES
-- ===========================================

-- Add organization_id to quotes table (optional, for team quotes)
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quotes_organization ON quotes(organization_id);

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: members can view their organizations
CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organizations: owners and admins can update
CREATE POLICY "Owners and admins can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organizations: authenticated users can create
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Organizations: only owners can delete
CREATE POLICY "Only owners can delete organizations"
  ON organizations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role = 'owner'
    )
  );

-- Organization members: members can view other members in their orgs
CREATE POLICY "Members can view organization members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Organization members: owners and admins can manage members
CREATE POLICY "Owners and admins can manage members"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_members.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update members"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can remove members"
  ON organization_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members AS om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
    -- Users can also leave organizations themselves
    OR organization_members.user_id = auth.uid()
  );

-- Invitations: admins can manage, invitees can view their own
CREATE POLICY "Admins can manage invitations"
  ON organization_invitations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_invitations.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view their pending invitations"
  ON organization_invitations FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  );

-- ===========================================
-- HELPER FUNCTIONS
-- ===========================================

-- Function to create an organization and add the creator as owner
CREATE OR REPLACE FUNCTION create_organization(
  p_name TEXT,
  p_slug TEXT,
  p_email TEXT DEFAULT NULL,
  p_siret TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Create the organization
  INSERT INTO organizations (name, slug, email, siret, created_by)
  VALUES (p_name, p_slug, p_email, p_siret, v_user_id)
  RETURNING id INTO v_org_id;

  -- Add creator as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'owner');

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific permission in organization
CREATE OR REPLACE FUNCTION has_org_permission(
  p_organization_id UUID,
  p_required_role org_role
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_role org_role;
BEGIN
  SELECT role INTO v_user_role
  FROM organization_members
  WHERE organization_id = p_organization_id
  AND user_id = auth.uid();

  IF v_user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Role hierarchy: owner > admin > member > viewer
  RETURN CASE v_user_role
    WHEN 'owner' THEN TRUE
    WHEN 'admin' THEN p_required_role IN ('admin', 'member', 'viewer')
    WHEN 'member' THEN p_required_role IN ('member', 'viewer')
    WHEN 'viewer' THEN p_required_role = 'viewer'
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION accept_invitation(p_token TEXT) RETURNS UUID AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID;
  v_member_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Find the invitation
  SELECT * INTO v_invitation
  FROM organization_invitations
  WHERE token = p_token
  AND status = 'pending'
  AND expires_at > now()
  AND email = (SELECT email FROM auth.users WHERE id = v_user_id);

  IF v_invitation IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Add user to organization
  INSERT INTO organization_members (organization_id, user_id, role, invited_by, invited_at)
  VALUES (v_invitation.organization_id, v_user_id, v_invitation.role, v_invitation.invited_by, v_invitation.created_at)
  RETURNING id INTO v_member_id;

  -- Update invitation status
  UPDATE organization_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = v_invitation.id;

  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
  role org_role,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    om.role,
    (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) AS member_count
  FROM organizations o
  INNER JOIN organization_members om ON om.organization_id = o.id
  WHERE om.user_id = auth.uid()
  ORDER BY om.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_organization TO authenticated;
GRANT EXECUTE ON FUNCTION has_org_permission TO authenticated;
GRANT EXECUTE ON FUNCTION accept_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organizations TO authenticated;

-- ===========================================
-- TRIGGERS
-- ===========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
