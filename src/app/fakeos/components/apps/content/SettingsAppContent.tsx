"use client";

import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useUIMode } from "@/contexts/ui-mode-context";

const settingsSections = [
  {
    title: "Compte",
    items: [
      { icon: User, label: "Profil", href: "/profile", color: "bg-blue-500" },
      { icon: Bell, label: "Notifications", href: "/settings/notifications", color: "bg-red-500" },
      { icon: Shield, label: "Sécurité", href: "/settings/security", color: "bg-green-500" },
    ],
  },
  {
    title: "Préférences",
    items: [
      { icon: Palette, label: "Apparence", href: "/settings/appearance", color: "bg-purple-500" },
      { icon: Globe, label: "Langue", href: "/settings/language", color: "bg-cyan-500" },
      { icon: Smartphone, label: "Mode Interface", special: "ui-mode", color: "bg-orange-500" },
    ],
  },
  {
    title: "Abonnement",
    items: [
      { icon: CreditCard, label: "Abonnement", href: "/settings/subscription", color: "bg-amber-500" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Aide", href: "/help", color: "bg-indigo-500" },
    ],
  },
];

export function SettingsAppContent() {
  const { theme, setTheme } = useTheme();
  const { mode, setMode } = useUIMode();

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <motion.div
        className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-full bg-deal-coral flex items-center justify-center">
          <span className="text-white font-bold text-2xl">JD</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Jean Dupont
          </h2>
          <p className="text-sm text-gray-500 dark:text-white/50">
            jean@dupont-electricite.be
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-deal-coral/10 text-deal-coral text-xs font-medium rounded-full">
            Pro
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </motion.div>

      {/* Theme Toggle */}
      <motion.div
        className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-purple-500" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              Mode {theme === "dark" ? "sombre" : "clair"}
            </span>
          </div>
          <motion.button
            className="w-14 h-8 rounded-full bg-gray-200 dark:bg-white/20 p-1 flex items-center"
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              if (navigator.vibrate) navigator.vibrate(20);
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-6 h-6 rounded-full bg-white dark:bg-deal-coral shadow"
              animate={{ x: theme === "dark" ? 22 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* UI Mode Toggle */}
      <motion.div
        className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-gray-900 dark:text-white">
              Mode Interface
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            className={`p-3 rounded-xl text-center transition-colors ${
              mode === "fakeos"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60"
            }`}
            onClick={() => setMode("fakeos")}
            whileTap={{ scale: 0.95 }}
          >
            <Smartphone className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Fake OS</span>
          </motion.button>
          <motion.button
            className={`p-3 rounded-xl text-center transition-colors ${
              mode === "classic"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60"
            }`}
            onClick={() => setMode("classic")}
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-medium">Classique</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + sectionIndex * 0.1 }}
        >
          <h3 className="text-xs font-semibold text-gray-500 dark:text-white/50 uppercase tracking-wider px-2">
            {section.title}
          </h3>
          <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
            {section.items.map((item, itemIndex) => (
              <motion.button
                key={item.label}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                  itemIndex > 0 ? "border-t border-gray-100 dark:border-white/10" : ""
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout Button */}
      <motion.button
        className="w-full p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center gap-2 text-red-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.98 }}
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Déconnexion</span>
      </motion.button>
    </div>
  );
}
