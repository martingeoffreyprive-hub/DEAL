/**
 * Sprint 15: Performance Optimization — Epic 7 Tests
 * Stories: 7.1 (Lighthouse), 7.2 (AI Latency), 7.3 (PDF Perf), 7.4 (DB Queries)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 7.1: Lighthouse Audit Fixes
// ============================================================================
describe('Story 7.1: Lighthouse Audit Fixes', () => {
  let nextConfig: string;
  let layoutSrc: string;

  beforeAll(() => {
    nextConfig = fs.readFileSync(
      path.join(process.cwd(), 'next.config.mjs'),
      'utf-8'
    );
    layoutSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'layout.tsx'),
      'utf-8'
    );
  });

  it('should have image optimization (AVIF, WebP)', () => {
    expect(nextConfig).toContain('avif');
    expect(nextConfig).toContain('webp');
  });

  it('should configure device and image sizes', () => {
    expect(nextConfig).toContain('deviceSizes');
    expect(nextConfig).toContain('imageSizes');
  });

  it('should have image cache TTL', () => {
    expect(nextConfig).toContain('minimumCacheTTL');
  });

  it('should enable compression', () => {
    expect(nextConfig).toContain('compress: true');
  });

  it('should disable X-Powered-By header', () => {
    expect(nextConfig).toContain('poweredByHeader: false');
  });

  it('should optimize package imports', () => {
    expect(nextConfig).toContain('optimizePackageImports');
    expect(nextConfig).toContain('lucide-react');
    expect(nextConfig).toContain('recharts');
  });

  it('should have font optimization with display swap', () => {
    expect(layoutSrc).toContain('swap');
  });

  it('should have SEO metadata', () => {
    expect(layoutSrc).toContain('metadata');
    expect(layoutSrc).toContain('openGraph');
  });

  it('should have loading skeletons for key pages', () => {
    const pages = ['dashboard', 'quotes', 'analytics'];
    for (const page of pages) {
      expect(fs.existsSync(
        path.join(process.cwd(), 'src', 'app', '(dashboard)', page, 'loading.tsx')
      )).toBe(true);
    }
  });

  it('should have skeleton UI component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'ui', 'skeleton.tsx')
    )).toBe(true);
  });

  it('should have lazy component wrapper', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'performance', 'lazy-component.tsx')
    )).toBe(true);
  });
});

// ============================================================================
// Story 7.2: AI Generation Latency
// ============================================================================
describe('Story 7.2: AI Generation Latency', () => {
  let cacheSrc: string;
  let aiRouteSrc: string;

  beforeAll(() => {
    cacheSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'ai', 'cache.ts'),
      'utf-8'
    );
    aiRouteSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'ai-assistant', 'route.ts'),
      'utf-8'
    );
  });

  it('should have Redis-based AI response cache', () => {
    expect(cacheSrc).toContain('Redis');
    expect(cacheSrc).toContain('UPSTASH_REDIS');
  });

  it('should use SHA-256 for cache keys', () => {
    expect(cacheSrc).toContain('sha256');
    expect(cacheSrc).toContain('createHash');
  });

  it('should have action-specific TTL', () => {
    expect(cacheSrc).toContain('TTL');
  });

  it('should have withAICache wrapper', () => {
    expect(cacheSrc).toContain('withAICache');
  });

  it('should have cache statistics', () => {
    expect(cacheSrc).toContain('getCacheStats');
  });

  it('should rate-limit AI endpoint', () => {
    expect(aiRouteSrc).toContain('rate');
  });

  it('should track AI usage per user', () => {
    expect(aiRouteSrc).toContain('increment_ai_usage');
  });

  it('should return cache status in response', () => {
    expect(aiRouteSrc).toContain('cached');
  });
});

// ============================================================================
// Story 7.3: PDF Generation Performance
// ============================================================================
describe('Story 7.3: PDF Generation Performance', () => {
  it('should have PDF cache module', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'cache.ts')
    )).toBe(true);
  });

  it('should use LRU cache with size limits', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'cache.ts'),
      'utf-8'
    );
    expect(src).toContain('10');  // 10MB limit
    expect(src).toContain('cache');
  });

  it('should generate content hash for invalidation', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'cache.ts'),
      'utf-8'
    );
    expect(src).toContain('ContentHash');
  });

  it('should have adaptive PDF density types', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'types.ts'),
      'utf-8'
    );
    expect(src).toContain('compact');
    expect(src).toContain('normal');
    expect(src).toContain('detailed');
    expect(src).toContain('PDFDensity');
  });

  it('should have EPC QR code generation for SEPA', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'epc-qr.ts')
    )).toBe(true);
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'epc-qr.ts'),
      'utf-8'
    );
    expect(src).toContain('generateEPCQRCode');
    expect(src).toContain('SEPA');
  });

  it('should have PDF API route', () => {
    const routeDir = path.join(process.cwd(), 'src', 'app', 'api', 'quotes');
    expect(fs.existsSync(routeDir)).toBe(true);
  });

  it('should have @react-pdf/renderer dependency', () => {
    const pkg = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'package.json'),
      'utf-8'
    ));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps['@react-pdf/renderer']).toBeDefined();
  });
});

// ============================================================================
// Story 7.4: Database Query Optimization
// ============================================================================
describe('Story 7.4: Database Query Optimization', () => {
  it('should have performance indexes migration', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240127_performance_indexes.sql')
    )).toBe(true);
  });

  it('should have composite indexes on quotes table', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240127_performance_indexes.sql'),
      'utf-8'
    );
    expect(sql).toContain('idx_quotes_user_pagination');
    expect(sql).toContain('idx_quotes_user_status');
    expect(sql).toContain('idx_quotes_analytics');
  });

  it('should have GIN full-text search indexes', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240127_performance_indexes.sql'),
      'utf-8'
    );
    expect(sql).toContain('gin');
    expect(sql).toContain('to_tsvector');
    expect(sql).toContain('french');
  });

  it('should have search_quotes RPC function', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240127_performance_indexes.sql'),
      'utf-8'
    );
    expect(sql).toContain('search_quotes');
    expect(sql).toContain('ts_rank');
  });

  it('should have get_user_quote_stats RPC function', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240127_performance_indexes.sql'),
      'utf-8'
    );
    expect(sql).toContain('get_user_quote_stats');
    expect(sql).toContain('total_quotes');
    expect(sql).toContain('acceptance_rate');
  });

  it('should have subscription and usage indexes', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240127_performance_indexes.sql'),
      'utf-8'
    );
    expect(sql).toContain('idx_subscriptions_user');
    expect(sql).toContain('idx_usage_stats_lookup');
  });

  it('should have performance metrics migration', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240129_performance_metrics.sql')
    )).toBe(true);
  });

  it('should have performance summary RPC with percentiles', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240129_performance_metrics.sql'),
      'utf-8'
    );
    expect(sql).toContain('get_performance_summary');
    expect(sql).toContain('p75');
  });

  it('should have auto-cleanup for old metrics', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'supabase', 'migrations', '20240129_performance_metrics.sql'),
      'utf-8'
    );
    expect(sql).toContain('cleanup');
  });
});
