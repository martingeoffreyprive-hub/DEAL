"use client";

import { useEffect, useState, useCallback } from "react";
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

interface SubscriptionState {
  plan: SubscriptionPlan;
  subscription: Subscription | null;
  planDetails: Plan | null;
  userSectors: UserSector[];
  usage: UsageStats | null;
  loading: boolean;
  error: string | null;
}

interface SubscriptionActions {
  canCreateQuote: () => boolean;
  canUseSector: (sector: SectorType) => boolean;
  canUseAI: () => boolean;
  canExportPDF: () => boolean;
  canProtectPDF: () => boolean;
  canShowLogoOnPDF: () => boolean; // Logo sur devis (Pro+)
  canUseProFeatures: () => boolean; // Reviews, CTA, etc.
  getRemainingQuotes: () => number;
  getMaxSectors: () => number;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState & SubscriptionActions {
  const [state, setState] = useState<SubscriptionState>({
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

      // Récupérer toutes les données en parallèle
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

  // Actions
  const canCreateQuote = useCallback(() => {
    if (state.plan === "business") return true;
    const maxQuotes = state.planDetails?.max_quotes_per_month ?? PLAN_FEATURES[state.plan].maxQuotes;
    if (maxQuotes === -1) return true;
    const currentCount = state.usage?.quotes_created ?? 0;
    return currentCount < maxQuotes;
  }, [state.plan, state.planDetails, state.usage]);

  const canUseSector = useCallback((sector: SectorType) => {
    if (state.plan === "business") return true;
    return state.userSectors.some(s => s.sector === sector);
  }, [state.plan, state.userSectors]);

  const canUseAI = useCallback(() => {
    return state.planDetails?.ai_assistant_enabled ?? PLAN_FEATURES[state.plan].features.includes('Assistant IA');
  }, [state.plan, state.planDetails]);

  const canExportPDF = useCallback(() => {
    return state.planDetails?.pdf_export_enabled ?? true;
  }, [state.planDetails]);

  const canProtectPDF = useCallback(() => {
    return state.planDetails?.pdf_protection_enabled ?? false;
  }, [state.planDetails]);

  // Logo sur devis: disponible à partir du plan Pro
  const canShowLogoOnPDF = useCallback(() => {
    return state.plan === "pro" || state.plan === "business";
  }, [state.plan]);

  // Fonctionnalités Pro (Reviews, CTA, etc.): disponibles à partir du plan Pro
  const canUseProFeatures = useCallback(() => {
    return state.plan === "pro" || state.plan === "business";
  }, [state.plan]);

  const getRemainingQuotes = useCallback(() => {
    const maxQuotes = state.planDetails?.max_quotes_per_month ?? PLAN_FEATURES[state.plan].maxQuotes;
    if (maxQuotes === -1) return -1;
    const currentCount = state.usage?.quotes_created ?? 0;
    return Math.max(0, maxQuotes - currentCount);
  }, [state.plan, state.planDetails, state.usage]);

  const getMaxSectors = useCallback(() => {
    return state.planDetails?.max_sectors ?? PLAN_FEATURES[state.plan].maxSectors;
  }, [state.plan, state.planDetails]);

  return {
    ...state,
    canCreateQuote,
    canUseSector,
    canUseAI,
    canExportPDF,
    canProtectPDF,
    canShowLogoOnPDF,
    canUseProFeatures,
    getRemainingQuotes,
    getMaxSectors,
    refresh: fetchData,
  };
}
