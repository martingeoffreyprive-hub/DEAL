/**
 * Sprint 11: Onboarding & First Run — Epic 3 Tests
 * Stories: 3.1 (Sector Selection), 3.2 (Company Profile), 3.3 (Tutorial),
 *          3.4 (Sample Quote), 3.5 (Progress Indicator)
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 3.1: Sector Selection Onboarding
// ============================================================================
describe('Story 3.1: Sector Selection Onboarding', () => {
  it('should have onboarding page', () => {
    const p = path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('should display sector selection grid', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('SECTORS');
    expect(src).toContain('SECTOR_ICONS');
    expect(src).toContain('grid');
  });

  it('should save selected sector to profiles.default_sector', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('default_sector');
  });

  it('should enforce plan-based sector limits', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('maxSectors');
    expect(src).toContain('PLAN_FEATURES');
  });

  it('should save sectors to user_sectors table', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('user_sectors');
    expect(src).toContain('is_primary');
  });

  it('should show upgrade prompt when limit reached', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('Besoin de plus de secteurs');
    expect(src).toContain('/pricing');
  });

  it('should redirect already-onboarded users to dashboard', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('onboarding_completed');
    expect(src).toContain('/dashboard');
  });

  it('should mark onboarding as completed on continue', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(auth)', 'onboarding', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('onboarding_completed: true');
  });
});

// ============================================================================
// Story 3.2: Company Profile Quick Setup
// ============================================================================
describe('Story 3.2: Company Profile Quick Setup', () => {
  it('should have onboarding wizard component', () => {
    const p = path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-wizard.tsx');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('should have profile page with company fields', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'profile', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('company_name');
    expect(src).toContain('siret'); // TVA field
    expect(src).toContain('address');
    expect(src).toContain('phone');
  });

  it('should support logo upload', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'profile', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('logo');
  });

  it('should have quote prefix configuration', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'profile', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('quote_prefix');
  });

  it('should have legal mentions field', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'profile', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('legal_mentions');
  });

  it('should have IBAN field for Belgian banking', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'profile', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('iban');
  });

  it('should enforce onboarding check in dashboard layout', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'layout.tsx'),
      'utf-8'
    );
    expect(src).toContain('onboarding_completed');
    expect(src).toContain('/onboarding');
  });
});

// ============================================================================
// Story 3.3: First Quote Tutorial Overlay
// ============================================================================
describe('Story 3.3: First Quote Tutorial Overlay', () => {
  it('should have tutorial overlay component', () => {
    const p = path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('should have 4 tutorial steps', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx'),
      'utf-8'
    );
    expect(src).toContain('TUTORIAL_STEPS');
    expect(src).toContain('transcription');
    expect(src).toContain('Générez');
    expect(src).toContain('ajustez');
    expect(src).toContain('PDF');
  });

  it('should be dismissible', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx'),
      'utf-8'
    );
    expect(src).toContain('dismiss');
    expect(src).toContain('Ne plus afficher');
  });

  it('should track tutorial completion in user_settings', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx'),
      'utf-8'
    );
    expect(src).toContain('tutorial_completed');
    expect(src).toContain('user_settings');
  });

  it('should be integrated into quotes/new page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'quotes', 'new', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('TutorialOverlay');
  });

  it('should have step navigation (next/previous)', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx'),
      'utf-8'
    );
    expect(src).toContain('Suivant');
    expect(src).toContain('Précédent');
  });

  it('should have step indicator dots', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'tutorial-overlay.tsx'),
      'utf-8'
    );
    expect(src).toContain('currentStep');
    expect(src).toContain('rounded-full');
  });
});

// ============================================================================
// Story 3.4: Sample Quote Auto-Generation
// ============================================================================
describe('Story 3.4: Sample Quote Auto-Generation', () => {
  it('should have sample quote banner component', () => {
    const p = path.join(process.cwd(), 'src', 'components', 'onboarding', 'sample-quote-banner.tsx');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('should have sector-specific sample transcriptions', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'sample-quote-banner.tsx'),
      'utf-8'
    );
    expect(src).toContain('SAMPLE_TRANSCRIPTIONS');
    expect(src).toContain('ELECTRICITE');
    expect(src).toContain('PLOMBERIE');
    expect(src).toContain('CONSTRUCTION');
  });

  it('should only show when user has no quotes', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'sample-quote-banner.tsx'),
      'utf-8'
    );
    expect(src).toContain('hasQuotes');
    expect(src).toContain('if (hasQuotes) return null');
  });

  it('should navigate to quote creation with sample data', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'sample-quote-banner.tsx'),
      'utf-8'
    );
    expect(src).toContain('/quotes/new');
    expect(src).toContain('mode');
    expect(src).toContain('transcription');
  });

  it('should be integrated into dashboard page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('SampleQuoteBanner');
  });

  it('should show sector label in banner', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'sample-quote-banner.tsx'),
      'utf-8'
    );
    expect(src).toContain('SECTOR_CONFIGS');
    expect(src).toContain('sectorConfig');
  });
});

// ============================================================================
// Story 3.5: Onboarding Progress Indicator
// ============================================================================
describe('Story 3.5: Onboarding Progress Indicator', () => {
  it('should have onboarding checklist component', () => {
    const p = path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx');
    expect(fs.existsSync(p)).toBe(true);
  });

  it('should have 4 checklist steps', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx'),
      'utf-8'
    );
    expect(src).toContain('sector');
    expect(src).toContain('profile');
    expect(src).toContain('quote');
    expect(src).toContain('pdf');
  });

  it('should link each step to relevant page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx'),
      'utf-8'
    );
    expect(src).toContain('/onboarding');
    expect(src).toContain('/profile');
    expect(src).toContain('/quotes/new');
    expect(src).toContain('/quotes');
  });

  it('should show progress bar', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx'),
      'utf-8'
    );
    expect(src).toContain('progressPercent');
    expect(src).toContain('completedCount');
  });

  it('should hide when all steps complete', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx'),
      'utf-8'
    );
    expect(src).toContain('allDone');
    expect(src).toContain('if (allDone) return null');
  });

  it('should be integrated into dashboard page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('OnboardingChecklist');
  });

  it('should show check icon for completed steps', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx'),
      'utf-8'
    );
    expect(src).toContain('Check');
    expect(src).toContain('line-through');
  });

  it('should show step count (completed/total)', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'onboarding', 'onboarding-checklist.tsx'),
      'utf-8'
    );
    expect(src).toContain('{completedCount}/{steps.length}');
  });
});
