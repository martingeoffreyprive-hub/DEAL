"use client";

/**
 * Settings - Appearance Page
 * Thèmes, Mode Chantier, Accessibilité
 */

import { motion } from "framer-motion";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

export default function AppearanceSettingsPage() {
  return (
    <>
      <div className="container max-w-4xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Palette className="h-8 w-8 text-[#C9A962]" />
              Apparence
            </h1>
            <p className="text-muted-foreground mt-2">
              Personnalisez l'interface selon vos préférences et conditions de travail
            </p>
          </div>

          {/* Theme Selector Component */}
          <ThemeSelector />
        </motion.div>
      </div>
    </>
  );
}
