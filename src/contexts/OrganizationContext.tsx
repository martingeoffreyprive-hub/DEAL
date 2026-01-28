"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  type OrgRole,
  type Permission,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  canManageRole,
  getAssignableRoles,
  ROLE_INFO,
} from "@/lib/rbac";

const ORG_STORAGE_KEY = "deal_current_org";

// Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color?: string;
  siret?: string;
  vat_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  subscription_plan?: string;
  settings?: Record<string, unknown>;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
  user?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface OrganizationWithRole extends Organization {
  role: OrgRole;
  member_count: number;
}

interface OrganizationContextValue {
  // Current organization
  currentOrganization: OrganizationWithRole | null;
  isLoading: boolean;
  error: Error | null;

  // Organizations list
  organizations: OrganizationWithRole[];
  refreshOrganizations: () => Promise<void>;

  // Organization switching
  setCurrentOrganization: (org: OrganizationWithRole | null) => void;
  switchOrganization: (orgId: string) => Promise<void>;

  // Permission checks
  userRole: OrgRole | null;
  can: (permission: Permission) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canManage: (targetRole: OrgRole) => boolean;
  assignableRoles: OrgRole[];
  permissions: Permission[];

  // Members management
  members: OrganizationMember[];
  refreshMembers: () => Promise<void>;

  // Organization CRUD
  createOrganization: (
    name: string,
    slug: string,
    email?: string
  ) => Promise<string | null>;
  updateOrganization: (
    updates: Partial<Organization>
  ) => Promise<boolean>;

  // Invitation
  inviteMember: (email: string, role: OrgRole) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: OrgRole) => Promise<boolean>;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

