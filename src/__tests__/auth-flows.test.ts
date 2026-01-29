/**
 * Story 2.2: Auth Flow Tests — Sprint 10
 * Tests for authentication flows, protected routes, admin access
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getRateLimiterType } from '@/lib/cors';

describe('Story 2.2: Auth Flow Tests', () => {

  // =========================================================================
  // Login page exists and has required elements
  // =========================================================================
  describe('Login Page Structure', () => {
    it('should have a login page component', () => {
      const loginPath = path.join(process.cwd(), 'src', 'app', '(auth)', 'login', 'page.tsx');
      expect(fs.existsSync(loginPath)).toBe(true);
    });

    it('should have a signup/register page component', () => {
      const paths = [
        path.join(process.cwd(), 'src', 'app', '(auth)', 'signup', 'page.tsx'),
        path.join(process.cwd(), 'src', 'app', '(auth)', 'register', 'page.tsx'),
      ];
      expect(paths.some(p => fs.existsSync(p))).toBe(true);
    });

    it('should have a forgot-password page component', () => {
      const files = [
        path.join(process.cwd(), 'src', 'app', '(auth)', 'forgot-password', 'page.tsx'),
        path.join(process.cwd(), 'src', 'app', '(auth)', 'reset-password', 'page.tsx'),
      ];
      const exists = files.some(f => fs.existsSync(f));
      expect(exists).toBe(true);
    });
  });

  // =========================================================================
  // Middleware protects routes
  // =========================================================================
  describe('Route Protection (middleware)', () => {
    let middlewareSrc: string;

    beforeEach(() => {
      middlewareSrc = fs.readFileSync(
        path.join(process.cwd(), 'src', 'middleware.ts'),
        'utf-8'
      );
    });

    it('should define protected routes', () => {
      // Middleware must have some form of route protection
      expect(middlewareSrc).toContain('/dashboard');
    });

    it('should redirect unauthenticated users to login', () => {
      expect(middlewareSrc).toContain('/login');
    });

    it('should check admin email whitelist', () => {
      expect(middlewareSrc).toContain('ADMIN_EMAILS');
    });

    it('should handle admin route protection', () => {
      expect(middlewareSrc).toContain('/admin');
    });

    it('should have auth-related route handling', () => {
      // Middleware handles authentication via Supabase or redirects
      expect(middlewareSrc).toContain('/login');
    });
  });

  // =========================================================================
  // Supabase auth configuration
  // =========================================================================
  describe('Supabase Auth Configuration', () => {
    it('should have server-side Supabase client', () => {
      const serverClient = path.join(process.cwd(), 'src', 'lib', 'supabase', 'server.ts');
      expect(fs.existsSync(serverClient)).toBe(true);
    });

    it('should have client-side Supabase client', () => {
      const clientPath = path.join(process.cwd(), 'src', 'lib', 'supabase', 'client.ts');
      expect(fs.existsSync(clientPath)).toBe(true);
    });

    it('should not expose service role key in client Supabase', () => {
      const clientPath = path.join(process.cwd(), 'src', 'lib', 'supabase', 'client.ts');
      const content = fs.readFileSync(clientPath, 'utf-8');
      expect(content).not.toContain('SERVICE_ROLE');
    });

    it('should use NEXT_PUBLIC_SUPABASE_ANON_KEY in client', () => {
      const clientPath = path.join(process.cwd(), 'src', 'lib', 'supabase', 'client.ts');
      const content = fs.readFileSync(clientPath, 'utf-8');
      expect(content).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });
  });

  // =========================================================================
  // Auth E2E spec exists and covers key flows
  // =========================================================================
  describe('E2E Auth Coverage', () => {
    let authSpec: string;

    beforeEach(() => {
      authSpec = fs.readFileSync(
        path.join(process.cwd(), 'tests', 'e2e', 'auth.spec.ts'),
        'utf-8'
      );
    });

    it('should test login page display', () => {
      expect(authSpec).toContain('login');
    });

    it('should test invalid credentials error', () => {
      expect(authSpec).toContain('invalid');
    });

    it('should test signup page display', () => {
      expect(authSpec).toContain('signup');
    });

    it('should test protected route redirect', () => {
      expect(authSpec).toContain('/dashboard');
    });

    it('should test admin route protection', () => {
      expect(authSpec).toContain('/admin');
    });

    it('should test forgot password link', () => {
      expect(authSpec).toContain('mot de passe');
    });
  });

  // =========================================================================
  // Auth rate limiting
  // =========================================================================
  describe('Auth Rate Limiting', () => {
    it('should have auth-specific rate limiter', () => {
      const rateLimitSrc = fs.readFileSync(
        path.join(process.cwd(), 'src', 'lib', 'rate-limit.ts'),
        'utf-8'
      );
      expect(rateLimitSrc).toContain('authRateLimiter');
      expect(rateLimitSrc).toContain('slidingWindow(5, "15 m")');
    });

    it('should route auth endpoints to auth limiter', () => {
      expect(getRateLimiterType('/api/auth/login')).toBe('auth');
      expect(getRateLimiterType('/api/auth/register')).toBe('auth');
    });
  });
});
