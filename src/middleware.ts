import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  isAllowedOrigin,
  getCORSHeaders,
  PERMISSIVE_CORS_ROUTES,
  RATE_LIMIT_EXCLUDED_ROUTES,
  getRateLimiterType,
} from '@/lib/cors';

// Enable Edge Runtime for faster cold starts and lower latency
export const runtime = 'experimental-edge';

/**
 * Rate Limiting Configuration
 * Uses Upstash Redis for Edge-compatible rate limiting
 */
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiters for different route types
const rateLimiters = redis ? {
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
    analytics: true,
    prefix: 'rl:general',
  }),
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min for AI
    analytics: true,
    prefix: 'rl:ai',
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 req/15min for auth
    analytics: true,
    prefix: 'rl:auth',
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min for public API
    analytics: true,
    prefix: 'rl:api',
  }),
} : null;

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

/**
 * Security Headers Configuration
 * Based on OWASP recommendations and best practices
 */
const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS filter in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (formerly Feature-Policy)
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',

  // Strict Transport Security (HSTS)
  // Only enable in production with HTTPS
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};

/**
 * Content Security Policy
 * Restrict resources to trusted sources
 * Note: CSP is disabled in development for hot reload to work
 */
function getCSPHeader(nonce: string): string | null {
  // Temporarily disabled CSP - Next.js inline scripts don't support nonce properly
  // TODO: Re-enable with proper Next.js CSP configuration
  return null;

  // In development, don't apply CSP to allow hot reload and debugging
  // if (process.env.NODE_ENV === 'development') {
  //   return null;
  // }

  // // Production CSP - strict
  // const directives = [
  //   "default-src 'self'",
  //   `script-src 'self' 'nonce-${nonce}' https://js.stripe.com 'unsafe-inline'`,
  //   "style-src 'self' 'unsafe-inline'",
  //   "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com",
  //   "font-src 'self' https://fonts.gstatic.com",
  //   `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.stripe.com ${
  //     process.env.UPSTASH_REDIS_REST_URL || ''
  //   }`,
  //   "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  //   "object-src 'none'",
  //   "base-uri 'self'",
  //   "form-action 'self'",
  //   "frame-ancestors 'none'",
  //   "upgrade-insecure-requests",
  // ];

  // return directives.join('; ');
}

/**
 * Generate a random nonce for CSP
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

export async function middleware(request: NextRequest) {
  // Generate nonce for CSP
  const nonce = generateNonce();

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Route protection configuration
  const pathname = request.nextUrl.pathname;

  // Protected routes (require authentication)
  const protectedPaths = ['/dashboard', '/quotes', '/profile', '/settings', '/analytics', '/team'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Admin routes (require admin role)
  const adminPaths = ['/admin'];
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  // Admin emails allowed to access admin panel
  const ADMIN_EMAILS = [
    "admin@dealofficialapp.com",
    "martin.geoffrey.prive@gmail.com",
  ];

  // Auth routes (login, register) - redirect if already logged in
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  // API routes - don't add security headers that might break them
  const isApiRoute = pathname.startsWith('/api/');

  // Redirect to login if not authenticated and accessing protected route
  if ((isProtectedPath || isAdminPath) && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin access - redirect non-admins to dashboard
  if (isAdminPath && user) {
    const userEmail = user.email?.toLowerCase() || "";
    const isAdminEmail = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail);

    if (!isAdminEmail) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect to dashboard if authenticated and accessing auth route
  if (isAuthPath && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo');
    return NextResponse.redirect(new URL(redirectTo || '/dashboard', request.url));
  }

  // Add security headers (skip for API routes to avoid breaking CORS)
  if (!isApiRoute) {
    // Add standard security headers
    for (const [header, value] of Object.entries(securityHeaders)) {
      if (value) {
        response.headers.set(header, value);
      }
    }

    // Add CSP header (only in production)
    const cspHeader = getCSPHeader(nonce);
    if (cspHeader) {
      response.headers.set('Content-Security-Policy', cspHeader);
      // Pass nonce to the app for inline scripts
      response.headers.set('x-nonce', nonce);
    }
  }

  // Add API-specific security headers and rate limiting
  if (isApiRoute) {
    const origin = request.headers.get('origin');

    // Check if this is a permissive CORS route (widget, analytics)
    const isPermissiveRoute = PERMISSIVE_CORS_ROUTES.some(route => pathname.startsWith(route));

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const corsHeaders = getCORSHeaders(origin, isPermissiveRoute);
      if (!corsHeaders && !isPermissiveRoute) {
        return new NextResponse('CORS not allowed', { status: 403 });
      }
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders || {},
      });
    }

    // Apply rate limiting (skip excluded routes)
    const isRateLimitExcluded = RATE_LIMIT_EXCLUDED_ROUTES.some(route => pathname.startsWith(route));

    if (!isRateLimitExcluded && rateLimiters) {
      const limiterType = getRateLimiterType(pathname);
      const limiter = rateLimiters[limiterType];

      // Use user ID if authenticated, otherwise IP
      const identifier = user?.id || getClientIP(request);

      try {
        const result = await limiter.limit(identifier);

        // Add rate limit headers
        response.headers.set('X-RateLimit-Limit', result.limit.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', result.reset.toString());

        if (!result.success) {
          return NextResponse.json(
            { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': result.limit.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': result.reset.toString(),
                'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
              },
            }
          );
        }
      } catch (error) {
        // Fail open: allow request if rate limiter fails
        console.error('Rate limit error:', error);
      }
    }

    // Apply CORS headers
    const corsHeaders = getCORSHeaders(origin, isPermissiveRoute);
    if (corsHeaders) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    } else if (!isPermissiveRoute && origin) {
      // Block requests from non-allowed origins (except permissive routes)
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    // Prevent caching of API responses with sensitive data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
