"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  Plus,
  Wallet,
  User,
  Mic,
  PenLine,
  LayoutTemplate,
  BarChart3,
  Receipt,
  Settings,
  LogOut,
  Clock,
  FileCheck,
  FilePen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheetMenu, type BottomSheetItem } from "./bottom-sheet-menu";

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  isFab?: boolean;
  longPressItems?: BottomSheetItem[];
}

const navItems: NavItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Accueil",
    href: "/dashboard",
    longPressItems: [
      { id: "stats", icon: BarChart3, label: "Stats rapides", href: "/analytics" },
      { id: "recent", icon: Clock, label: "Activité récente", href: "/dashboard" },
    ],
  },
  {
    id: "quotes",
    icon: FileText,
    label: "Devis",
    href: "/quotes",
    longPressItems: [
      { id: "recent", icon: Clock, label: "Récents", href: "/quotes?filter=recent" },
      { id: "draft", icon: FilePen, label: "Brouillons", href: "/quotes?status=draft" },
      { id: "signed", icon: FileCheck, label: "Signés", href: "/quotes?status=signed" },
    ],
  },
  {
    id: "create",
    icon: Plus,
    label: "Créer",
    href: "/quotes/new",
    isFab: true,
    longPressItems: [
      { id: "vocal", icon: Mic, label: "Dictée vocale", href: "/quotes/new?mode=vocal" },
      { id: "manual", icon: PenLine, label: "Saisie manuelle", href: "/quotes/new?mode=manual" },
      { id: "template", icon: LayoutTemplate, label: "Depuis template", href: "/quotes/new?mode=template" },
    ],
  },
  {
    id: "finance",
    icon: Wallet,
    label: "Finance",
    href: "/analytics",
    longPressItems: [
      { id: "ca", icon: BarChart3, label: "CA du mois", href: "/analytics" },
      { id: "invoices", icon: Receipt, label: "Factures", href: "/invoices" },
    ],
  },
  {
    id: "profile",
    icon: User,
    label: "Profil",
    href: "/profile",
    longPressItems: [
      { id: "settings", icon: Settings, label: "Paramètres", href: "/settings/subscription" },
      { id: "logout", icon: LogOut, label: "Déconnexion", href: "/auth/logout", variant: "destructive" },
    ],
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const handleTouchStart = useCallback((item: NavItem) => {
    setPressedItem(item.id);
    if (item.longPressItems && item.longPressItems.length > 0) {
      longPressTimer.current = setTimeout(() => {
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        setActiveSheet(item.id);
        setPressedItem(null);
      }, 500);
    }
  }, []);

  const handleTouchEnd = useCallback((item: NavItem) => {
    setPressedItem(null);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      // Only navigate if we didn't trigger long press
      if (!activeSheet) {
        router.push(item.href);
      }
    }
  }, [activeSheet, router]);

  const handleTouchCancel = useCallback(() => {
    setPressedItem(null);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Bottom Navigation Bar - part of flex layout, not fixed */}
      <nav
        className="relative z-50 lg:hidden flex-shrink-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-white/85 dark:bg-[#252B4A]/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" />

        {/* Navigation items */}
        <div className="relative flex items-center justify-around px-1 sm:px-2 h-16">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            if (item.isFab) {
              // FAB (Floating Action Button) style for Create
              return (
                <motion.button
                  key={item.id}
                  className="relative -mt-6"
                  onTouchStart={() => handleTouchStart(item)}
                  onTouchEnd={() => handleTouchEnd(item)}
                  onTouchCancel={handleTouchCancel}
                  onMouseDown={() => handleTouchStart(item)}
                  onMouseUp={() => handleTouchEnd(item)}
                  onMouseLeave={handleTouchCancel}
                  whileTap={{ scale: 0.95 }}
                  aria-label={item.label}
                >
                  <motion.div
                    className={cn(
                      "flex items-center justify-center w-14 h-14 rounded-full",
                      "bg-gradient-to-br from-[#E85A5A] to-[#D64545]",
                      "shadow-lg shadow-[#E85A5A]/30",
                      pressedItem === item.id && "scale-95"
                    )}
                    animate={{
                      scale: pressedItem === item.id ? 0.95 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </motion.div>
                </motion.button>
              );
            }

            // Regular nav items
            return (
              <motion.button
                key={item.id}
                className="relative flex flex-col items-center justify-center flex-1 max-w-[72px] h-full"
                onTouchStart={() => handleTouchStart(item)}
                onTouchEnd={() => handleTouchEnd(item)}
                onTouchCancel={handleTouchCancel}
                onMouseDown={() => handleTouchStart(item)}
                onMouseUp={() => handleTouchEnd(item)}
                onMouseLeave={handleTouchCancel}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                <motion.div
                  className="flex flex-col items-center gap-1"
                  animate={{
                    scale: active ? 1.1 : pressedItem === item.id ? 0.95 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    animate={{
                      color: active ? "#E85A5A" : "#64748B",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon
                      className="w-7 h-7"
                      fill={active ? "currentColor" : "none"}
                      strokeWidth={active ? 1.5 : 2}
                    />
                  </motion.div>
                  <motion.span
                    className="text-xs font-medium"
                    animate={{
                      color: active ? "#E85A5A" : "#64748B",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>

                {/* Active indicator - LARGER */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#E85A5A]"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Sheet Menus */}
      {navItems.map((item) => (
        item.longPressItems && (
          <BottomSheetMenu
            key={item.id}
            isOpen={activeSheet === item.id}
            onClose={() => setActiveSheet(null)}
            title={item.label}
            items={item.longPressItems}
          />
        )
      ))}

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
    </>
  );
}
