// PDF Cache System
// LRU cache for PDF previews to improve performance

import type { PDFDensity } from './types';

interface CacheEntry {
  data: string;
  timestamp: number;
  size: number;
}

interface CacheKey {
  quoteId: string;
  density: PDFDensity;
  locale: string;
  contentHash: string;
}

// Maximum cache size per user (10 MB)
const MAX_CACHE_SIZE = 10 * 1024 * 1024;
// Cache TTL (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

class PDFCache {
  private cache: Map<string, CacheEntry> = new Map();
  private totalSize = 0;

  private generateKey(key: CacheKey): string {
    return `${key.quoteId}-${key.density}-${key.locale}-${key.contentHash}`;
  }

  /**
   * Get cached PDF data URL if available and not expired
   */
  get(key: CacheKey): string | null {
    const cacheKey = this.generateKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.delete(cacheKey);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(cacheKey);
    this.cache.set(cacheKey, entry);

    return entry.data;
  }

  /**
   * Store PDF data URL in cache
   */
  set(key: CacheKey, data: string): void {
    const cacheKey = this.generateKey(key);
    const size = data.length * 2; // Approximate size in bytes (UTF-16)

    // If this single entry is too large, don't cache it
    if (size > MAX_CACHE_SIZE / 2) {
      return;
    }

    // Remove old entry if exists
    if (this.cache.has(cacheKey)) {
      this.delete(cacheKey);
    }

    // Evict entries if needed (LRU)
    while (this.totalSize + size > MAX_CACHE_SIZE && this.cache.size > 0) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    // Add new entry
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      size,
    });
    this.totalSize += size;
  }

  /**
   * Delete a cache entry
   */
  private delete(cacheKey: string): void {
    const entry = this.cache.get(cacheKey);
    if (entry) {
      this.totalSize -= entry.size;
      this.cache.delete(cacheKey);
    }
  }

  /**
   * Invalidate cache for a specific quote
   */
  invalidateQuote(quoteId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
      key.startsWith(`${quoteId}-`)
    );
    keysToDelete.forEach((key) => this.delete(key));
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.totalSize = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): { entries: number; totalSize: number; maxSize: number } {
    return {
      entries: this.cache.size,
      totalSize: this.totalSize,
      maxSize: MAX_CACHE_SIZE,
    };
  }

  /**
   * Check if cache has entry
   */
  has(key: CacheKey): boolean {
    return this.get(key) !== null;
  }
}

// Singleton instance
export const pdfCache = new PDFCache();

/**
 * Generate a content hash for cache key
 * Based on quote content that affects PDF output
 */
export function generateContentHash(quote: {
  total: number;
  subtotal: number;
  tax_amount: number;
  items_count?: number;
  notes?: string | null;
  client_name: string;
}): string {
  const content = [
    quote.total,
    quote.subtotal,
    quote.tax_amount,
    quote.items_count || 0,
    quote.notes?.slice(0, 50) || '',
    quote.client_name,
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export type { CacheKey };
