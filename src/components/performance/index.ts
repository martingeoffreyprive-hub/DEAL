export { WebVitals, usePerformanceMetrics, PerformanceOverlay } from "./web-vitals";
export {
  LazyComponent,
  createLazyComponent,
  CardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  ProfileSkeleton,
} from "./lazy-component";
export {
  prefetchRoutes,
  preloadCriticalResources,
  preconnectOrigins,
  createLazyLoader,
  debounce,
  throttle,
  prefersReducedMotion,
  getConnectionQuality,
  shouldLoadHighQuality,
} from "@/lib/performance/prefetch";
