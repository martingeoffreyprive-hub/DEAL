import { describe, it, expect, beforeEach } from 'vitest';
import { pdfCache, generateContentHash, type CacheKey } from '../pdf/cache';

describe('PDF Cache', () => {
  beforeEach(() => {
    pdfCache.clear();
  });

  describe('get/set', () => {
    it('should store and retrieve cached data', () => {
      const key: CacheKey = {
        quoteId: 'quote-123',
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'abc123',
      };

      pdfCache.set(key, 'data:image/pdf;base64,test');
      const result = pdfCache.get(key);

      expect(result).toBe('data:image/pdf;base64,test');
    });

    it('should return null for missing entries', () => {
      const key: CacheKey = {
        quoteId: 'nonexistent',
        density: 'compact',
        locale: 'fr-FR',
        contentHash: 'xyz',
      };

      expect(pdfCache.get(key)).toBeNull();
    });

    it('should differentiate by density', () => {
      const baseKey = {
        quoteId: 'quote-123',
        locale: 'fr-BE',
        contentHash: 'abc123',
      };

      pdfCache.set({ ...baseKey, density: 'compact' }, 'compact-data');
      pdfCache.set({ ...baseKey, density: 'normal' }, 'normal-data');
      pdfCache.set({ ...baseKey, density: 'detailed' }, 'detailed-data');

      expect(pdfCache.get({ ...baseKey, density: 'compact' })).toBe('compact-data');
      expect(pdfCache.get({ ...baseKey, density: 'normal' })).toBe('normal-data');
      expect(pdfCache.get({ ...baseKey, density: 'detailed' })).toBe('detailed-data');
    });

    it('should differentiate by locale', () => {
      const baseKey = {
        quoteId: 'quote-123',
        density: 'normal' as const,
        contentHash: 'abc123',
      };

      pdfCache.set({ ...baseKey, locale: 'fr-BE' }, 'be-data');
      pdfCache.set({ ...baseKey, locale: 'fr-FR' }, 'fr-data');

      expect(pdfCache.get({ ...baseKey, locale: 'fr-BE' })).toBe('be-data');
      expect(pdfCache.get({ ...baseKey, locale: 'fr-FR' })).toBe('fr-data');
    });
  });

  describe('has', () => {
    it('should return true for cached entries', () => {
      const key: CacheKey = {
        quoteId: 'quote-123',
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'abc123',
      };

      pdfCache.set(key, 'test-data');
      expect(pdfCache.has(key)).toBe(true);
    });

    it('should return false for missing entries', () => {
      const key: CacheKey = {
        quoteId: 'missing',
        density: 'compact',
        locale: 'fr-CH',
        contentHash: 'xyz',
      };

      expect(pdfCache.has(key)).toBe(false);
    });
  });

  describe('invalidateQuote', () => {
    it('should remove all entries for a quote', () => {
      const quoteId = 'quote-to-invalidate';

      pdfCache.set({
        quoteId,
        density: 'compact',
        locale: 'fr-BE',
        contentHash: 'v1',
      }, 'data1');

      pdfCache.set({
        quoteId,
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'v1',
      }, 'data2');

      pdfCache.set({
        quoteId: 'other-quote',
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'v1',
      }, 'data3');

      pdfCache.invalidateQuote(quoteId);

      expect(pdfCache.has({
        quoteId,
        density: 'compact',
        locale: 'fr-BE',
        contentHash: 'v1',
      })).toBe(false);

      expect(pdfCache.has({
        quoteId,
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'v1',
      })).toBe(false);

      // Other quote should still be cached
      expect(pdfCache.has({
        quoteId: 'other-quote',
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'v1',
      })).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      const key1: CacheKey = {
        quoteId: 'q1',
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'h1',
      };

      const key2: CacheKey = {
        quoteId: 'q2',
        density: 'compact',
        locale: 'fr-FR',
        contentHash: 'h2',
      };

      pdfCache.set(key1, 'data1');
      pdfCache.set(key2, 'data2');

      pdfCache.clear();

      expect(pdfCache.has(key1)).toBe(false);
      expect(pdfCache.has(key2)).toBe(false);
      expect(pdfCache.getStats().entries).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      pdfCache.set({
        quoteId: 'q1',
        density: 'normal',
        locale: 'fr-BE',
        contentHash: 'h1',
      }, 'short-data');

      const stats = pdfCache.getStats();

      expect(stats.entries).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.maxSize).toBe(10 * 1024 * 1024);
    });
  });
});

describe('generateContentHash', () => {
  it('should generate consistent hashes for same content', () => {
    const quote = {
      total: 1000,
      subtotal: 826.45,
      tax_amount: 173.55,
      items_count: 5,
      notes: 'Test notes',
      client_name: 'Test Client',
    };

    const hash1 = generateContentHash(quote);
    const hash2 = generateContentHash(quote);

    expect(hash1).toBe(hash2);
  });

  it('should generate different hashes for different content', () => {
    const quote1 = {
      total: 1000,
      subtotal: 826.45,
      tax_amount: 173.55,
      client_name: 'Client A',
    };

    const quote2 = {
      total: 2000,
      subtotal: 1652.89,
      tax_amount: 347.11,
      client_name: 'Client B',
    };

    expect(generateContentHash(quote1)).not.toBe(generateContentHash(quote2));
  });

  it('should handle missing optional fields', () => {
    const quote = {
      total: 500,
      subtotal: 413.22,
      tax_amount: 86.78,
      client_name: 'Test',
    };

    expect(() => generateContentHash(quote)).not.toThrow();
  });
});
