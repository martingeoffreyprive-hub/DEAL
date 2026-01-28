"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomSheetItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description?: string;
  href: string;
  variant?: "default" | "destructive";
  onClick?: () => void;
}

interface BottomSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: BottomSheetItem[];
}

export function BottomSheetMenu({ isOpen, onClose, title, items }: BottomSheetMenuProps) {
  const router = useRouter();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleItemClick = useCallback((item: BottomSheetItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      router.push(item.href);
    }
    onClose();
  }, [router, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-[#1E2235] rounded-t-3xl shadow-xl"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2
                id="sheet-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Items */}
            <div className="px-4 pb-4 space-y-1">
              {items.map((item, index) => {
                const Icon = item.icon;
                const isDestructive = item.variant === "destructive";

                return (
                  <motion.button
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-left",
                      "transition-colors",
                      isDestructive
                        ? "hover:bg-red-50 dark:hover:bg-red-500/10"
                        : "hover:bg-gray-100 dark:hover:bg-white/5"
                    )}
                    onClick={() => handleItemClick(item)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl",
                        isDestructive
                          ? "bg-red-100 dark:bg-red-500/20"
                          : "bg-gray-100 dark:bg-white/10"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isDestructive
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-700 dark:text-gray-300"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={cn(
                          "font-medium",
                          isDestructive
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
