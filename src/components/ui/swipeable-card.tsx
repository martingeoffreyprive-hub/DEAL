"use client";

import { useState, useCallback, useRef, type ReactNode, type TouchEvent } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Archive, MoreHorizontal, Trash2, Edit, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  className?: string;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  swipeThreshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

const defaultLeftActions: SwipeAction[] = [
  {
    id: "edit",
    icon: Edit,
    label: "Modifier",
    color: "text-white",
    bgColor: "bg-blue-500",
    onClick: () => {},
  },
  {
    id: "send",
    icon: Send,
    label: "Envoyer",
    color: "text-white",
    bgColor: "bg-green-500",
    onClick: () => {},
  },
];

const defaultRightActions: SwipeAction[] = [
  {
    id: "archive",
    icon: Archive,
    label: "Archiver",
    color: "text-white",
    bgColor: "bg-amber-500",
    onClick: () => {},
  },
  {
    id: "delete",
    icon: Trash2,
    label: "Supprimer",
    color: "text-white",
    bgColor: "bg-red-500",
    onClick: () => {},
  },
];

export function SwipeableCard({
  children,
  className,
  leftActions = defaultLeftActions,
  rightActions = defaultRightActions,
  swipeThreshold = 80,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
}: SwipeableCardProps) {
  const [isSwipingLeft, setIsSwipingLeft] = useState(false);
  const [isSwipingRight, setIsSwipingRight] = useState(false);
  const [showActions, setShowActions] = useState<"left" | "right" | null>(null);

  const x = useMotionValue(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // Transform for opacity of action buttons
  const leftActionsOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);
  const rightActionsOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    // Only handle horizontal swipes
    if (isHorizontalSwipe.current) {
      e.preventDefault();

      // Apply resistance at edges
      const resistance = 0.5;
      const maxSwipe = 160;
      let newX = deltaX * resistance;

      // Clamp to max
      newX = Math.max(-maxSwipe, Math.min(maxSwipe, newX));

      x.set(newX);

      setIsSwipingLeft(deltaX < 0);
      setIsSwipingRight(deltaX > 0);
    }
  }, [disabled, x]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;

    const currentX = x.get();

    if (Math.abs(currentX) >= swipeThreshold) {
      if (currentX > 0 && onSwipeRight) {
        // Swiped right
        setShowActions("left");
        if (navigator.vibrate) navigator.vibrate(20);
        onSwipeRight();
      } else if (currentX < 0 && onSwipeLeft) {
        // Swiped left
        setShowActions("right");
        if (navigator.vibrate) navigator.vibrate(20);
        onSwipeLeft();
      }
    }

    // Reset position with animation
    x.set(0);
    setIsSwipingLeft(false);
    setIsSwipingRight(false);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  }, [disabled, x, swipeThreshold, onSwipeLeft, onSwipeRight]);

  const handleActionClick = useCallback((action: SwipeAction) => {
    action.onClick();
    setShowActions(null);
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  const closeActions = useCallback(() => {
    setShowActions(null);
  }, []);

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Left Actions (shown when swiping right) */}
      <motion.div
        className="absolute inset-y-0 left-0 flex items-center gap-2 px-4"
        style={{ opacity: leftActionsOpacity }}
      >
        {leftActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-xl",
                action.bgColor,
                action.color
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{action.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Right Actions (shown when swiping left) */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center gap-2 px-4"
        style={{ opacity: rightActionsOpacity }}
      >
        {rightActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-xl",
                action.bgColor,
                action.color
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{action.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative bg-background z-10"
        style={{ x }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>

      {/* Action overlay when locked open */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-end bg-background/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeActions}
          >
            <div className="flex items-center gap-3 px-4">
              {(showActions === "right" ? rightActions : leftActions).map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(action);
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center w-16 h-16 rounded-xl",
                      action.bgColor,
                      action.color
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs mt-1">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
