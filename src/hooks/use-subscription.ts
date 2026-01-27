"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type SubscriptionPlan,
  type Subscription,
  type UserSector,
  type UsageStats,
  type Plan,
  type SectorType,
  PLAN_FEATURES,
} from "@/types/database";

// Import conditionnel pour éviter les erreurs si le contexte n'est pas disponible
let useDemoModeHook: any = () => ({ isDemoMode: false, demoPlan: null });
let DEMO_PLANS_DATA: any = {};

try {
  const demoModule = require("@/contexts/DemoModeContext");
  useDemoModeHook = demoModule.useDemoMode;
  DEMO_PLANS_DATA = demoModule.DEMO_PLANS;
} catch {
  // Context not available yet
}

interface SubscriptionState {
  plan: SubscriptionPlan | "corporate";
  subscription: Subscription | null;
  planDetails: Plan | null;
  userSectors: UserSector[];
  usage: UsageStats | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
}

interface SubscriptionActions {
  canCreateQuote: () => boolean;
  canUseSector: (sector: SectorType) => boolean;
  canUseAI: () => boolean;
  canExportPDF: () => boolean;
  canProtectPDF: () => boolean;
  canShowLogoOnPDF: () => boolean;
  canUseProFeatures: () => boolean;
  canUseAPI: () => boolean;
  canUseIntegrations: () => boolean;
  canUseAnalytics: () => boolean;
  canUseWhiteLabel: () => boolean;
  getMaxTeamMembers: () => number;
  getRemainingQuotes: () => number;
  getMaxSectors: () => number;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState & SubscriptionActions {
  // Essayer d'utiliser le mode démo (avec fallback si contexte non disponible)
  let demoMode = { isDemoMode: false, demoPlan: null as any };
  try {
    demoMode = useDemoModeHook();
  } catch {
    // Context not available
  }

  const { isDemoMode, demoPlan } = demoMode;

  const [state, setState] = useState<Omit<SubscriptionState, 'isDemoMode'>>({
    plan: "free",
    subscription: null,
    planDetails: null,
    userSectors: [],
    usage: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setState(prev => ({ ...prev, loading: false, error: "Non authentifié" }));
        return;
      }

      const [subscriptionRes, sectorsRes, usageRes, plansRes] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("user_sectors")
          .select("*")
          .eq("user_id", user.id),
        supabase
          .from("usage_stats")
          .select("*")
          .eq("user_id", user.id)
          .eq("month_year", new Date().toISOString().slice(0, 7))
          .single(),
        supabase
          .from("plans")
          .select("*"),
      ]);

      const subscription = subscriptionRes.data as Subscription | null;
      const planName = subscription?.plan_name || "free";
      const planDetails = plansRes.data?.find((p: Plan) => p.name === planName) as Plan | null;

