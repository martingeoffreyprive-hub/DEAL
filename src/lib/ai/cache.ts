/**
 * AI Response Cache
 * Caches AI responses to reduce costs by 60%+ and improve response times
 *
 * Uses Redis for distributed caching with configurable TTL
 */

import { createHash } from "crypto";

// We use Upstash Redis (same as rate limiting) for serverless compatibility
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Cache is enabled only if Redis is configured
const isCacheEnabled = !!redis;

// Default TTL: 1 hour (in seconds)
const DEFAULT_TTL = 60 * 60;

// Cache key prefix
const CACHE_PREFIX = "ai_cache:";

/**
 * Generate a cache key from the prompt and parameters
 * Uses SHA-256 hash for consistent, compact keys
 */
export function generateCacheKey(
  action: string,
  prompt: string,
  params?: Record<string, unknown>
): string {
  const payload = JSON.stringify({
    action,
    prompt: prompt.trim(),
    params: params || {},
  });

  const hash = createHash("sha256").update(payload).digest("hex");

  return `${CACHE_PREFIX}${action}:${hash}`;
}

/**
 * Get cached AI response
 * @returns Cached response or null if not found/expired
 */
export async function getCachedResponse(
  cacheKey: string
): Promise<string | null> {
  if (!isCacheEnabled) {
    return null;
  }

  try {
    const cached = await redis!.get<string>(cacheKey);
    return cached;
  } catch (error) {
    console.warn("AI cache get error:", error);
    return null;
  }
}

/**
 * Store AI response in cache
 * @param cacheKey - The cache key
 * @param response - The AI response to cache
 * @param ttl - Time-to-live in seconds (default: 1 hour)
 */
export async function setCachedResponse(
  cacheKey: string,
  response: string,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  if (!isCacheEnabled) {
    return;
  }

  try {
    await redis!.setex(cacheKey, ttl, response);
  } catch (error) {
    console.warn("AI cache set error:", error);
  }
}

/**
 * Delete a cached response
 */
export async function deleteCachedResponse(cacheKey: string): Promise<void> {
  if (!isCacheEnabled) {
    return;
  }

  try {
    await redis!.del(cacheKey);
  } catch (error) {
    console.warn("AI cache delete error:", error);
  }
}

/**
 * Clear all AI cache entries (admin function)
 * Use with caution - this clears all cached AI responses
 */
export async function clearAICache(): Promise<number> {
  if (!isCacheEnabled) {
    return 0;
  }

  try {
    // Get all keys with our prefix
    const keys = await redis!.keys(`${CACHE_PREFIX}*`);

    if (keys.length === 0) {
      return 0;
    }

    // Delete all keys
    await redis!.del(...keys);

    return keys.length;
  } catch (error) {
    console.warn("AI cache clear error:", error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  enabled: boolean;
  keyCount: number;
}> {
  if (!isCacheEnabled) {
    return { enabled: false, keyCount: 0 };
  }

  try {
    const keys = await redis!.keys(`${CACHE_PREFIX}*`);
    return { enabled: true, keyCount: keys.length };
  } catch (error) {
    console.warn("AI cache stats error:", error);
    return { enabled: true, keyCount: 0 };
  }
}

// TTL configurations for different action types
export const ACTION_TTL: Record<string, number> = {
  // Audit results can be cached longer (2 hours)
  audit: 60 * 60 * 2,

  // Price optimization - cache 1 hour
  optimize: 60 * 60,

  // Email generation - cache 30 minutes (more personalized)
  email: 60 * 30,

  // Materials list - cache 2 hours (stable data)
  materials: 60 * 60 * 2,

  // Planning - cache 2 hours (stable estimates)
  planning: 60 * 60 * 2,

  // Description improvements - cache 1 hour
  improve: 60 * 60,

  // Suggestions - cache 1 hour
  suggest: 60 * 60,

  // Default TTL for unknown actions
  default: DEFAULT_TTL,
};

/**
 * Get TTL for a specific action type
 */
export function getTTLForAction(action: string): number {
  return ACTION_TTL[action] || ACTION_TTL.default;
}

/**
 * High-level cache wrapper for AI requests
 * Handles cache key generation, retrieval, and storage
 */
export async function withAICache<T extends string>(
  action: string,
  prompt: string,
  params: Record<string, unknown>,
  fetchFn: () => Promise<T>
): Promise<{ result: T; cached: boolean }> {
  const cacheKey = generateCacheKey(action, prompt, params);
  const ttl = getTTLForAction(action);

  // Try to get from cache
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    return { result: cached as T, cached: true };
  }

  // Cache miss - fetch from AI
  const result = await fetchFn();

  // Store in cache (non-blocking)
  setCachedResponse(cacheKey, result, ttl).catch(() => {
    // Ignore cache storage errors
  });

  return { result, cached: false };
}

/**
 * Check if caching is available
 */
export function isCachingEnabled(): boolean {
  return isCacheEnabled;
}
