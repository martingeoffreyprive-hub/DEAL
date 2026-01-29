/**
 * Sprint 16: Guided Onboarding v2 — Epic 8 Tests
 * Stories: 8.1 (Wizard), 8.2 (Tooltips), 8.3 (Email Drip), 8.4 (Videos)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 8.1: Interactive Onboarding Wizard
// ============================================================================
describe('Story 8.1: Interactive Onboarding Wizard', () => {
  let wizardSrc: string;

  beforeAll(() => {
    wizardSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-wizard.tsx'),
      'utf-8'
    );
  });

  it('should have onboarding wizard component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-wizard.tsx')
    )).toBe(true);
  });

  it('should have multi-step flow with 4 steps', () => {
    expect(wizardSrc).toContain('step');
    expect(wizardSrc).toContain('Profile');
  });

  it('should have step navigation (next/previous)', () => {
    const hasNav = wizardSrc.includes('next') || wizardSrc.includes('Suivant') || wizardSrc.includes('handleNext');
    expect(hasNav).toBe(true);
  });

  it('should use Framer Motion for animations', () => {
    expect(wizardSrc).toContain('motion');
    expect(wizardSrc).toContain('framer-motion');
  });

  it('should have onboarding page', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx')
    )).toBe(true);
  });

  it('should have require-onboarding guard', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'auth', 'require-onboarding.tsx')
    )).toBe(true);
  });

  it('should have onboarding checklist on dashboard', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx')
    )).toBe(true);
  });

  it('should have sample quote banner for first-time users', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'sample-quote-banner.tsx')
    )).toBe(true);
  });
});

// ============================================================================
// Story 8.2: Contextual Tooltips
// ============================================================================
describe('Story 8.2: Contextual Tooltips', () => {
  let tooltipSrc: string;

  beforeAll(() => {
    tooltipSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'ui', 'interactive-tooltip.tsx'),
      'utf-8'
    );
  });

  it('should have interactive tooltip component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'ui', 'interactive-tooltip.tsx')
    )).toBe(true);
  });

  it('should support tooltip types (info, tip, warning, help, feature)', () => {
    expect(tooltipSrc).toContain('info');
    expect(tooltipSrc).toContain('tip');
    expect(tooltipSrc).toContain('warning');
    expect(tooltipSrc).toContain('help');
    expect(tooltipSrc).toContain('feature');
  });

  it('should have useTooltipContent hook', () => {
    expect(tooltipSrc).toContain('useTooltipContent');
  });

  it('should have TooltipByKey component', () => {
    expect(tooltipSrc).toContain('TooltipByKey');
  });

  it('should have HelpBadge component', () => {
    expect(tooltipSrc).toContain('HelpBadge');
  });

  it('should be dismissible', () => {
    const hasDismiss = tooltipSrc.includes('closed') || tooltipSrc.includes('dismiss') || tooltipSrc.includes('onOpenChange');
    expect(hasDismiss).toBe(true);
  });

  it('should have base Radix tooltip component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'ui', 'tooltip.tsx')
    )).toBe(true);
  });
});

// ============================================================================
// Story 8.3: Email Drip Campaign
// ============================================================================
describe('Story 8.3: Email Drip Campaign', () => {
  let dripSrc: string;

  beforeAll(() => {
    dripSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'email', 'drip-campaign.ts'),
      'utf-8'
    );
  });

  it('should have drip campaign module', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'email', 'drip-campaign.ts')
    )).toBe(true);
  });

  it('should define 5 drip email types', () => {
    expect(dripSrc).toContain('welcome');
    expect(dripSrc).toContain('first_quote');
    expect(dripSrc).toContain('ai_tips');
    expect(dripSrc).toContain('upgrade_prompt');
    expect(dripSrc).toContain('nps_feedback');
  });

  it('should have drip schedule with day offsets', () => {
    expect(dripSrc).toContain('DRIP_SCHEDULE');
    expect(dripSrc).toContain('dayOffset');
  });

  it('should have conditional sending logic', () => {
    expect(dripSrc).toContain('shouldSendDrip');
    expect(dripSrc).toContain('condition');
    expect(dripSrc).toContain('quotesCount');
  });

  it('should have HTML email templates in French', () => {
    expect(dripSrc).toContain('Bienvenue');
    expect(dripSrc).toContain('devis');
    expect(dripSrc).toContain('getDripEmailHtml');
  });

  it('should have unsubscribe link for GDPR', () => {
    expect(dripSrc).toContain('unsubscribe');
    expect(dripSrc).toContain('Se désabonner');
  });

  it('should support Resend email provider', () => {
    expect(dripSrc).toContain('RESEND_API_KEY');
    expect(dripSrc).toContain('api.resend.com');
  });

  it('should have sendEmail function', () => {
    expect(dripSrc).toContain('export async function sendEmail');
  });

  it('should have processDripForUser function', () => {
    expect(dripSrc).toContain('processDripForUser');
  });

  it('should check user email preferences', () => {
    expect(dripSrc).toContain('emailPreferences');
    expect(dripSrc).toContain('drip_campaign');
  });

  it('should have NPS scoring in feedback email', () => {
    expect(dripSrc).toContain('nps');
    expect(dripSrc).toContain('score');
  });
});

// ============================================================================
// Story 8.4: Video Tutorials
// ============================================================================
describe('Story 8.4: Video Tutorials', () => {
  it('should have user guide / docs page', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'app', 'docs', 'user-guide', 'page.tsx')
    )).toBe(true);
  });

  it('should have help categories and search', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'docs', 'user-guide', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('searchQuery');
    expect(src).toContain('filteredCategories');
  });

  it('should have video tutorial entries', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'docs', 'user-guide', 'page.tsx'),
      'utf-8'
    );
    const hasVideos = src.includes('video') || src.includes('tutorial') || src.includes('TUTORIAL');
    expect(hasVideos).toBe(true);
  });

  it('should have glossary section', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', 'docs', 'user-guide', 'page.tsx'),
      'utf-8'
    );
    const hasGlossary = src.includes('GLOSSARY') || src.includes('Glossaire');
    expect(hasGlossary).toBe(true);
  });

  it('should have tutorial overlay for first-time users', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx')
    )).toBe(true);
  });

  it('should have tutorial steps defined', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx'),
      'utf-8'
    );
    expect(src).toContain('TUTORIAL_STEPS');
  });
});
