"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type SubscriptionPlan, PLAN_FEATURES } from "@/types/database";
import { Check, Loader2, Sparkles, Building2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealLoadingSpinner, DealLogoFull } from "@/components/brand";
import { staggerContainer, staggerItem } from "@/components/animations/page-transition";

// Plans statiques - Source unique de vérité
const STATIC_PLANS: Array<{
  name: SubscriptionPlan;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_sectors: number;
  max_quotes_per_month: number;
}> = [
  {
    name: 'free',
    display_name: 'Gratuit',
    description: 'Pour démarrer et tester',
    price_monthly: 0,
    price_yearly: 0,
    max_sectors: 1,
    max_quotes_per_month: 5,
  },
  {
    name: 'pro',
    display_name: 'Pro',
    description: 'Pour les professionnels',
    price_monthly: 29,
    price_yearly: 290, // -17% annuel
    max_sectors: 10,
    max_quotes_per_month: 100,
  },
  {
    name: 'business',
    display_name: 'Business',
    description: 'Pour les entreprises',
    price_monthly: 79,
    price_yearly: 790,
    max_sectors: -1,
    max_quotes_per_month: -1,
  },
];

const PLAN_ICONS: Record<SubscriptionPlan, any> = {
  free: Sparkles,
  pro: Building2,
  business: Crown,
  corporate: Crown,
};

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free");
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Create Supabase client lazily to avoid SSR issues
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      // Récupérer le plan actuel de l'utilisateur (s'il est connecté)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("plan_name")
          .eq("user_id", user.id)
          .single();

        if (subscription) {
          setCurrentPlan(subscription.plan_name as SubscriptionPlan);
        }
      }

      setLoading(false);
    };

    fetchUserPlan();
  }, [supabase]);

  const handleSelectPlan = async (planName: SubscriptionPlan) => {
    if (planName === currentPlan) return;

    if (!supabase) {
      router.push(`/login?redirect=/pricing&plan=${planName}`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/pricing&plan=${planName}`);
      return;
    }

    if (planName === "free") {
      // Downgrade to free - TODO: implement cancellation via Stripe portal
      setUpgrading(planName);
      toast({
        title: "Contactez-nous",
        description: "Pour annuler votre abonnement, contactez notre support",
      });
      setUpgrading(null);
      return;
    }

    // Upgrade to paid plan via Stripe Checkout
    setUpgrading(planName);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName,
          billingPeriod: yearly ? "yearly" : "monthly",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du paiement");
      }

      // Rediriger vers Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de procéder au paiement",
        variant: "destructive",
      });
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A]">
        <DealLoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A] py-12 px-4">
      <motion.div
        className="max-w-5xl mx-auto space-y-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div className="text-center space-y-4" variants={staggerItem}>
          <div className="flex justify-center mb-6">
            <DealLogoFull size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-white">Choisissez votre plan</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Des tarifs simples et transparents. Choisissez le plan adapté à votre activité.
          </p>

          {/* Toggle annuel/mensuel */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Label htmlFor="yearly" className={cn("text-white/70", !yearly && "text-[#C9A962] font-semibold")}>
              Mensuel
            </Label>
            <Switch
              id="yearly"
              checked={yearly}
              onCheckedChange={setYearly}
              className="data-[state=checked]:bg-[#C9A962]"
            />
            <Label htmlFor="yearly" className={cn("text-white/70", yearly && "text-[#C9A962] font-semibold")}>
              Annuel
              <Badge className="ml-2 bg-[#C9A962]/20 text-[#C9A962] border-[#C9A962]/30">-17%</Badge>
            </Label>
          </div>
        </motion.div>

        {/* Plans */}
        <motion.div className="grid md:grid-cols-3 gap-6" variants={staggerItem}>
          {STATIC_PLANS.map((plan, index) => {
            const Icon = PLAN_ICONS[plan.name];
            const isCurrentPlan = plan.name === currentPlan;
            const isPro = plan.name === "pro";
            const features = PLAN_FEATURES[plan.name].features;
            const price = yearly ? plan.price_yearly / 12 : plan.price_monthly;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "relative flex flex-col bg-white/95 backdrop-blur-sm border-[#C9A962]/10",
                    isPro && "border-[#C9A962] shadow-xl shadow-[#C9A962]/20 scale-105 z-10",
                    isCurrentPlan && "ring-2 ring-[#C9A962]"
                  )}
                >
                  {isPro && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A962] text-[#0D1B2A]">
                      Populaire
                    </Badge>
                  )}
                  {isCurrentPlan && (
                    <Badge variant="outline" className="absolute -top-3 right-4 border-[#C9A962] text-[#C9A962]">
                      Plan actuel
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-2 p-3 rounded-full bg-[#C9A962]/10">
                      <Icon className="h-6 w-6 text-[#C9A962]" />
                    </div>
                    <CardTitle className="text-[#1E3A5F]">{plan.display_name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {/* Prix */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-[#1E3A5F]">
                          {price === 0 ? "0" : price.toFixed(0)}
                        </span>
                        <span className="text-muted-foreground">€</span>
                        {price > 0 && (
                          <span className="text-sm text-muted-foreground">/mois</span>
                        )}
                      </div>
                      {yearly && price > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Facturé {plan.price_yearly}€/an
                        </p>
                      )}
                    </div>

                    {/* Limites */}
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-[#1E3A5F]">
                        {plan.max_sectors === -1
                          ? "Secteurs illimités"
                          : `${plan.max_sectors} secteur${plan.max_sectors > 1 ? "s" : ""}`}
                      </p>
                      <p className="text-muted-foreground">
                        {plan.max_quotes_per_month === -1
                          ? "Devis illimités"
                          : `${plan.max_quotes_per_month} devis/mois`}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-[#C9A962] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={cn(
                        "w-full",
                        isPro
                          ? "bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]"
                          : "border-[#C9A962]/30 text-[#1E3A5F] hover:bg-[#C9A962]/10"
                      )}
                      variant={isPro ? "default" : "outline"}
                      disabled={isCurrentPlan || upgrading !== null}
                      onClick={() => handleSelectPlan(plan.name)}
                    >
                      {upgrading === plan.name ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Plan actuel"
                      ) : plan.name === "free" ? (
                        "Commencer gratuitement"
                      ) : (
                        "Choisir ce plan"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ ou info supplémentaire */}
        <motion.div className="text-center pt-8" variants={staggerItem}>
          <p className="text-white/70">
            Besoin d'aide pour choisir ?{" "}
            <a href="mailto:support@deal.be" className="text-[#C9A962] hover:underline">
              Contactez-nous
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
