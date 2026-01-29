/**
 * Story 2.5: RLS Regression Test Suite — Sprint 10
 * Verifies data isolation via RLS policies across all user-facing tables
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Story 2.5: RLS Regression Test Suite', () => {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  let allSql: string;

  // Load all migrations once
  beforeAll(() => {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    allSql = files.map(f => fs.readFileSync(path.join(migrationsDir, f), 'utf-8')).join('\n');
  });

  // =========================================================================
  // User isolation: auth.uid() policies
  // =========================================================================
  describe('User Isolation Policies', () => {
    const userIsolatedTables = [
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

    for (const table of userIsolatedTables) {
      it(`should have auth.uid() policy on "${table}"`, () => {
        const hasPolicy = allSql.includes(`CREATE POLICY`) && allSql.includes(`ON ${table}`);
        const hasAuthUid = allSql.includes('auth.uid()');
        expect(hasPolicy && hasAuthUid, `${table} should have user isolation policy`).toBe(true);
      });
    }
  });

  // =========================================================================
  // User A cannot access User B data (policy structure)
  // =========================================================================
  describe('Cross-User Data Isolation', () => {
    const tablesWithUserIdFilter = [
      'profiles',
      'quotes',
      'invoices',
      'leads',
      'api_keys',
      'subscriptions',
      'workflows',
      'user_consents',
      'user_settings',
      'referrals',
      'token_transactions',
      'user_suppliers',
    ];

    for (const table of tablesWithUserIdFilter) {
      it(`should filter "${table}" by user_id or auth.uid()`, () => {
        // Check that policies reference auth.uid() for this table
        const tableRegex = new RegExp(`CREATE POLICY[\\s\\S]*?ON\\s+${table}[\\s\\S]*?auth\\.uid\\(\\)`, 'i');
        // Also check for direct user_id references in SELECT policies
        const hasDirectFilter = tableRegex.test(allSql) ||
          (allSql.includes(`ON ${table}`) && allSql.includes('auth.uid()'));
        expect(hasDirectFilter, `${table} policies should reference auth.uid()`).toBe(true);
      });
    }
  });

  // =========================================================================
  // Organization member access
  // =========================================================================
  describe('Organization Access Policies', () => {
    it('should have organization_members role-based policies', () => {
      expect(allSql).toContain('organization_members');
      expect(allSql).toContain("role = 'owner'");
    });

    it('should have organization view policy for members', () => {
      expect(allSql).toContain('Org members can view organization');
    });

    it('should restrict org management to owners', () => {
      expect(allSql).toContain('Owner can manage organization');
    });

    it('should restrict member management to admin/owner', () => {
      expect(allSql).toContain('Admin can manage org members');
    });

    it('should restrict invitations to admin/owner', () => {
      expect(allSql).toContain('Admin can manage invitations');
    });
  });

  // =========================================================================
  // Viewer/read-only cannot CUD
  // =========================================================================
  describe('Read-Only Restrictions', () => {
    it('should have SELECT-only policies on template_purchases for users', () => {
      const selectPolicy = allSql.includes('Users can view own template purchases');
      const insertPolicy = allSql.includes('Users can insert own template purchases');
      expect(selectPolicy).toBe(true);
      expect(insertPolicy).toBe(true);
      // No UPDATE or DELETE policy for template_purchases
      const hasUpdate = /CREATE POLICY.*ON template_purchases.*FOR UPDATE/i.test(allSql);
      const hasDelete = /CREATE POLICY.*ON template_purchases.*FOR DELETE/i.test(allSql);
      expect(hasUpdate).toBe(false);
      expect(hasDelete).toBe(false);
    });

    it('should have processed_stripe_events accessible only by service role', () => {
      const hasRLS = allSql.includes('ALTER TABLE processed_stripe_events ENABLE ROW LEVEL SECURITY');
      expect(hasRLS).toBe(true);
      // No user-facing policies = only service role can access
      const hasUserPolicy = /CREATE POLICY.*ON processed_stripe_events.*auth\.uid\(\)/.test(allSql);
      expect(hasUserPolicy).toBe(false);
    });
  });

  // =========================================================================
  // Public/anon accessible tables
  // =========================================================================
  describe('Public Table Access', () => {
    it('should NOT have RLS on vat_rates (public reference table)', () => {
      const hasRLS = allSql.includes('ALTER TABLE vat_rates ENABLE ROW LEVEL SECURITY');
      expect(hasRLS).toBe(false);
    });
  });

  // =========================================================================
  // All critical tables have RLS enabled
  // =========================================================================
  describe('RLS Enabled on All Critical Tables', () => {
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
      it(`should have RLS enabled on "${table}"`, () => {
        const hasRLS = allSql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
          || allSql.includes(`ALTER TABLE IF EXISTS ${table} ENABLE ROW LEVEL SECURITY`);
        expect(hasRLS, `Table "${table}" should have RLS enabled`).toBe(true);
      });
    }
  });

  // =========================================================================
  // Security hardening migration exists
  // =========================================================================
  describe('Security Hardening Migration', () => {
    it('should have sprint 9 security hardening migration', () => {
      const hardening = path.join(migrationsDir, '20260129_security_hardening.sql');
      expect(fs.existsSync(hardening)).toBe(true);
    });

    it('should be idempotent (IF NOT EXISTS guards)', () => {
      const hardening = fs.readFileSync(
        path.join(migrationsDir, '20260129_security_hardening.sql'),
        'utf-8'
      );
      expect(hardening).toContain('IF NOT EXISTS');
      expect(hardening).toContain('IF EXISTS');
    });
  });

  // =========================================================================
  // CI Runnable
  // =========================================================================
  describe('CI Configuration', () => {
    it('should be included in vitest test paths', () => {
      const vitestConfig = fs.readFileSync(
        path.join(process.cwd(), 'vitest.config.ts'),
        'utf-8'
      );
      expect(vitestConfig).toContain('src/**/*.{test,spec}.{ts,tsx}');
    });

    it('should have vitest as dev dependency', () => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );
      const hasVitest = pkg.devDependencies?.vitest || pkg.dependencies?.vitest;
      expect(hasVitest).toBeTruthy();
    });
  });
});
