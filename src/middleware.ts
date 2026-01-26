import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Enable Edge Runtime for faster cold starts and lower latency
export const runtime = 'experimental-edge';

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
  // In development, don't apply CSP to allow hot reload and debugging
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // Production CSP - strict
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com",
    "font-src 'self' https://fonts.gstatic.com",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.stripe.com ${
      process.env.UPSTASH_REDIS_REST_URL || ''
    }`,
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join('; ');
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

  // Add API-specific security headers
  if (isApiRoute) {
    // CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    response.headers.set('Access-Control-Max-Age', '86400');

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
