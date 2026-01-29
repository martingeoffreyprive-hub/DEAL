/**
 * Security Audit Test Suite — Sprint 9
 * Stories: 1.1 (RLS), 1.2 (Rate Limiting), 1.3 (Security Headers),
 *          1.4 (Secrets), 1.5 (CORS)
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  isAllowedOrigin,
  getCORSHeaders,
  PERMISSIVE_CORS_ROUTES,
  RATE_LIMIT_EXCLUDED_ROUTES,
  getRateLimiterType,
} from '@/lib/cors';

// ============================================================================
// Story 1.1: RLS Policy Audit
// ============================================================================
describe('Story 1.1: RLS Policy Audit', () => {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');

  it('should have migration files accessible', () => {
    expect(fs.existsSync(migrationsDir)).toBe(true);
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    expect(files.length).toBeGreaterThan(0);
  });

  it('should have RLS enabled on all user-facing tables', () => {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const allSql = files.map(f => fs.readFileSync(path.join(migrationsDir, f), 'utf-8')).join('\n');

    // Critical user-facing tables that MUST have RLS
    const criticalTables = [
      'profiles',
      'quotes',
      'quote_items',
      'invoices',
      'invoice_items',
      'leads',
      'api_keys',
      'subscriptions',
      'workflows',
      'workflow_executions',
      'user_consents',
      'hitl_requests',
      'user_settings',
      'notifications',
      'audit_logs',
      'referrals',
      'token_transactions',
      'quote_comments',
      'usage_stats',
      'companies',
      'user_suppliers',
      'document_templates',
      'suppliers',
      'session_logs',
      'import_jobs',
      'embeddings',
      'performance_metrics',
      'template_purchases',
    ];

    for (const table of criticalTables) {
      const hasRLS = allSql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
        || allSql.includes(`ALTER TABLE IF EXISTS ${table} ENABLE ROW LEVEL SECURITY`);
      expect(hasRLS, `Table "${table}" should have RLS enabled`).toBe(true);
    }
  });

  it('should have CREATE POLICY for all user-isolation tables', () => {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const allSql = files.map(f => fs.readFileSync(path.join(migrationsDir, f), 'utf-8')).join('\n');

    // Tables that must have user-isolation policies
    const userTables = [
      'profiles',
      'quotes',
      'quote_items',
      'invoices',
      'invoice_items',
      'leads',
      'api_keys',
      'subscriptions',
      'workflows',
      'user_consents',
      'hitl_requests',
      'user_settings',
      'referrals',
      'token_transactions',
      'user_suppliers',
    ];

    for (const table of userTables) {
      const hasPolicy = allSql.includes(`CREATE POLICY`) && allSql.includes(`ON ${table}`);
      expect(hasPolicy, `Table "${table}" should have at least one RLS policy`).toBe(true);
    }
  });

  it('should NOT have RLS on system reference tables (vat_rates)', () => {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const allSql = files.map(f => fs.readFileSync(path.join(migrationsDir, f), 'utf-8')).join('\n');

    // vat_rates is a public reference table — no RLS needed
    const hasRLS = allSql.includes('ALTER TABLE vat_rates ENABLE ROW LEVEL SECURITY');
    expect(hasRLS).toBe(false);
  });

  it('should have processed_stripe_events with RLS but no user policies', () => {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    const allSql = files.map(f => fs.readFileSync(path.join(migrationsDir, f), 'utf-8')).join('\n');

    const hasRLS = allSql.includes('ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY');
    expect(hasRLS).toBe(true);

    // Should NOT have user-accessible policies (service role only)
    const hasUserPolicy = /CREATE POLICY.*ON processed_stripe_events.*auth\.uid\(\)/.test(allSql);
    expect(hasUserPolicy).toBe(false);
  });

  it('should have security hardening migration', () => {
    const hardening = path.join(migrationsDir, '20260129_security_hardening.sql');
    expect(fs.existsSync(hardening)).toBe(true);
  });
});

// ============================================================================
// Story 1.2: Rate Limiting Validation
// ============================================================================
describe('Story 1.2: Rate Limiting Validation', () => {
  it('should route AI endpoints to "ai" limiter', () => {
    expect(getRateLimiterType('/api/generate')).toBe('ai');
    expect(getRateLimiterType('/api/ai-assistant')).toBe('ai');
  });

  it('should route public API endpoints to "api" limiter', () => {
    expect(getRateLimiterType('/api/v1/quotes')).toBe('api');
    expect(getRateLimiterType('/api/v1/quotes/123')).toBe('api');
    expect(getRateLimiterType('/api/widget/quote-request')).toBe('api');
  });

  it('should route auth endpoints to "auth" limiter', () => {
    expect(getRateLimiterType('/api/auth/login')).toBe('auth');
    expect(getRateLimiterType('/api/auth/register')).toBe('auth');
  });

  it('should route general endpoints to "general" limiter', () => {
    expect(getRateLimiterType('/api/quotes')).toBe('general');
    expect(getRateLimiterType('/api/leads')).toBe('general');
    expect(getRateLimiterType('/api/invoices')).toBe('general');
  });

  it('should exclude Stripe webhooks and analytics from rate limiting', () => {
    expect(RATE_LIMIT_EXCLUDED_ROUTES).toContain('/api/stripe/webhook');
    expect(RATE_LIMIT_EXCLUDED_ROUTES).toContain('/api/analytics/vitals');
  });

  it('should have middleware rate limiter configuration aligned with lib', () => {
    // Verify the middleware.ts rate limiter config matches the lib
    const middlewareSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'middleware.ts'),
      'utf-8'
    );
    const libSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'rate-limit.ts'),
      'utf-8'
    );

    // Both should have 100 req/min for general
    expect(middlewareSrc).toContain('slidingWindow(100');
    expect(libSrc).toContain('slidingWindow(100, "1 m")');

    // Both should have 10 req/min for AI
    expect(middlewareSrc).toContain('slidingWindow(10');
    expect(libSrc).toContain('slidingWindow(10, "1 m")');

    // Both should have 5 req/15min for auth
    expect(middlewareSrc).toContain("slidingWindow(5, '15 m')");
    expect(libSrc).toContain('slidingWindow(5, "15 m")');
  });
});

// ============================================================================
// Story 1.3: Security Headers Verification
// ============================================================================
describe('Story 1.3: Security Headers Verification', () => {
  it('should have all required security headers in middleware', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'middleware.ts'),
      'utf-8'
    );

    expect(src).toContain("'X-Frame-Options': 'DENY'");
    expect(src).toContain("'X-Content-Type-Options': 'nosniff'");
    expect(src).toContain("'X-XSS-Protection': '1; mode=block'");
    expect(src).toContain("'Referrer-Policy': 'strict-origin-when-cross-origin'");
    expect(src).toContain("'Permissions-Policy':");
    expect(src).toContain("'Strict-Transport-Security':");
  });

  it('should have HSTS only in production', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'middleware.ts'),
      'utf-8'
    );

    // HSTS should be conditionally applied in production
    expect(src).toContain("process.env.NODE_ENV === 'production'");
    expect(src).toContain('max-age=31536000');
    expect(src).toContain('includeSubDomains');
  });

  it('should disable X-Powered-By header in next.config', () => {
    const config = fs.readFileSync(
      path.join(process.cwd(), 'next.config.mjs'),
      'utf-8'
    );

    expect(config).toContain('poweredByHeader: false');
  });

  it('should apply security headers to non-API routes', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'middleware.ts'),
      'utf-8'
    );

    // Security headers applied when NOT an API route
    expect(src).toContain('if (!isApiRoute)');
  });

  it('should prevent caching of API responses', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'middleware.ts'),
      'utf-8'
    );

    expect(src).toContain('no-store, no-cache, must-revalidate');
  });
});

// ============================================================================
// Story 1.4: Secrets Audit
// ============================================================================
describe('Story 1.4: Secrets Audit', () => {
  it('should have .env files in .gitignore', () => {
    const gitignore = fs.readFileSync(
      path.join(process.cwd(), '.gitignore'),
      'utf-8'
    );

    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('.env*.local');
  });

  it('should have .env.example with all required variables', () => {
    const envExample = fs.readFileSync(
      path.join(process.cwd(), '.env.example'),
      'utf-8'
    );

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'ANTHROPIC_API_KEY',
      'NEXT_PUBLIC_APP_URL',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN',
    ];

    for (const varName of requiredVars) {
      expect(envExample, `Missing ${varName} in .env.example`).toContain(varName);
    }
  });

  it('should NOT expose SUPABASE_SERVICE_ROLE_KEY in client code', () => {
    // Check that service role key is never used with NEXT_PUBLIC_ prefix
    const srcDir = path.join(process.cwd(), 'src');
    const badString = 'NEXT_PUBLIC_SUPABASE_SERVICE' + '_ROLE_KEY'; // Split to avoid self-match

    function checkDir(dir: string): void {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== '__tests__') {
          checkDir(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) && !fullPath.includes('__tests__')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          expect(content).not.toContain(badString);
        }
      }
    }

    checkDir(srcDir);
  });

  it('should only use service role key in server-side API routes', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const filesUsingServiceRole: string[] = [];

    function checkDir(dir: string): void {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== '__tests__') {
          checkDir(fullPath);
        } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) && !fullPath.includes('__tests__')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes('SUPABASE_SERVICE_ROLE_KEY')) {
            filesUsingServiceRole.push(fullPath.replace(process.cwd(), ''));
          }
        }
      }
    }

    checkDir(srcDir);

    // Every file using service role should be a server-side file
    // Normalize path separators for cross-platform compatibility
    for (const file of filesUsingServiceRole) {
      const normalized = file.replace(/\\/g, '/');
      const isServerSide = normalized.includes('api/') || normalized.includes('middleware') || normalized.includes('lib/supabase/server');
      expect(isServerSide, `${normalized} uses SERVICE_ROLE_KEY but is not server-side`).toBe(true);
    }
  });
});

// ============================================================================
// Story 1.5: CORS Configuration Hardening
// ============================================================================
describe('Story 1.5: CORS Configuration Hardening', () => {
  it('should have permissive CORS only for widget and analytics routes', () => {
    expect(PERMISSIVE_CORS_ROUTES).toContain('/api/widget/');
    expect(PERMISSIVE_CORS_ROUTES).toContain('/api/analytics/');
    expect(PERMISSIVE_CORS_ROUTES).toHaveLength(2);
  });

  it('should allow production origins', () => {
    expect(isAllowedOrigin('https://www.dealofficialapp.com')).toBe(true);
    expect(isAllowedOrigin('https://dealofficialapp.com')).toBe(true);
  });

  it('should allow Vercel preview deployments', () => {
    expect(isAllowedOrigin('https://deal-abc123.vercel.app')).toBe(true);
  });

  it('should reject unknown origins', () => {
    expect(isAllowedOrigin('https://evil.com')).toBe(false);
    expect(isAllowedOrigin('https://malicious-site.org')).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
  });

  it('should return wildcard CORS for permissive routes', () => {
    const headers = getCORSHeaders('https://any-origin.com', true);
    expect(headers).not.toBeNull();
    expect(headers!['Access-Control-Allow-Origin']).toBe('*');
    // Permissive routes should only allow GET, POST, OPTIONS
    expect(headers!['Access-Control-Allow-Methods']).toBe('GET, POST, OPTIONS');
  });

  it('should return origin-specific CORS for regular routes', () => {
    const headers = getCORSHeaders('https://dealofficialapp.com', false);
    expect(headers).not.toBeNull();
    expect(headers!['Access-Control-Allow-Origin']).toBe('https://dealofficialapp.com');
    expect(headers!['Access-Control-Allow-Credentials']).toBe('true');
  });

  it('should return null for disallowed origins on regular routes', () => {
    const headers = getCORSHeaders('https://evil.com', false);
    expect(headers).toBeNull();
  });

  it('should include X-API-Key in allowed headers for API routes', () => {
    const permissiveHeaders = getCORSHeaders(null, true);
    expect(permissiveHeaders!['Access-Control-Allow-Headers']).toContain('X-API-Key');

    const regularHeaders = getCORSHeaders('https://dealofficialapp.com', false);
    expect(regularHeaders!['Access-Control-Allow-Headers']).toContain('X-API-Key');
  });

  it('should handle OPTIONS preflight in middleware', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'middleware.ts'),
      'utf-8'
    );

    expect(src).toContain("request.method === 'OPTIONS'");
    expect(src).toContain('status: 204');
  });
});
