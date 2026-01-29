/**
 * Sprint 12: Core UX Polish — Epic 4 Tests
 * Stories: 4.1 (Responsiveness), 4.2 (Status Workflow), 4.3 (PDF Templates),
 *          4.4 (Dashboard Quick Actions), 4.5 (Search & Filter)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Story 4.1: Quote Editor Responsiveness
// ============================================================================
describe('Story 4.1: Quote Editor Responsiveness', () => {
  it('should have quote wizard component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-wizard.tsx')
    )).toBe(true);
  });

  it('should have responsive grid classes in quote creation', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'quotes', 'new', 'page.tsx'),
      'utf-8'
    );
    // Should use responsive breakpoints
    const hasResponsive = src.includes('sm:') || src.includes('md:') || src.includes('lg:');
    expect(hasResponsive).toBe(true);
  });

  it('should have swipeable card for mobile interactions', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'ui', 'swipeable-card.tsx')
    )).toBe(true);
  });

  it('should have media query hooks for responsive detection', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'hooks', 'use-media-query.ts'),
      'utf-8'
    );
    expect(src).toContain('useIsMobile');
    expect(src).toContain('useIsDesktop');
  });

  it('should have bottom navigation for mobile', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'layout', 'bottom-navigation.tsx')
    )).toBe(true);
  });

  it('should have mobile-specific quick actions in dashboard', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('lg:hidden');
    expect(src).toContain('grid-cols-4');
  });
});

// ============================================================================
// Story 4.2: Quote Status Workflow
// ============================================================================
describe('Story 4.2: Quote Status Workflow', () => {
  it('should define 7 quote statuses', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'types', 'database.ts'),
      'utf-8'
    );
    const statuses = ['draft', 'sent', 'accepted', 'rejected', 'finalized', 'exported', 'archived'];
    for (const status of statuses) {
      expect(src).toContain(`'${status}'`);
    }
  });

  it('should have French status translations', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'types', 'database.ts'),
      'utf-8'
    );
    expect(src).toContain('Brouillon');
    expect(src).toContain('Envoyé');
    expect(src).toContain('Accepté');
    expect(src).toContain('Refusé');
  });

  it('should have status color mapping', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'quotes', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('getStatusColor');
  });

  it('should have status transition on detail page', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'quotes', '[id]', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('handleStatusChange');
    expect(src).toContain('STATUS_ICONS');
    expect(src).toContain('STATUS_COLORS');
  });

  it('should have status filter on quotes list', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-filters.tsx'),
      'utf-8'
    );
    expect(src).toContain('STATUS_OPTIONS');
    expect(src).toContain('filterQuotes');
  });
});

// ============================================================================
// Story 4.3: PDF Template Selection
// ============================================================================
describe('Story 4.3: PDF Template Selection', () => {
  it('should have 6 PDF templates defined', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf-templates.ts'),
      'utf-8'
    );
    const templates = ['classic-pro', 'corporate', 'artisan', 'modern', 'luxe', 'minimal'];
    for (const t of templates) {
      expect(src, `Template "${t}" should exist`).toContain(t);
    }
  });

  it('should have template selector component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'pdf-template-selector.tsx')
    )).toBe(true);
  });

  it('should have PDF preview component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-pdf-preview.tsx')
    )).toBe(true);
  });

  it('should have PDF document component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-pdf-document.tsx')
    )).toBe(true);
  });

  it('should have template color configuration', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf-templates.ts'),
      'utf-8'
    );
    expect(src).toContain('PDFTemplateColors');
    expect(src).toContain('headerStyle');
    expect(src).toContain('tableStyle');
  });

  it('should have EPC QR code for SEPA payments', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'epc-qr.ts')
    )).toBe(true);
  });

  it('should have PDF cache system', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf', 'cache.ts')
    )).toBe(true);
  });

  it('should suggest template per sector', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'lib', 'pdf-templates.ts'),
      'utf-8'
    );
    expect(src).toContain('suggestTemplateForSector');
  });

  it('should have free and pro template tiers', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'pdf-template-selector.tsx'),
      'utf-8'
    );
    // Should distinguish free vs pro templates
    const hasTiers = src.includes('free') || src.includes('pro') || src.includes('Pro') || src.includes('lock');
    expect(hasTiers).toBe(true);
  });
});

// ============================================================================
// Story 4.4: Dashboard Quick Actions
// ============================================================================
describe('Story 4.4: Dashboard Quick Actions', () => {
  let dashSrc: string;

  beforeAll(() => {
    dashSrc = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'dashboard', 'page.tsx'),
      'utf-8'
    );
  });

  it('should show total quotes KPI', () => {
    expect(dashSrc).toContain('totalQuotes');
  });

  it('should show pending quotes KPI', () => {
    expect(dashSrc).toContain('pendingQuotes');
  });

  it('should show accepted quotes KPI', () => {
    expect(dashSrc).toContain('acceptedQuotes');
  });

  it('should show monthly quotes KPI', () => {
    expect(dashSrc).toContain('quotesThisMonth');
  });

  it('should have quick action to create new quote', () => {
    expect(dashSrc).toContain('/quotes/new');
    expect(dashSrc).toContain('Nouveau');
  });

  it('should show recent quotes carousel', () => {
    expect(dashSrc).toContain('QuoteCarousel');
    expect(dashSrc).toContain('Devis récents');
  });

  it('should have usage card', () => {
    expect(dashSrc).toContain('UsageCard');
  });

  it('should have loading spinner', () => {
    expect(dashSrc).toContain('DealLoadingSpinner');
    expect(dashSrc).toContain('Chargement');
  });

  it('should have hero section with greeting', () => {
    expect(dashSrc).toContain('HeroSection');
    expect(dashSrc).toContain('company_name');
  });

  it('should have empty state for new users', () => {
    expect(dashSrc).toContain('Bienvenue sur DEAL');
    expect(dashSrc).toContain('Créer mon premier devis');
  });
});

// ============================================================================
// Story 4.5: Search & Filter Enhancement
// ============================================================================
describe('Story 4.5: Search & Filter Enhancement', () => {
  it('should have search by client name and quote number', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'quotes', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('quote_number');
    expect(src).toContain('client_name');
    expect(src).toContain('toLowerCase');
  });

  it('should have quote filters component', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-filters.tsx')
    )).toBe(true);
  });

  it('should filter by status', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-filters.tsx'),
      'utf-8'
    );
    expect(src).toContain('STATUS_OPTIONS');
  });

  it('should filter by sector', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-filters.tsx'),
      'utf-8'
    );
    expect(src).toContain('sector');
  });

  it('should filter by date range', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'components', 'quotes', 'quote-filters.tsx'),
      'utf-8'
    );
    const hasDateFilter = src.includes('date') || src.includes('period') || src.includes('today') || src.includes('week');
    expect(hasDateFilter).toBe(true);
  });

  it('should have sortable columns', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'quotes', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('sort');
  });

  it('should have pagination', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'src', 'app', '(dashboard)', 'quotes', 'page.tsx'),
      'utf-8'
    );
    expect(src).toContain('page');
    expect(src).toContain('Page');
  });

  it('should have command palette for quick search', () => {
    expect(fs.existsSync(
      path.join(process.cwd(), 'src', 'components', 'command-palette', 'command-palette.tsx')
    )).toBe(true);
  });
});
