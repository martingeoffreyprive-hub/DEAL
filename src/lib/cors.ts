/**
 * CORS Configuration for DEAL API
 * Implements strict origin validation for production security
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS: string[] = [
  'https://www.dealofficialapp.com',
  'https://dealofficialapp.com',
];

// Add development origins
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000');
  ALLOWED_ORIGINS.push('http://127.0.0.1:3000');
}

// Add Vercel preview URL if available
if (process.env.VERCEL_URL) {
  ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_URL}`);
}

// Add custom app URL if different from defaults
if (process.env.NEXT_PUBLIC_APP_URL) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!ALLOWED_ORIGINS.includes(appUrl)) {
    ALLOWED_ORIGINS.push(appUrl);
  }
}

/**
 * Check if an origin is allowed
 * @param origin - The origin header from the request
 * @returns true if the origin is allowed
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  // Check exact match
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Allow Vercel preview deployments (*.vercel.app)
  if (origin.endsWith('.vercel.app')) {
    return true;
  }

  return false;
}

/**
 * Routes that should have permissive CORS (public APIs)
 * These routes validate access via API keys instead of CORS
 */
export const PERMISSIVE_CORS_ROUTES = [
  '/api/widget/',      // Widget embedded on client sites
  '/api/analytics/',   // Web vitals reporting
];

/**
 * Routes excluded from rate limiting
 */
export const RATE_LIMIT_EXCLUDED_ROUTES = [
  '/api/stripe/webhook',  // Stripe webhooks have their own validation
  '/api/analytics/vitals', // High-frequency analytics
];

/**
 * Get CORS headers for a request
 * @param origin - The origin header from the request
 * @param isPermissive - Whether to use permissive CORS (for public APIs)
 * @returns CORS headers object or null if origin not allowed
 */
export function getCORSHeaders(origin: string | null, isPermissive: boolean = false): Record<string, string> | null {
  // Permissive routes allow all origins (validated by API key)
  if (isPermissive) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Access-Control-Max-Age': '86400',
    };
  }

  // For regular API routes, validate origin
  if (!isAllowedOrigin(origin)) {
    return null;
  }

  return {
    'Access-Control-Allow-Origin': origin!,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Determine rate limiter type based on route
 */
export type RateLimiterType = 'general' | 'ai' | 'auth' | 'api';

export function getRateLimiterType(pathname: string): RateLimiterType {
  // AI routes - most restrictive
  if (pathname.startsWith('/api/generate') || pathname.startsWith('/api/ai-assistant')) {
    return 'ai';
  }

  // Public API routes
  if (pathname.startsWith('/api/v1/') || pathname.startsWith('/api/widget/')) {
    return 'api';
  }

  // Auth routes
  if (pathname.startsWith('/api/auth/')) {
    return 'auth';
  }

  // Default
  return 'general';
}
