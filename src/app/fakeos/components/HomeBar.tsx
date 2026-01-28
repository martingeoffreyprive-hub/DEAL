"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Layers } from "lucide-react";
import { useFakeOS } from "../context";

interface HomeBarProps {
  onRecentAppsClick?: () => void;
  onBackClick?: () => void;
}

export function HomeBar({ onRecentAppsClick, onBackClick }: HomeBarProps) {
  const { isAppOpen, closeApp } = useFakeOS();

  const handleHomeClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    if (isAppOpen) {
      closeApp();
    }
  };

  const handleBackClick = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (onBackClick) {
      onBackClick();
    } else if (isAppOpen) {
      closeApp();
    }
  };

  const handleRecentAppsClick = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    if (onRecentAppsClick) {
      onRecentAppsClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative z-50 px-4 pb-2"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="flex items-center justify-center gap-6 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/10">
        {/* Back button */}
        <motion.button
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.9 }}
          onClick={handleBackClick}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Home button (pill) - Larger tap area */}
        <motion.button
          className="relative w-28 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"
          whileTap={{ scale: 0.95, backgroundColor: "rgba(255,255,255,0.2)" }}
          onClick={handleHomeClick}
        >
          <div className="w-16 h-1.5 rounded-full bg-white/80" />
        </motion.button>

        {/* Recent apps button */}
        <motion.button
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.9 }}
          onClick={handleRecentAppsClick}
        >
          <Layers className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
