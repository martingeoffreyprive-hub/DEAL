"use client";

import { Suspense, lazy, ComponentType, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LazyComponentProps {
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Wrapper for lazy-loaded components with a default loading state
 */
export function LazyComponent({ fallback, children }: LazyComponentProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}

/**
 * Create a lazy-loaded component with a loading skeleton
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) {
  const LazyComp = lazy(importFn);

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyComponent fallback={fallback}>
        <LazyComp {...props} />
      </LazyComponent>
    );
  };
}

/**
 * Skeleton loader for cards
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-10 bg-muted rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-muted/50 rounded" />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for charts
 */
export function ChartSkeleton() {
  return (
    <div className="h-64 bg-muted rounded-lg animate-pulse flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

/**
 * Skeleton loader for profile/avatar
 */
export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-muted" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-3 bg-muted rounded w-32" />
      </div>
    </div>
  );
}
