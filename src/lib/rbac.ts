/**
 * Role-Based Access Control (RBAC) System
 * Enterprise-grade permission management for multi-organization support
 */

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export type Permission =
  // Quote permissions
  | "quote:create"
  | "quote:read"
  | "quote:update"
  | "quote:delete"
  | "quote:export"
  | "quote:send"
  | "quote:approve"
  // Team permissions
  | "team:view"
  | "team:invite"
  | "team:manage"
  | "team:remove"
  // Organization permissions
  | "org:view"
  | "org:update"
  | "org:billing"
  | "org:delete"
  // Settings permissions
  | "settings:view"
  | "settings:update"
  // API permissions
  | "api:view"
  | "api:create"
  | "api:manage"
  // Analytics permissions
  | "analytics:view"
  | "analytics:export"
  // Audit permissions
  | "audit:view";

/**
 * Role hierarchy: owner > admin > member > viewer
 * Each role inherits permissions from roles below it
 */
const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

/**
 * Permission definitions by role
 * Higher roles automatically get all permissions of lower roles
 */
const ROLE_PERMISSIONS: Record<OrgRole, Permission[]> = {
  viewer: [
    "quote:read",
    "team:view",
    "org:view",
    "settings:view",
  ],
  member: [
    // Viewer permissions inherited
    "quote:create",
    "quote:update",
    "quote:export",
    "quote:send",
    "analytics:view",
  ],
  admin: [
    // Member permissions inherited
    "quote:delete",
    "quote:approve",
    "team:invite",
    "team:manage",
    "team:remove",
    "org:update",
    "settings:update",
    "api:view",
    "api:create",
    "analytics:export",
    "audit:view",
  ],
  owner: [
    // Admin permissions inherited
    "org:billing",
    "org:delete",
    "api:manage",
  ],
};

/**
 * Get all permissions for a role (including inherited permissions)
 */
export function getRolePermissions(role: OrgRole): Permission[] {
  const permissions: Permission[] = [];
  const roleLevel = ROLE_HIERARCHY[role];

  for (const [r, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level <= roleLevel) {
      permissions.push(...ROLE_PERMISSIONS[r as OrgRole]);
    }
  }

  return Array.from(new Set(permissions)); // Remove duplicates
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: OrgRole, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(role: OrgRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: OrgRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Compare two roles
 * Returns: positive if role1 > role2, negative if role1 < role2, 0 if equal
 */
export function compareRoles(role1: OrgRole, role2: OrgRole): number {
  return ROLE_HIERARCHY[role1] - ROLE_HIERARCHY[role2];
}

/**
 * Check if a role can manage another role
 * (e.g., admins can manage members but not other admins)
 */
export function canManageRole(managerRole: OrgRole, targetRole: OrgRole): boolean {
  return compareRoles(managerRole, targetRole) > 0;
}

/**
 * Get the minimum role required for a permission
 */
export function getMinRoleForPermission(permission: Permission): OrgRole {
  const roles: OrgRole[] = ["viewer", "member", "admin", "owner"];

  for (const role of roles) {
    if (ROLE_PERMISSIONS[role].includes(permission)) {
      return role;
    }
  }

  return "owner"; // Default to owner if not found
}

/**
 * Role display information
 */
export const ROLE_INFO: Record<
  OrgRole,
  { label: string; description: string; color: string }
> = {
  owner: {
    label: "Propriétaire",
    description: "Contrôle total, facturation, peut supprimer l'organisation",
    color: "bg-purple-100 text-purple-800",
  },
  admin: {
    label: "Administrateur",
    description: "Gérer les membres, paramètres, CRUD complet sur les ressources",
    color: "bg-blue-100 text-blue-800",
  },
  member: {
    label: "Membre",
    description: "Créer/modifier ses ressources, voir les ressources de l'équipe",
    color: "bg-green-100 text-green-800",
  },
  viewer: {
    label: "Lecteur",
    description: "Accès en lecture seule aux ressources de l'équipe",
    color: "bg-gray-100 text-gray-800",
  },
};

/**
 * Get available roles that a user can assign
 * (users can only assign roles lower than their own)
 */
export function getAssignableRoles(userRole: OrgRole): OrgRole[] {
  const roles: OrgRole[] = ["viewer", "member", "admin", "owner"];
  const userLevel = ROLE_HIERARCHY[userRole];

  return roles.filter((role) => ROLE_HIERARCHY[role] < userLevel);
}

/**
 * Permission groups for UI display
 */
export const PERMISSION_GROUPS = {
  devis: {
    label: "Devis",
    permissions: [
      { key: "quote:create", label: "Créer des devis" },
      { key: "quote:read", label: "Voir les devis" },
      { key: "quote:update", label: "Modifier les devis" },
      { key: "quote:delete", label: "Supprimer les devis" },
      { key: "quote:export", label: "Exporter les devis" },
      { key: "quote:send", label: "Envoyer les devis" },
      { key: "quote:approve", label: "Approuver les devis" },
    ],
  },
  equipe: {
    label: "Équipe",
    permissions: [
      { key: "team:view", label: "Voir l'équipe" },
      { key: "team:invite", label: "Inviter des membres" },
      { key: "team:manage", label: "Gérer les rôles" },
      { key: "team:remove", label: "Retirer des membres" },
    ],
  },
  organisation: {
    label: "Organisation",
    permissions: [
      { key: "org:view", label: "Voir l'organisation" },
      { key: "org:update", label: "Modifier l'organisation" },
      { key: "org:billing", label: "Gérer la facturation" },
      { key: "org:delete", label: "Supprimer l'organisation" },
    ],
  },
  api: {
    label: "API",
    permissions: [
      { key: "api:view", label: "Voir les clés API" },
      { key: "api:create", label: "Créer des clés API" },
      { key: "api:manage", label: "Gérer les clés API" },
    ],
  },
  analytics: {
    label: "Analytique",
    permissions: [
      { key: "analytics:view", label: "Voir les statistiques" },
      { key: "analytics:export", label: "Exporter les données" },
    ],
  },
};

/**
 * Type guard for OrgRole
 */
export function isValidRole(role: string): role is OrgRole {
  return ["owner", "admin", "member", "viewer"].includes(role);
}