      setState({
        plan: planName,
        subscription,
        planDetails,
        userSectors: (sectorsRes.data || []) as UserSector[],
        usage: usageRes.data as UsageStats | null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Erreur lors du chargement",
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Plan effectif (démo ou réel)
  const effectivePlan = useMemo(() => {
    if (isDemoMode && demoPlan) {
      return demoPlan;
    }
    return state.plan;
  }, [isDemoMode, demoPlan, state.plan]);

  // Configuration du plan de démo
  const demoConfig = useMemo(() => {
    if (isDemoMode && demoPlan && DEMO_PLANS_DATA[demoPlan]) {
      return DEMO_PLANS_DATA[demoPlan];
    }
    return null;
  }, [isDemoMode, demoPlan]);

  // Actions avec support du mode démo
  const canCreateQuote = useCallback(() => {
    if (demoConfig) {
      return demoConfig.maxQuotes === -1 || true; // En démo, on permet toujours
    }
    if (effectivePlan === "business" || effectivePlan === "corporate") return true;
    const maxQuotes = state.planDetails?.max_quotes_per_month ?? PLAN_FEATURES[state.plan].maxQuotes;
    if (maxQuotes === -1) return true;
    const currentCount = state.usage?.quotes_created ?? 0;
    return currentCount < maxQuotes;
  }, [effectivePlan, demoConfig, state.plan, state.planDetails, state.usage]);

  const canUseSector = useCallback((sector: SectorType) => {
    if (demoConfig) {
      return demoConfig.maxSectors === -1 || true;
    }
    if (effectivePlan === "business" || effectivePlan === "corporate") return true;
    return state.userSectors.some(s => s.sector === sector);
  }, [effectivePlan, demoConfig, state.userSectors]);

  const canUseAI = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.ai_assistant;
    }
    return state.planDetails?.ai_assistant_enabled ?? PLAN_FEATURES[state.plan]?.features?.includes('Assistant IA') ?? false;
  }, [demoConfig, state.plan, state.planDetails]);

  const canExportPDF = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.pdf_export;
    }
    return state.planDetails?.pdf_export_enabled ?? true;
  }, [demoConfig, state.planDetails]);

  const canProtectPDF = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.pdf_protection;
    }
    return state.planDetails?.pdf_protection_enabled ?? false;
  }, [demoConfig, state.planDetails]);

  const canShowLogoOnPDF = useCallback(() => {
    if (demoConfig) {
      return effectivePlan !== "free";
    }
    return effectivePlan === "pro" || effectivePlan === "business" || effectivePlan === "corporate";
  }, [effectivePlan, demoConfig]);

  const canUseProFeatures = useCallback(() => {
    if (demoConfig) {
      return effectivePlan !== "free";
    }
    return effectivePlan === "pro" || effectivePlan === "business" || effectivePlan === "corporate";
  }, [effectivePlan, demoConfig]);

  const canUseAPI = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.api_access;
    }
    return effectivePlan === "business" || effectivePlan === "corporate";
  }, [effectivePlan, demoConfig]);

  const canUseIntegrations = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.integrations;
    }
    return effectivePlan === "pro" || effectivePlan === "business" || effectivePlan === "corporate";
  }, [effectivePlan, demoConfig]);

  const canUseAnalytics = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.analytics;
    }
    return effectivePlan === "pro" || effectivePlan === "business" || effectivePlan === "corporate";
  }, [effectivePlan, demoConfig]);

  const canUseWhiteLabel = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.white_label;
    }
    return effectivePlan === "corporate";
  }, [effectivePlan, demoConfig]);

  const getMaxTeamMembers = useCallback(() => {
    if (demoConfig) {
      return demoConfig.features.team_members;
    }
    if (effectivePlan === "corporate") return -1;
    if (effectivePlan === "business") return 10;
    if (effectivePlan === "pro") return 3;
    return 0;
  }, [effectivePlan, demoConfig]);

  const getRemainingQuotes = useCallback(() => {
    if (demoConfig) {
      return demoConfig.maxQuotes;
    }
    const maxQuotes = state.planDetails?.max_quotes_per_month ?? PLAN_FEATURES[state.plan]?.maxQuotes ?? 5;
    if (maxQuotes === -1) return -1;
    const currentCount = state.usage?.quotes_created ?? 0;
    return Math.max(0, maxQuotes - currentCount);
  }, [demoConfig, state.plan, state.planDetails, state.usage]);

  const getMaxSectors = useCallback(() => {
    if (demoConfig) {
      return demoConfig.maxSectors;
    }
    return state.planDetails?.max_sectors ?? PLAN_FEATURES[state.plan]?.maxSectors ?? 1;
  }, [demoConfig, state.plan, state.planDetails]);

  return {
    ...state,
    plan: effectivePlan as SubscriptionPlan | "corporate",
    isDemoMode,
    canCreateQuote,
    canUseSector,
    canUseAI,
    canExportPDF,
    canProtectPDF,
    canShowLogoOnPDF,
    canUseProFeatures,
    canUseAPI,
    canUseIntegrations,
    canUseAnalytics,
    canUseWhiteLabel,
    getMaxTeamMembers,
    getRemainingQuotes,
    getMaxSectors,
    refresh: fetchData,
  };
}
