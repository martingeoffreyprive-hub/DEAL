"use client";

import { useState, useCallback, useRef, type TouchEvent } from "react";

export type SwipeDirection = "left" | "right" | "up" | "down" | null;

interface SwipeState {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
}

interface SwipeConfig {
  threshold?: number; // Minimum distance to trigger swipe (default: 50px)
  velocityThreshold?: number; // Minimum velocity to trigger swipe (default: 0.3)
  preventDefaultOnSwipe?: boolean; // Prevent default touch behavior
}

interface UseSwipeGestureReturn {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  swipeState: SwipeState;
  isSwiping: boolean;
}

export function useSwipeGesture(
  onSwipe?: (direction: SwipeDirection, distance: number) => void,
  config: SwipeConfig = {}
): UseSwipeGestureReturn {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    preventDefaultOnSwipe = false,
  } = config;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    direction: null,
    distance: 0,
    velocity: 0,
  });
  const [isSwiping, setIsSwiping] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchCurrentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
    setIsSwiping(true);
    setSwipeState({ direction: null, distance: 0, velocity: 0 });
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    touchCurrentRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    let direction: SwipeDirection = null;
    let distance = 0;

    // Determine primary swipe direction
    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? "right" : "left";
      distance = absX;
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? "down" : "up";
      distance = absY;
    }

    // Calculate velocity
    const elapsed = Date.now() - touchStartRef.current.time;
    const velocity = distance / (elapsed || 1);

    setSwipeState({ direction, distance, velocity });

    // Prevent default if swiping horizontally and configured
    if (preventDefaultOnSwipe && absX > absY && absX > 10) {
      e.preventDefault();
    }
  }, [preventDefaultOnSwipe]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || !touchCurrentRef.current) {
      setIsSwiping(false);
      return;
    }

    const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
    const deltaY = touchCurrentRef.current.y - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    const elapsed = Date.now() - touchStartRef.current.time;
    const distance = Math.max(absX, absY);
    const velocity = distance / (elapsed || 1);

    // Check if swipe meets thresholds
    if (distance >= threshold || velocity >= velocityThreshold) {
      let direction: SwipeDirection = null;

      if (absX > absY) {
        direction = deltaX > 0 ? "right" : "left";
      } else {
        direction = deltaY > 0 ? "down" : "up";
      }

      // Trigger callback
      if (onSwipe && direction) {
        onSwipe(direction, distance);
      }

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }

    // Reset
    touchStartRef.current = null;
    touchCurrentRef.current = null;
    setIsSwiping(false);
    setSwipeState({ direction: null, distance: 0, velocity: 0 });
  }, [onSwipe, threshold, velocityThreshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    swipeState,
    isSwiping,
  };
}

/**
 * Hook for pull-to-refresh gesture
 */
interface UsePullToRefreshReturn {
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
}

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  config: { threshold?: number; maxPull?: number } = {}
): UsePullToRefreshReturn {
  const { threshold = 80, maxPull = 120 } = config;

  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const touchStartY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    // Only enable pull-to-refresh when at top of scroll
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartY.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY.current;

    if (delta > 0) {
      // Apply resistance
      const resistance = 0.5;
      const distance = Math.min(delta * resistance, maxPull);
      setPullDistance(distance);

      // Prevent default scroll
      if (delta > 10) {
        e.preventDefault();
      }
    }
  }, [isRefreshing, maxPull]);

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
    touchStartY.current = null;
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    pullDistance,
    isPulling,
    isRefreshing,
  };
}
