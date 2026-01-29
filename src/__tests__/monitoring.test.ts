/**
 * Sprint 14: Monitoring & Observability — Epic 6 Tests
 * Stories: 6.1 (Error Tracking), 6.2 (AI Cost), 6.3 (Uptime), 6.4 (Analytics)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 6.1: Error Tracking & Monitoring
// ============================================================================
describe('Story 6.1: Error Tracking & Monitoring', () => {
  let monitoringSrc: string;
  let errorPageSrc: string;

  beforeAll(() => {
    monitoringSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'monitoring.ts'),
      'utf-8'
    );
    errorPageSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'error.tsx'),
      'utf-8'
    );
  });

  it('should have monitoring service module', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'monitoring.ts')
    )).toBe(true);
  });

  it('should have MonitoringService class', () => {
    expect(monitoringSrc).toContain('class MonitoringService');
    expect(monitoringSrc).toContain('captureException');
    expect(monitoringSrc).toContain('captureMessage');
    expect(monitoringSrc).toContain('addBreadcrumb');
  });

  it('should have init method with DSN config', () => {
    expect(monitoringSrc).toContain('init(');
    expect(monitoringSrc).toContain('dsn');
    expect(monitoringSrc).toContain('environment');
    expect(monitoringSrc).toContain('release');
  });

  it('should have performance span tracking', () => {
    expect(monitoringSrc).toContain('startSpan');
    expect(monitoringSrc).toContain('endSpan');
    expect(monitoringSrc).toContain('PerformanceSpan');
  });

  it('should detect slow operations', () => {
    expect(monitoringSrc).toContain('Slow operation');
    expect(monitoringSrc).toContain('3000');
  });

  it('should have useErrorTracking hook', () => {
    expect(monitoringSrc).toContain('useErrorTracking');
    expect(monitoringSrc).toContain('export function useErrorTracking');
  });

  it('should have withErrorTracking wrapper', () => {
    expect(monitoringSrc).toContain('withErrorTracking');
    expect(monitoringSrc).toContain('export function withErrorTracking');
  });

  it('should set up global error handlers', () => {
    expect(monitoringSrc).toContain("window.addEventListener");
    expect(monitoringSrc).toContain("unhandledrejection");
  });

  it('should have singleton export', () => {
    expect(monitoringSrc).toContain('export const monitoring');
  });

  it('should have global error boundary page', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'error.tsx')
    )).toBe(true);
  });

  it('should have error boundary with French localization', () => {
    expect(errorPageSrc).toContain("erreur");
    expect(errorPageSrc).toContain("Réessayer");
  });

  it('should show error digest code', () => {
    expect(errorPageSrc).toContain('digest');
  });

  it('should have reset and navigation actions', () => {
    expect(errorPageSrc).toContain('reset');
    expect(errorPageSrc).toContain('/dashboard');
  });
});

// ============================================================================
// Story 6.2: AI Cost Monitoring
// ============================================================================
describe('Story 6.2: AI Cost Monitoring', () => {
  it('should have AI cache module', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'ai', 'cache.ts')
    )).toBe(true);
  });

  it('should use Redis for AI response caching', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'ai', 'cache.ts'),
      'utf-8'
    );
    expect(src).toContain('Redis');
    expect(src).toContain('UPSTASH_REDIS');
    expect(src).toContain('CACHE_PREFIX');
  });

  it('should use SHA-256 for cache keys', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'ai', 'cache.ts'),
      'utf-8'
    );
    expect(src).toContain('sha256');
    expect(src).toContain('createHash');
  });

  it('should have configurable TTL', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'ai', 'cache.ts'),
      'utf-8'
    );
    expect(src).toContain('TTL');
  });

  it('should have AI assistant endpoint with rate limiting', () => {
    const aiRoute = path.join(process.cwd(), 'src', 'app', 'api', 'ai-assistant', 'route.ts');
    expect(fs.existsSync(aiRoute)).toBe(true);
    const src = fs.readFileSync(aiRoute, 'utf-8');
    expect(src).toContain('rate');
  });

  it('should track AI usage per user', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'ai-assistant', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('increment_ai_usage');
  });

  it('should have analytics tracking for AI generation', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'analytics.ts'),
      'utf-8'
    );
    expect(src).toContain('trackAIGeneration');
  });

  it('should have usage card showing plan quotas', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'usage-card.tsx')
    )).toBe(true);
  });
});

// ============================================================================
// Story 6.3: Uptime Monitoring
// ============================================================================
describe('Story 6.3: Uptime Monitoring', () => {
  it('should have health check endpoint', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts')
    )).toBe(true);
  });

  it('should check Supabase connectivity', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('checkSupabase');
    expect(src).toContain('NEXT_PUBLIC_SUPABASE_URL');
  });

  it('should check Redis connectivity', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('checkRedis');
    expect(src).toContain('UPSTASH_REDIS');
  });

  it('should return overall status (up/degraded/down)', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('"up"');
    expect(src).toContain('"degraded"');
    expect(src).toContain('"down"');
  });

  it('should measure latency for each check', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('latency');
    expect(src).toContain('Date.now()');
  });

  it('should include response metadata', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('timestamp');
    expect(src).toContain('version');
    expect(src).toContain('responseTime');
  });

  it('should set no-cache headers', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('no-cache');
  });

  it('should have Web Vitals collection endpoint', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'analytics', 'vitals', 'route.ts')
    )).toBe(true);
  });

  it('should collect Core Web Vitals metrics', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'analytics', 'vitals', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('VitalsPayload');
    expect(src).toContain('rating');
  });
});

// ============================================================================
// Story 6.4: Usage Analytics Dashboard
// ============================================================================
describe('Story 6.4: Usage Analytics Dashboard', () => {
  it('should have admin analytics page', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', '(admin)', 'admin', 'analytics', 'page.tsx')
    )).toBe(true);
  });

  it('should have user-facing analytics dashboard', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'analytics', 'page.tsx')
    )).toBe(true);
  });

  it('should have admin stats API', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'stats', 'route.ts')
    )).toBe(true);
  });

  it('should calculate MRR and ARR', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'stats', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('mrr');
    expect(src).toContain('arr');
    expect(src).toContain('MRR_PRICES');
  });

  it('should track subscription breakdown', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'stats', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('proSubscriptions');
    expect(src).toContain('businessSubscriptions');
    expect(src).toContain('corporateSubscriptions');
  });

  it('should have analytics service with event tracking', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'analytics.ts')
    )).toBe(true);
  });

  it('should have DEAL-specific tracking helpers', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'analytics.ts'),
      'utf-8'
    );
    expect(src).toContain('trackQuoteCreated');
    expect(src).toContain('trackSubscription');
    expect(src).toContain('trackAIGeneration');
    expect(src).toContain('trackOnboarding');
  });

  it('should have admin-only access on stats API', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'stats', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('admin');
    expect(src).toContain('403');
  });

  it('should use service role to bypass RLS in admin stats', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'stats', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('SERVICE_ROLE_KEY');
    expect(src).toContain('serviceClient');
  });
});
