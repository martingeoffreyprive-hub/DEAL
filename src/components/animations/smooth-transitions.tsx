"use client";

import { ReactNode, forwardRef } from "react";
import { motion, AnimatePresence, Variants, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================
// ANIMATION VARIANTS
// ============================================

// Page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// Fade variants
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Scale variants
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// Slide variants
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: 15, transition: { duration: 0.2 } },
};

export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.2 } },
};

export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: 15, transition: { duration: 0.2 } },
};

// Stagger container variants
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
};

// Pop variants (for buttons, icons)
export const popVariants: Variants = {
  initial: { scale: 0 },
  animate: {
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 }
  },
  exit: { scale: 0, transition: { duration: 0.15 } },
};

// Bounce variants
export const bounceVariants: Variants = {
  initial: { scale: 0, y: 50 },
  animate: {
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

// List item variants for staggered lists
export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// ============================================
// MOTION COMPONENTS
// ============================================

interface MotionDivProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

// Fade In Component
export const FadeIn = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = "FadeIn";

// Scale In Component
export const ScaleIn = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={scaleVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
ScaleIn.displayName = "ScaleIn";

// Slide In Component
interface SlideInProps extends MotionDivProps {
  direction?: "up" | "down" | "left" | "right";
}

export const SlideIn = forwardRef<HTMLDivElement, SlideInProps>(
  ({ children, className, direction = "up", ...props }, ref) => {
    const variants = {
      up: slideUpVariants,
      down: slideDownVariants,
      left: slideLeftVariants,
      right: slideRightVariants,
    };

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[direction]}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideIn.displayName = "SlideIn";

// Stagger Container
export const StaggerContainer = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      variants={staggerContainerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerContainer.displayName = "StaggerContainer";

// Stagger Item
export const StaggerItem = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerItemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = "StaggerItem";

// Pop In Component (for icons, buttons)
export const PopIn = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={popVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
PopIn.displayName = "PopIn";

// Bounce In Component
export const BounceIn = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="initial"
      animate="animate"
      variants={bounceVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
BounceIn.displayName = "BounceIn";

// ============================================
// INTERACTIVE COMPONENTS
// ============================================

// Hover Scale
interface HoverScaleProps extends MotionDivProps {
  scale?: number;
}

export const HoverScale = forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ children, className, scale = 1.02, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
HoverScale.displayName = "HoverScale";

// Hover Lift (scale + shadow)
export const HoverLift = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ y: 0, scale: 0.99 }}
      className={cn("transition-shadow hover:shadow-lg", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);
HoverLift.displayName = "HoverLift";

// Press Scale
export const PressScale = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
PressScale.displayName = "PressScale";

// Shake on Error
interface ShakeProps extends MotionDivProps {
  trigger?: boolean;
}

export const Shake = forwardRef<HTMLDivElement, ShakeProps>(
  ({ children, className, trigger = false, ...props }, ref) => (
    <motion.div
      ref={ref}
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      } : {}}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
Shake.displayName = "Shake";

// ============================================
// PRESENCE WRAPPERS
// ============================================

interface AnimatedPresenceProps {
  children: ReactNode;
  mode?: "sync" | "wait" | "popLayout";
}

export function AnimatedPresenceWrapper({ children, mode = "wait" }: AnimatedPresenceProps) {
  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  );
}

// ============================================
// SKELETON LOADERS WITH ANIMATION
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function AnimatedSkeleton({
  className,
  variant = "text",
  width,
  height
}: SkeletonProps) {
  const baseStyles = "bg-muted animate-pulse";

  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
    />
  );
}

// ============================================
// SUCCESS / ERROR ANIMATIONS
// ============================================

interface StatusAnimationProps {
  status: "success" | "error" | "loading";
  children: ReactNode;
  className?: string;
}

export function StatusAnimation({ status, children, className }: StatusAnimationProps) {
  const variants: Record<string, Variants> = {
    success: {
      initial: { scale: 0, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      },
    },
    error: {
      initial: { x: 0 },
      animate: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      },
    },
    loading: {
      initial: { opacity: 0.5 },
      animate: {
        opacity: [0.5, 1, 0.5],
        transition: { duration: 1.5, repeat: Infinity }
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants[status]}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// NUMBER COUNTER ANIMATION
// ============================================

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
  formatter = (v) => Math.round(v).toString()
}: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {formatter(value)}
      </motion.span>
    </motion.span>
  );
}

// ============================================
// REVEAL ON SCROLL
// ============================================

interface RevealOnScrollProps extends MotionDivProps {
  threshold?: number;
}

export const RevealOnScroll = forwardRef<HTMLDivElement, RevealOnScrollProps>(
  ({ children, className, threshold = 0.1, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
);
RevealOnScroll.displayName = "RevealOnScroll";