// Safe localStorage helpers
function safeGetOrgId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ORG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeSaveOrgId(orgId: string | null): void {
  try {
    if (typeof window === "undefined") return;
    if (orgId) {
      localStorage.setItem(ORG_STORAGE_KEY, orgId);
    } else {
      localStorage.removeItem(ORG_STORAGE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrgState] =
    useState<OrganizationWithRole | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch user's organizations
  const refreshOrganizations = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_user_organizations");

      if (error) throw error;

      setOrganizations(data || []);
      return data || [];
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setError(err as Error);
      return [];
    }
  }, [supabase]);

  // Fetch organization members
  const refreshMembers = useCallback(async () => {
    if (!currentOrganization) {
      setMembers([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select(
          `
          *,
          user:user_id (
            email,
            raw_user_meta_data->full_name,
            raw_user_meta_data->avatar_url
          )
        `
        )
        .eq("organization_id", currentOrganization.id)
        .order("joined_at", { ascending: true });

      if (error) throw error;

      setMembers(data || []);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }, [supabase, currentOrganization]);

  // Initialize: load organizations and restore current org
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const orgs = await refreshOrganizations();

        // Try to restore saved organization
        const savedOrgId = safeGetOrgId();
        if (savedOrgId && orgs.length > 0) {
          const savedOrg = orgs.find((o: OrganizationWithRole) => o.id === savedOrgId);
          if (savedOrg) {
            setCurrentOrgState(savedOrg);
          } else if (orgs.length > 0) {
            // Fallback to first org
            setCurrentOrgState(orgs[0]);
          }
        } else if (orgs.length > 0) {
          setCurrentOrgState(orgs[0]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [refreshOrganizations]);

  // Fetch members when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refreshMembers();
    }
  }, [currentOrganization, refreshMembers]);

  // Set current organization
  const setCurrentOrganization = useCallback(
    (org: OrganizationWithRole | null) => {
      setCurrentOrgState(org);
      safeSaveOrgId(org?.id || null);
    },
    []
  );

  // Switch to a different organization
  const switchOrganization = useCallback(
    async (orgId: string) => {
      const org = organizations.find((o) => o.id === orgId);
      if (org) {
        setCurrentOrganization(org);
      } else {
        // Refresh organizations and try again
        const orgs = await refreshOrganizations();
        const freshOrg = orgs.find((o: OrganizationWithRole) => o.id === orgId);
        if (freshOrg) {
          setCurrentOrganization(freshOrg);
        }
      }
    },
    [organizations, refreshOrganizations, setCurrentOrganization]
  );

  // User's role in current organization
  const userRole = currentOrganization?.role || null;

  // Permission check functions
  const can = useCallback(
    (permission: Permission) => {
      if (!userRole) return false;
      return hasPermission(userRole, permission);
    },
    [userRole]
  );

  const canAll = useCallback(
    (permissions: Permission[]) => {
      if (!userRole) return false;
      return hasAllPermissions(userRole, permissions);
    },
    [userRole]
  );

  const canAny = useCallback(
    (permissions: Permission[]) => {
      if (!userRole) return false;
      return hasAnyPermission(userRole, permissions);
    },
    [userRole]
  );

  const canManage = useCallback(
    (targetRole: OrgRole) => {
      if (!userRole) return false;
      return canManageRole(userRole, targetRole);
    },
    [userRole]
  );

  // Get assignable roles and current permissions
  const assignableRoles = userRole ? getAssignableRoles(userRole) : [];
  const permissions = userRole ? getRolePermissions(userRole) : [];

  // Create organization
  const createOrganization = useCallback(
    async (name: string, slug: string, email?: string): Promise<string | null> => {
      try {
        const { data, error } = await supabase.rpc("create_organization", {
          p_name: name,
          p_slug: slug,
          p_email: email || null,
        });

        if (error) throw error;

        // Refresh organizations list
        await refreshOrganizations();

        return data;
      } catch (err) {
        console.error("Failed to create organization:", err);
        return null;
      }
    },
    [supabase, refreshOrganizations]
  );

  // Update organization
  const updateOrganization = useCallback(
    async (updates: Partial<Organization>): Promise<boolean> => {
      if (!currentOrganization) return false;

      try {
        const { error } = await supabase
          .from("organizations")
          .update(updates)
          .eq("id", currentOrganization.id);

        if (error) throw error;

        // Update local state
        setCurrentOrgState((prev) =>
          prev ? { ...prev, ...updates } : null
        );

        return true;
      } catch (err) {
        console.error("Failed to update organization:", err);
        return false;
      }
    },
    [supabase, currentOrganization]
  );

  // Invite member
  const inviteMember = useCallback(
    async (email: string, role: OrgRole): Promise<boolean> => {
      if (!currentOrganization) return false;

      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return false;

        const { error } = await supabase.from("organization_invitations").insert({
          organization_id: currentOrganization.id,
          email,
          role,
          invited_by: user.user.id,
        });

        if (error) throw error;

        // TODO: Send invitation email via edge function

        return true;
      } catch (err) {
        console.error("Failed to invite member:", err);
        return false;
      }
    },
    [supabase, currentOrganization]
  );

  // Remove member
  const removeMember = useCallback(
    async (memberId: string): Promise<boolean> => {
      if (!currentOrganization) return false;

      try {
        const { error } = await supabase
          .from("organization_members")
          .delete()
          .eq("id", memberId)
          .eq("organization_id", currentOrganization.id);

        if (error) throw error;

        await refreshMembers();
        return true;
      } catch (err) {
        console.error("Failed to remove member:", err);
        return false;
      }
    },
    [supabase, currentOrganization, refreshMembers]
  );

  // Update member role
  const updateMemberRole = useCallback(
    async (memberId: string, role: OrgRole): Promise<boolean> => {
      if (!currentOrganization) return false;

      try {
        const { error } = await supabase
          .from("organization_members")
          .update({ role })
          .eq("id", memberId)
          .eq("organization_id", currentOrganization.id);

        if (error) throw error;

        await refreshMembers();
        return true;
      } catch (err) {
        console.error("Failed to update member role:", err);
        return false;
      }
    },
    [supabase, currentOrganization, refreshMembers]
  );

  const value: OrganizationContextValue = {
    currentOrganization,
    isLoading,
    error,
    organizations,
    refreshOrganizations,
    setCurrentOrganization,
    switchOrganization,
    userRole,
    can,
    canAll,
    canAny,
    canManage,
    assignableRoles,
    permissions,
    members,
    refreshMembers,
    createOrganization,
    updateOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
}

// Convenience hook for permission checks
export function usePermission(permission: Permission): boolean {
  const { can } = useOrganization();
  return can(permission);
}

// Hook for checking multiple permissions
export function usePermissions(permissions: Permission[]): {
  hasAll: boolean;
  hasAny: boolean;
  check: (p: Permission) => boolean;
} {
  const { can, canAll, canAny } = useOrganization();

  return {
    hasAll: canAll(permissions),
    hasAny: canAny(permissions),
    check: can,
  };
}

// Re-export ROLE_INFO for convenience
export { ROLE_INFO };
