"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type SubscriptionPlan, type Plan, PLAN_FEATURES } from "@/types/database";
import { Check, Loader2, Sparkles, Crown, Zap, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<SubscriptionPlan, any> = {
  free: Sparkles,
  starter: Zap,
  pro: Building2,
  ultimate: Crown,
};

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free");
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Récupérer les plans
      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (plansData) {
        setPlans(plansData as Plan[]);
      }

      // Récupérer le plan actuel de l'utilisateur
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

    fetchData();
  }, [supabase]);

  const handleSelectPlan = async (planName: SubscriptionPlan) => {
    if (planName === currentPlan) return;

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choisissez votre plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Des tarifs simples et transparents. Choisissez le plan adapté à votre activité.
          </p>

          {/* Toggle annuel/mensuel */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Label htmlFor="yearly" className={cn(!yearly && "text-primary font-semibold")}>
              Mensuel
            </Label>
            <Switch
              id="yearly"
              checked={yearly}
              onCheckedChange={setYearly}
            />
            <Label htmlFor="yearly" className={cn(yearly && "text-primary font-semibold")}>
              Annuel
              <Badge variant="secondary" className="ml-2">-17%</Badge>
            </Label>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = PLAN_ICONS[plan.name];
            const isCurrentPlan = plan.name === currentPlan;
            const isPro = plan.name === "pro";
            const features = PLAN_FEATURES[plan.name].features;
            const price = yearly ? plan.price_yearly / 12 : plan.price_monthly;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col",
                  isPro && "border-primary shadow-lg scale-105",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {isPro && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Populaire
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="outline" className="absolute -top-3 right-4">
                    Plan actuel
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{plan.display_name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Prix */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">
                        {price === 0 ? "0" : price.toFixed(2)}
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
                    <p className="font-medium">
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
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
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
            );
          })}
        </div>

        {/* FAQ ou info supplémentaire */}
        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            Besoin d'aide pour choisir ?{" "}
            <a href="mailto:support@quotevoice.be" className="text-primary hover:underline">
              Contactez-nous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
