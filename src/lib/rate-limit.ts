import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Check if rate limiting is enabled (Redis is configured)
const isEnabled = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

/**
 * General rate limiter: 100 requests per minute per user/IP
 * Aligned with middleware.ts configuration
 */
export const generalRateLimiter = isEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:general",
    })
  : null;

/**
 * AI rate limiter: 10 requests per minute per user (restrictive for expensive operations)
 * Aligned with middleware.ts configuration
 */
export const aiRateLimiter = isEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "ratelimit:ai",
    })
  : null;

/**
 * Auth rate limiter: 5 attempts per 15 minutes per IP (for login/register)
 */
export const authRateLimiter = isEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : null;

/**
 * API rate limiter: 100 requests per minute per API key (for public API v1)
 */
export const apiRateLimiter = isEnabled
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    })
  : null;

export type RateLimiterType = "general" | "ai" | "auth" | "api";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - User ID, IP address, or API key
 * @param type - Type of rate limiter to use
 * @returns Rate limit result with success status
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimiterType = "general"
): Promise<RateLimitResult> {
  // If Redis is not configured, allow all requests (development mode)
  if (!isEnabled) {
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const rateLimiter = {
    general: generalRateLimiter,
    ai: aiRateLimiter,
    auth: authRateLimiter,
    api: apiRateLimiter,
  }[type];

  if (!rateLimiter) {
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await rateLimiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail open: allow request if rate limiter fails
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Create a rate-limited response with appropriate headers
 */
export function rateLimitedResponse(
  result: RateLimitResult,
  message = "Trop de requêtes. Veuillez réessayer plus tard."
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Helper to get client IP from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

/**
 * Add rate limit headers to an existing response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());
  return response;
}
