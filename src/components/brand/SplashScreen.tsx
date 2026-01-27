"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DealIconD } from "./DealIconD";
import { DealLogoFull } from "./DealLogoFull";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showWordmark, setShowWordmark] = useState(false);

  useEffect(() => {
    // Show wordmark after icon animation
    const wordmarkTimer = setTimeout(() => {
      setShowWordmark(true);
    }, 800);

    // Complete splash screen
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(wordmarkTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A]"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #C9A962 1px, transparent 1px),
                                  radial-gradient(circle at 75% 75%, #C9A962 1px, transparent 1px)`,
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          {/* Logo Container */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1], // Bouncy spring
              }}
            >
              <DealIconD size="2xl" variant="white" />
            </motion.div>

            {/* Animated Wordmark */}
            <AnimatePresence>
              {showWordmark && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                >
                  {/* PAS de slogan sur le splash screen - guidelines branding */}
                  <DealLogoFull size="xl" variant="white" showTagline={false} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
              className="mt-8"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#C9A962]"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Version tag */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.5, duration: 0.3 }}
            className="absolute bottom-8 text-xs text-white/50 font-mono"
          >
            v1.0.0 Enterprise
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
