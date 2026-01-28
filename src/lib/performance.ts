/**
 * Performance Optimization Utilities
 * Sprint 7 - Epic 11: Optimisations Performance
 */

import { useCallback, useMemo, useRef, useEffect, useState } from "react";

/**
 * Debounce hook - delays execution until after wait milliseconds
 * Useful for search inputs, resize handlers, etc.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook - limits execution to once per wait milliseconds
 * Useful for scroll handlers, mousemove, etc.
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastRan.current >= limit) {
      setThrottledValue(value);
      lastRan.current = now;
    } else {
      const timerId = setTimeout(() => {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }, limit - (now - lastRan.current));

      return () => clearTimeout(timerId);
    }
  }, [value, limit]);

  return throttledValue;
}

/**
 * Memoized callback with deep comparison
 * Prevents unnecessary re-renders when object dependencies change
 */
export function useDeepCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: unknown[]
): T {
  const ref = useRef<T>(callback);
  const prevDeps = useRef<unknown[]>(dependencies);

  if (!deepEqual(prevDeps.current, dependencies)) {
    ref.current = callback;
    prevDeps.current = dependencies;
  }

  return ref.current;
}

/**
 * Previous value hook - returns the previous value of a variable
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return [elementRef as React.RefObject<HTMLElement>, isIntersecting];
}

/**
 * Lazy component loading with intersection observer
 */
export function useLazyLoad(
  threshold = 0.1
): [React.RefObject<HTMLElement>, boolean, boolean] {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold });
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return [ref, isIntersecting, hasLoaded];
}

/**
 * Request Animation Frame hook for smooth animations
 */
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
}

/**
 * Virtual list hook for rendering large lists efficiently
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 3
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length, visibleEnd + overscan);

  const visibleItems = useMemo(
    () =>
      items.slice(startIndex, endIndex).map((item, index) => ({
        item,
        index: startIndex + index,
        style: {
          position: "absolute" as const,
          top: (startIndex + index) * itemHeight,
          height: itemHeight,
          left: 0,
          right: 0,
        },
      })),
    [items, startIndex, endIndex, itemHeight]
  );

  const totalHeight = items.length * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop((e.target as HTMLElement).scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    onScroll,
    containerStyle: {
      position: "relative" as const,
      height: containerHeight,
      overflow: "auto" as const,
    },
  };
}

/**
 * Image preloader for faster image rendering
 */
export function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        })
    )
  );
}

/**
 * Local storage with expiration
 */
export function setWithExpiry<T>(key: string, value: T, ttlMs: number): void {
  const item = {
    value,
    expiry: Date.now() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value as T;
  } catch {
    return null;
  }
}

/**
 * Batch updates hook - batches rapid state updates
 */
export function useBatchedUpdates<T>(
  initialValue: T,
  delay = 16
): [T, (updater: (prev: T) => T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const pendingUpdates = useRef<((prev: T) => T)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedSetValue = useCallback(
    (updater: (prev: T) => T) => {
      pendingUpdates.current.push(updater);

      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setValue((prev) => {
            let result = prev;
            for (const update of pendingUpdates.current) {
              result = update(result);
            }
            pendingUpdates.current = [];
            timeoutRef.current = undefined;
            return result;
          });
        }, delay);
      }
    },
    [delay]
  );

  return [value, batchedSetValue];
}

/**
 * Performance measurement utilities
 */
export const perf = {
  mark: (name: string) => {
    if (typeof performance !== "undefined") {
      performance.mark(name);
    }
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof performance !== "undefined") {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        return entries[entries.length - 1]?.duration;
      } catch {
        return null;
      }
    }
    return null;
  },
  clearMarks: () => {
    if (typeof performance !== "undefined") {
      performance.clearMarks();
    }
  },
  clearMeasures: () => {
    if (typeof performance !== "undefined") {
      performance.clearMeasures();
    }
  },
};

/**
 * Deep equality check
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (
      !keysB.includes(key) ||
      !deepEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Memory-efficient memoization with LRU cache
 */
export function createLRUCache<K, V>(maxSize: number) {
  const cache = new Map<K, V>();

  return {
    get(key: K): V | undefined {
      if (!cache.has(key)) return undefined;
      const value = cache.get(key)!;
      // Move to end (most recently used)
      cache.delete(key);
      cache.set(key, value);
      return value;
    },
    set(key: K, value: V): void {
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= maxSize) {
        // Remove oldest (first item)
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }
      cache.set(key, value);
    },
    clear(): void {
      cache.clear();
    },
    size(): number {
      return cache.size;
    },
  };
}
