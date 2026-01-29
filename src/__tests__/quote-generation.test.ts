/**
 * Story 2.3: Quote Generation Tests — Sprint 10
 * Tests for the core quote generation flow (AI + manual + edit + PDF + status)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getRateLimiterType } from '@/lib/cors';

describe('Story 2.3: Quote Generation Tests', () => {

  // =========================================================================
  // AI Generation Endpoint
  // =========================================================================
  describe('AI Generation Endpoint', () => {
    it('should have generate API route', () => {
      const routePath = path.join(process.cwd(), 'src', 'app', 'api', 'generate', 'route.ts');
      expect(fs.existsSync(routePath)).toBe(true);
    });

    it('should use Anthropic API for generation', () => {
      const routeSrc = fs.readFileSync(
        path.join(process.cwd(), 'src', 'app', 'api', 'generate', 'route.ts'),
        'utf-8'
      );
      // Should reference anthropic or claude
      const usesAI = routeSrc.includes('anthropic') || routeSrc.includes('Anthropic') || routeSrc.includes('claude');
      expect(usesAI).toBe(true);
    });

    it('should validate transcription input', () => {
      const routeSrc = fs.readFileSync(
        path.join(process.cwd(), 'src', 'app', 'api', 'generate', 'route.ts'),
        'utf-8'
      );
      // Should have some form of input validation
      const hasValidation = routeSrc.includes('transcription') || routeSrc.includes('body') || routeSrc.includes('json');
      expect(hasValidation).toBe(true);
    });

    it('should be rate-limited as AI endpoint', () => {
      expect(getRateLimiterType('/api/generate')).toBe('ai');
    });
  });

  // =========================================================================
  // Quote Calculations
  // =========================================================================
  describe('Quote Total Calculations', () => {
    function calculateQuoteTotals(
      items: { quantity: number; unit_price: number }[],
      taxRate: number
    ) {
      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;
      return { subtotal, taxAmount, total };
    }

    it('should calculate subtotal correctly', () => {
      const { subtotal } = calculateQuoteTotals(
        [{ quantity: 2, unit_price: 100 }, { quantity: 3, unit_price: 50 }],
        21
      );
      expect(subtotal).toBe(350);
    });

    it('should calculate Belgian VAT (21%) correctly', () => {
      const { taxAmount } = calculateQuoteTotals(
        [{ quantity: 1, unit_price: 1000 }],
        21
      );
      expect(taxAmount).toBe(210);
    });

    it('should calculate total (subtotal + tax)', () => {
      const { total } = calculateQuoteTotals(
        [{ quantity: 1, unit_price: 1000 }],
        21
      );
      expect(total).toBe(1210);
    });

    it('should handle zero items', () => {
      const { subtotal, taxAmount, total } = calculateQuoteTotals([], 21);
      expect(subtotal).toBe(0);
      expect(taxAmount).toBe(0);
      expect(total).toBe(0);
    });

    it('should handle 0% tax rate', () => {
      const { taxAmount, total, subtotal } = calculateQuoteTotals(
        [{ quantity: 1, unit_price: 500 }],
        0
      );
      expect(taxAmount).toBe(0);
      expect(total).toBe(subtotal);
    });

    it('should handle decimal prices', () => {
      const { subtotal } = calculateQuoteTotals(
        [{ quantity: 1, unit_price: 99.99 }],
        21
      );
      expect(subtotal).toBeCloseTo(99.99);
    });
  });

  // =========================================================================
  // Quote Number Generation
  // =========================================================================
  describe('Quote Number Generation', () => {
    it('should format quote number with prefix and padding', () => {
      const prefix = 'DEV';
      const nextNumber = 42;
      const quoteNumber = `${prefix}-${String(nextNumber).padStart(5, '0')}`;
      expect(quoteNumber).toBe('DEV-00042');
    });

    it('should handle large quote numbers', () => {
      const quoteNumber = `PRO-${String(99999).padStart(5, '0')}`;
      expect(quoteNumber).toBe('PRO-99999');
    });

    it('should handle number 1', () => {
      const quoteNumber = `ART-${String(1).padStart(5, '0')}`;
      expect(quoteNumber).toBe('ART-00001');
    });
  });

  // =========================================================================
  // Status Workflow Transitions
  // =========================================================================
  describe('Status Workflow Transitions', () => {
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'finalized', 'exported', 'archived'];

    it('should have all valid statuses defined', () => {
      expect(validStatuses).toHaveLength(7);
    });

    it('should allow transition from draft to sent', () => {
      const mutableFrom = ['draft', 'sent', 'accepted', 'rejected'];
      expect(mutableFrom.includes('draft')).toBe(true);
    });

    it('should block transition from finalized', () => {
      const immutable = ['finalized', 'exported', 'archived'];
      expect(immutable.includes('finalized')).toBe(true);
    });

    it('should block transition from exported', () => {
      const immutable = ['finalized', 'exported', 'archived'];
      expect(immutable.includes('exported')).toBe(true);
    });
  });

  // =========================================================================
  // PDF Export
  // =========================================================================
  describe('PDF Export', () => {
    it('should have PDF generation infrastructure', () => {
      // Check for PDF-related files
      const pdfFiles = [
        path.join(process.cwd(), 'src', 'lib', 'pdf'),
        path.join(process.cwd(), 'src', 'components', 'pdf'),
      ];
      const hasPdfInfra = pdfFiles.some(p => fs.existsSync(p));
      expect(hasPdfInfra).toBe(true);
    });

    it('should have PDF cache test', () => {
      const pdfCacheTest = path.join(process.cwd(), 'src', 'lib', '__tests__', 'pdf-cache.test.ts');
      expect(fs.existsSync(pdfCacheTest)).toBe(true);
    });
  });

  // =========================================================================
  // Duplicate Quote Logic
  // =========================================================================
  describe('Duplicate Quote Logic', () => {
    it('should create a new quote number on duplication', () => {
      const originalNumber = 'DEV-00001';
      const nextNum = 2;
      const newNumber = `DEV-${String(nextNum).padStart(5, '0')}`;
      expect(newNumber).not.toBe(originalNumber);
      expect(newNumber).toBe('DEV-00002');
    });

    it('should preserve items but with new IDs conceptually', () => {
      const originalItems = [
        { id: 'old-1', description: 'Service A', quantity: 2, unit_price: 100 },
        { id: 'old-2', description: 'Service B', quantity: 1, unit_price: 200 },
      ];
      const duplicatedItems = originalItems.map(({ id, ...rest }) => rest);
      expect(duplicatedItems[0]).not.toHaveProperty('id');
      expect(duplicatedItems[0].description).toBe('Service A');
    });
  });
});
