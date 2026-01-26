"use client";

import { motion } from "framer-motion";
import { DealIconD } from "./DealIconD";
import { cn } from "@/lib/utils";

interface DealLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: { icon: "sm" as const, text: "text-xs" },
  md: { icon: "md" as const, text: "text-sm" },
  lg: { icon: "lg" as const, text: "text-base" },
};

export function DealLoadingSpinner({
  size = "md",
  text = "Chargement...",
  className,
}: DealLoadingSpinnerProps) {
  const config = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <DealIconD size={config.icon} variant="primary" />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn("text-muted-foreground", config.text)}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function DealLoadingPage({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <DealLoadingSpinner size="lg" text={text} />
    </div>
  );
}
