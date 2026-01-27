"use client";

/**
 * Demo Mode Context
 * Permet de simuler différents niveaux d'abonnement pour les tests
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type DemoPlan = "free" | "pro" | "business" | "corporate" | null;

interface DemoModeContextType {
  isDemoMode: boolean;
  demoPlan: DemoPlan;
  setDemoPlan: (plan: DemoPlan) => void;
  enableDemoMode: (plan: DemoPlan) => void;
  disableDemoMode: () => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

// Configuration des plans de démo
export const DEMO_PLANS = {
  free: {
    name: "Free",
    displayName: "Gratuit",
    color: "bg-gray-500",
    maxSectors: 1,
    maxQuotes: 5,
    features: {
      ai_assistant: false,
      pdf_export: true,
      pdf_protection: false,
      priority_support: false,
      api_access: false,
      custom_templates: false,
      team_members: 0,
      integrations: false,
      analytics: false,
      white_label: false,
    },
  },
  pro: {
    name: "Pro",
    displayName: "Pro",
    color: "bg-blue-500",
    maxSectors: 10,
    maxQuotes: 100,
    features: {
      ai_assistant: true,
      pdf_export: true,
      pdf_protection: true,
      priority_support: false,
      api_access: false,
      custom_templates: true,
      team_members: 3,
      integrations: true,
      analytics: true,
      white_label: false,
    },
  },
  business: {
    name: "Business",
    displayName: "Business",
    color: "bg-purple-500",
    maxSectors: -1, // Illimité
    maxQuotes: -1, // Illimité
    features: {
      ai_assistant: true,
      pdf_export: true,
      pdf_protection: true,
      priority_support: true,
      api_access: true,
      custom_templates: true,
      team_members: 10,
      integrations: true,
      analytics: true,
      white_label: false,
    },
  },
  corporate: {
    name: "Corporate",
    displayName: "Corporate (All-In)",
    color: "bg-gradient-to-r from-[#C9A962] to-[#1E3A5F]",
    maxSectors: -1,
    maxQuotes: -1,
    features: {
      ai_assistant: true,
      pdf_export: true,
      pdf_protection: true,
      priority_support: true,
      api_access: true,
      custom_templates: true,
      team_members: -1, // Illimité
      integrations: true,
      analytics: true,
      white_label: true,
      dedicated_support: true,
      sla_guarantee: true,
      custom_development: true,
    },
  },
} as const;

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoPlan, setDemoPlanState] = useState<DemoPlan>(null);
  const [mounted, setMounted] = useState(false);

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deal_demo_plan");
      if (saved && (saved === "free" || saved === "pro" || saved === "business" || saved === "corporate")) {
        setDemoPlanState(saved as DemoPlan);
      }
    }
  }, []);

  const setDemoPlan = (plan: DemoPlan) => {
    setDemoPlanState(plan);
    if (typeof window !== "undefined") {
      if (plan) {
        localStorage.setItem("deal_demo_plan", plan);
      } else {
        localStorage.removeItem("deal_demo_plan");
      }
    }
  };

  const enableDemoMode = (plan: DemoPlan) => {
    setDemoPlan(plan);
  };

  const disableDemoMode = () => {
    setDemoPlan(null);
  };

  return (
    <DemoModeContext.Provider
      value={{
        // Avant le montage, on retourne des valeurs par défaut cohérentes
        isDemoMode: mounted ? demoPlan !== null : false,
        demoPlan: mounted ? demoPlan : null,
        setDemoPlan,
        enableDemoMode,
        disableDemoMode,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error("useDemoMode must be used within a DemoModeProvider");
  }
  return context;
}

// Hook pour obtenir les features du plan de démo actuel
export function useDemoFeatures() {
  const { demoPlan } = useDemoMode();

  if (!demoPlan) return null;

  return DEMO_PLANS[demoPlan];
}
