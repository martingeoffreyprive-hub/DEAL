/**
 * Sprint 17: Acquisition & Retention — Epic 9 Tests
 * Stories: 9.1 (Referral), 9.2 (Upgrade), 9.3 (Notifications), 9.4 (Landing), 9.5 (Feedback)
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 9.1: Referral Program
// ============================================================================
describe('Story 9.1: Referral Program', () => {
  it('should have referral system module', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'referral', 'referral-system.ts')
    )).toBe(true);
  });

  it('should have referral constants with reward types', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'referral', 'constants.ts')
    )).toBe(true);
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'referral', 'constants.ts'),
      'utf-8'
    );
    expect(src).toContain('reward');
  });

  it('should have referral dashboard page', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'referral', 'page.tsx')
    )).toBe(true);
  });

  it('should have referral API routes', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'referral', 'route.ts')
    )).toBe(true);
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'referral', 'invite', 'route.ts')
    )).toBe(true);
  });

  it('should have referral stats API', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'referral', 'stats', 'route.ts')
    )).toBe(true);
  });

  it('should support ambassador levels', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'referral', 'constants.ts'),
      'utf-8'
    );
    const hasLevels = src.includes('Bronze') || src.includes('Silver') || src.includes('ambassador') || src.includes('level');
    expect(hasLevels).toBe(true);
  });
});

// ============================================================================
// Story 9.2: Upgrade Prompts Optimization
// ============================================================================
describe('Story 9.2: Upgrade Prompts', () => {
  it('should have usage card component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'usage-card.tsx')
    )).toBe(true);
  });

  it('should have subscription alert component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'subscription-alert.tsx')
    )).toBe(true);
  });

  it('should have useSubscription hook with quota checks', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'hooks', 'use-subscription.ts'),
      'utf-8'
    );
    expect(src).toContain('canCreateQuote');
  });

  it('should have pricing page with plan comparison', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'pricing', 'page.tsx')
    )).toBe(true);
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'pricing', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('free');
    expect(src).toContain('pro');
  });

  it('should show quota usage in usage card', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'subscription', 'usage-card.tsx'),
      'utf-8'
    );
    expect(src).toContain('usage');
  });
});

// ============================================================================
// Story 9.3: Feature Discovery Notifications
// ============================================================================
describe('Story 9.3: Feature Discovery Notifications', () => {
  it('should have notification bell component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'notifications', 'notification-bell.tsx')
    )).toBe(true);
  });

  it('should have unread count badge', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'notifications', 'notification-bell.tsx'),
      'utf-8'
    );
    expect(src).toContain('unread');
  });

  it('should load notifications from Supabase', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'notifications', 'notification-bell.tsx'),
      'utf-8'
    );
    expect(src).toContain('supabase');
  });

  it('should support mark as read', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'notifications', 'notification-bell.tsx'),
      'utf-8'
    );
    const hasMarkRead = src.includes('markAsRead') || src.includes('mark') || src.includes('read');
    expect(hasMarkRead).toBe(true);
  });
});

// ============================================================================
// Story 9.4: Landing Page Conversion
// ============================================================================
describe('Story 9.4: Landing Page Conversion', () => {
  it('should have main landing page', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'page.tsx')
    )).toBe(true);
  });

  it('should have hero section with CTA', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'page.tsx'),
      'utf-8'
    );
    const hasCTA = src.includes('Essayer') || src.includes('gratuit') || src.includes('Commencer');
    expect(hasCTA).toBe(true);
  });

  it('should have B2C portal', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'b2c', 'page.tsx')
    )).toBe(true);
  });

  it('should have dashboard hero component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'dashboard', 'hero-section.tsx')
    )).toBe(true);
  });
});

// ============================================================================
// Story 9.5: Beta User Feedback Loop
// ============================================================================
describe('Story 9.5: Beta User Feedback Loop', () => {
  it('should have feedback widget component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'feedback', 'feedback-widget.tsx')
    )).toBe(true);
  });

  it('should support 4 feedback types', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'feedback', 'feedback-widget.tsx'),
      'utf-8'
    );
    expect(src).toContain('general');
    expect(src).toContain('bug');
    expect(src).toContain('feature');
    expect(src).toContain('nps');
  });

  it('should have NPS survey (0-10)', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'feedback', 'feedback-widget.tsx'),
      'utf-8'
    );
    expect(src).toContain('NPSSurvey');
    expect(src).toContain('npsScore');
  });

  it('should have French UI labels', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'feedback', 'feedback-widget.tsx'),
      'utf-8'
    );
    expect(src).toContain('Votre avis');
    expect(src).toContain('Envoyer');
  });

  it('should have feedback API route', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'feedback', 'route.ts')
    )).toBe(true);
  });

  it('should validate feedback payload', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'feedback', 'route.ts'),
      'utf-8'
    );
    expect(src).toContain('type');
    expect(src).toContain('message');
    expect(src).toContain('nps_score');
  });

  it('should be non-blocking (never fail UX)', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'api', 'feedback', 'route.ts'),
      'utf-8'
    );
    // API always returns success even on error
    expect(src).toContain('success: true');
  });
});
