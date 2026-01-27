"use client";

/**
 * Demo Mode Switcher
 * Interface flottante pour basculer entre les plans d'abonnement en mode test
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoMode, DEMO_PLANS, type DemoPlan } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Beaker,
  X,
  Check,
  Crown,
  Zap,
  Building2,
  User,
  Sparkles,
  Bot,
  FileText,
  Lock,
  Headphones,
  Code,
  LayoutTemplate,
  Users,
  Plug,
  BarChart3,
  Palette,
} from "lucide-react";

const PLAN_ICONS = {
  free: User,
  pro: Zap,
  business: Building2,
  corporate: Crown,
};

const FEATURE_ICONS: Record<string, any> = {
  ai_assistant: Bot,
  pdf_export: FileText,
  pdf_protection: Lock,
  priority_support: Headphones,
  api_access: Code,
  custom_templates: LayoutTemplate,
  team_members: Users,
  integrations: Plug,
  analytics: BarChart3,
  white_label: Palette,
};

export function DemoModeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDemoMode, demoPlan, setDemoPlan, disableDemoMode } = useDemoMode();

  // Ne montrer qu'en développement
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const plans: Exclude<DemoPlan, null>[] = ["free", "pro", "business", "corporate"];

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 left-4 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          isDemoMode
            ? "bg-gradient-to-r from-[#C9A962] to-[#1E3A5F] text-white"
            : "bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#C9A962] hover:text-[#C9A962]"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        title="Mode Démo - Tester les plans"
      >
        <Beaker className="h-6 w-6" />
        {isDemoMode && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Badge du plan actif */}
      {isDemoMode && demoPlan && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-5 left-20 z-50"
        >
          <Badge
            className={`${DEMO_PLANS[demoPlan].color} text-white px-3 py-1 text-sm font-medium`}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Mode {DEMO_PLANS[demoPlan].displayName}
          </Badge>
        </motion.div>
      )}

      {/* Panel de sélection */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-20 left-4 z-50 w-[420px] max-h-[80vh] overflow-y-auto"
            >
              <Card className="shadow-2xl border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Beaker className="h-5 w-5 text-[#C9A962]" />
                      Mode Démo
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Testez l'application avec différents niveaux d'abonnement
                  </p>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Désactiver le mode démo */}
                  {isDemoMode && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        disableDemoMode();
                        setIsOpen(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                      Désactiver le mode démo
                    </Button>
                  )}

                  {/* Plans */}
                  <div className="grid gap-2">
                    {plans.map((plan) => {
                      const config = DEMO_PLANS[plan];
                      const Icon = PLAN_ICONS[plan];
                      const isActive = demoPlan === plan;

                      return (
                        <button
                          key={plan}
                          onClick={() => {
                            setDemoPlan(plan);
                          }}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            isActive
                              ? "border-[#C9A962] bg-[#C9A962]/10"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                  plan === "corporate"
                                    ? "bg-gradient-to-r from-[#C9A962] to-[#1E3A5F]"
                                    : config.color
                                } text-white`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {config.displayName}
                                  </span>
                                  {isActive && (
                                    <Check className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {config.maxQuotes === -1
                                    ? "Devis illimités"
                                    : `${config.maxQuotes} devis/mois`}
                                  {" • "}
                                  {config.maxSectors === -1
                                    ? "Tous secteurs"
                                    : `${config.maxSectors} secteur${config.maxSectors > 1 ? "s" : ""}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Features rapides */}
                          <div className="mt-3 flex flex-wrap gap-1">
                            {Object.entries(config.features).map(([key, value]) => {
                              if (typeof value === "boolean" && value) {
                                const FeatureIcon = FEATURE_ICONS[key];
                                return (
                                  <Badge
                                    key={key}
                                    variant="secondary"
                                    className="text-xs gap-1"
                                  >
                                    {FeatureIcon && (
                                      <FeatureIcon className="h-3 w-3" />
                                    )}
                                    {key.replace(/_/g, " ")}
                                  </Badge>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                      Le mode démo simule les restrictions et fonctionnalités
                      de chaque plan sans modifier votre abonnement réel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
