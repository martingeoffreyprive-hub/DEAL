import { createClient } from "@/lib/supabase/server";

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "IMPORT"
  | "SEND"
  | "APPROVE"
  | "REJECT"
  | "API_CALL";

export type AuditResource =
  | "quote"
  | "quote_item"
  | "profile"
  | "subscription"
  | "user"
  | "organization"
  | "team_member"
  | "api_key"
  | "settings";

export interface AuditLogEntry {
  userId: string;
  userEmail?: string;
  action: AuditAction;
  resourceType: AuditResource;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  organizationId?: string;
}

/**
 * Log an audit entry to the database
 * This function is non-blocking and fails silently to not disrupt user operations
 */
export async function logAudit(entry: AuditLogEntry): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("create_audit_log", {
      p_user_id: entry.userId,
      p_user_email: entry.userEmail || null,
      p_action: entry.action,
      p_resource_type: entry.resourceType,
      p_resource_id: entry.resourceId || null,
      p_details: entry.details || {},
      p_ip_address: entry.ipAddress || null,
      p_user_agent: entry.userAgent || null,
      p_organization_id: entry.organizationId || null,
    });

    if (error) {
      console.warn("Audit log error:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Audit log failed:", error);
    return null;
  }
}

/**
 * Log a quote-related action
 */
export async function logQuoteAction(
  userId: string,
  action: AuditAction,
  quoteId: string,
  details?: Record<string, unknown>,
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: "quote",
    resourceId: quoteId,
    details,
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Log a profile-related action
 */
export async function logProfileAction(
  userId: string,
  action: AuditAction,
  details?: Record<string, unknown>,
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: "profile",
    resourceId: userId,
    details,
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Log an authentication action
 */
export async function logAuthAction(
  userId: string,
  action: "LOGIN" | "LOGOUT",
  details?: Record<string, unknown>,
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    action,
    resourceType: "user",
    resourceId: userId,
    details,
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Log an API call action
 */
export async function logApiCall(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  request?: Request
): Promise<void> {
  await logAudit({
    userId,
    action: "API_CALL",
    resourceType: "api_key",
    details: {
      endpoint,
      method,
      statusCode,
    },
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  });
}

/**
 * Helper to get client IP from request
 */
function getClientIP(request?: Request): string | undefined {
  if (!request) return undefined;

  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return undefined;
}

/**
 * Query audit logs for a user (for viewing own history)
 */
export async function getUserAuditLogs(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    action?: AuditAction;
    resourceType?: AuditResource;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{ data: unknown[] | null; error: Error | null }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (options.action) {
      query = query.eq("action", options.action);
    }

    if (options.resourceType) {
      query = query.eq("resource_type", options.resourceType);
    }

    if (options.startDate) {
      query = query.gte("created_at", options.startDate.toISOString());
    }

    if (options.endDate) {
      query = query.lte("created_at", options.endDate.toISOString());
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
