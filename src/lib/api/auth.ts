/**
 * API Key Authentication System
 * Enterprise-grade API authentication for public API v1
 */

import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitedResponse, getClientIP } from "@/lib/rate-limit";

// API Key prefix for identification
const API_KEY_PREFIX = "qv_live_";
const API_KEY_LENGTH = 32;

export type ApiScope =
  | "quotes:read"
  | "quotes:write"
  | "quotes:delete"
  | "profile:read"
  | "profile:write"
  | "analytics:read"
  | "team:read"
  | "team:write";

export interface ApiKeyInfo {
  userId: string;
  organizationId: string | null;
  scopes: ApiScope[];
  rateLimit: number;
  keyId?: string;
}

export interface ApiAuthResult {
  authenticated: boolean;
  error?: string;
  statusCode?: number;
  keyInfo?: ApiKeyInfo;
}

/**
 * Generate a new API key
 * Returns the raw key (only shown once) and the hash for storage
 */
export function generateApiKey(): { rawKey: string; keyPrefix: string; keyHash: string } {
  const randomPart = randomBytes(API_KEY_LENGTH).toString("hex");
  const rawKey = `${API_KEY_PREFIX}${randomPart}`;
  const keyPrefix = rawKey.substring(0, 16); // qv_live_xxxxxxxx
  const keyHash = hashApiKey(rawKey);

  return { rawKey, keyPrefix, keyHash };
}

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Extract API key from request
 * Supports: Authorization: Bearer <key> or X-API-Key: <key>
 */
export function extractApiKey(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try X-API-Key header
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}

/**
 * Authenticate API request
 * Verifies API key and checks rate limits
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<ApiAuthResult> {
  const startTime = Date.now();

  // Extract API key
  const rawKey = extractApiKey(request);
  if (!rawKey) {
    return {
      authenticated: false,
      error: "API key required. Use Authorization: Bearer <key> or X-API-Key header.",
      statusCode: 401,
    };
  }

  // Validate key format
  if (!rawKey.startsWith(API_KEY_PREFIX)) {
    return {
      authenticated: false,
      error: "Invalid API key format",
      statusCode: 401,
    };
  }

  // Hash the key for lookup
  const keyHash = hashApiKey(rawKey);

  // Verify key in database
  const supabase = await createClient();
  const { data: keyData, error: keyError } = await supabase.rpc("verify_api_key", {
    p_key_hash: keyHash,
  });

  if (keyError || !keyData || keyData.length === 0) {
    return {
      authenticated: false,
      error: "Invalid or expired API key",
      statusCode: 401,
    };
  }

  const keyInfo: ApiKeyInfo = {
    userId: keyData[0].user_id,
    organizationId: keyData[0].organization_id,
    scopes: keyData[0].scopes || [],
    rateLimit: keyData[0].rate_limit || 100,
  };

  // Check rate limit
  const rateLimitResult = await checkRateLimit(`api:${keyInfo.userId}`, "api");
  if (!rateLimitResult.success) {
    return {
      authenticated: false,
      error: "Rate limit exceeded",
      statusCode: 429,
    };
  }

  return {
    authenticated: true,
    keyInfo,
  };
}

/**
 * Check if API key has required scope
 */
export function hasScope(keyInfo: ApiKeyInfo, requiredScope: ApiScope): boolean {
  return keyInfo.scopes.includes(requiredScope);
}

/**
 * Check if API key has any of the required scopes
 */
export function hasAnyScope(keyInfo: ApiKeyInfo, requiredScopes: ApiScope[]): boolean {
  return requiredScopes.some((scope) => keyInfo.scopes.includes(scope));
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "UNAUTHORIZED",
        message,
      },
    },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: "FORBIDDEN",
        message,
      },
    },
    { status: 403 }
  );
}

/**
 * Create API error response
 */
export function apiErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

/**
 * Create API success response
 */
export function apiSuccessResponse<T>(
  data: T,
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  }
): NextResponse {
  return NextResponse.json({
    data,
    ...(meta && { meta }),
  });
}

/**
 * Log API request (call after handling)
 */
export async function logApiRequest(
  request: NextRequest,
  keyInfo: ApiKeyInfo | null,
  statusCode: number,
  startTime: number,
  error?: string
): Promise<void> {
  try {
    const supabase = await createClient();
    const responseTime = Date.now() - startTime;

    await supabase.rpc("log_api_request", {
      p_api_key_id: null, // We don't have the key ID easily available
      p_user_id: keyInfo?.userId || null,
      p_method: request.method,
      p_path: new URL(request.url).pathname,
      p_status_code: statusCode,
      p_response_time_ms: responseTime,
      p_ip_address: getClientIP(request),
      p_user_agent: request.headers.get("user-agent"),
      p_error_message: error || null,
    });
  } catch (e) {
    // Don't fail request if logging fails
    console.warn("Failed to log API request:", e);
  }
}

/**
 * API request wrapper with authentication
 */
export async function withApiAuth(
  request: NextRequest,
  requiredScopes: ApiScope[],
  handler: (keyInfo: ApiKeyInfo) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();

  // Authenticate
  const authResult = await authenticateApiRequest(request);

  if (!authResult.authenticated || !authResult.keyInfo) {
    const response = apiErrorResponse(
      "UNAUTHORIZED",
      authResult.error || "Authentication failed",
      authResult.statusCode || 401
    );
    await logApiRequest(request, null, authResult.statusCode || 401, startTime, authResult.error);
    return response;
  }

  // Check scopes
  if (requiredScopes.length > 0 && !hasAnyScope(authResult.keyInfo, requiredScopes)) {
    const response = forbiddenResponse(
      `Insufficient permissions. Required scopes: ${requiredScopes.join(", ")}`
    );
    await logApiRequest(request, authResult.keyInfo, 403, startTime, "Insufficient scopes");
    return response;
  }

  // Execute handler
  try {
    const response = await handler(authResult.keyInfo);
    await logApiRequest(request, authResult.keyInfo, response.status, startTime);
    return response;
  } catch (error: any) {
    const response = apiErrorResponse(
      "INTERNAL_ERROR",
      "An internal error occurred",
      500
    );
    await logApiRequest(request, authResult.keyInfo, 500, startTime, error.message);
    return response;
  }
}
