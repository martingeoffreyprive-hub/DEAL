"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SECTORS, SECTOR_CONFIGS, type SectorType, type SubscriptionPlan, PLAN_FEATURES } from "@/types/database";
import { Check, Loader2, Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// Icons pour chaque secteur
import {
  Zap, Droplets, Flame, Building2, Hammer, PaintBucket,
  Ruler, Home, TreeDeciduous, Sparkles as SparklesIcon,
  Truck, Monitor, Calculator, Scale, Lightbulb, GraduationCap,
  PartyPopper, UtensilsCrossed, Car, Wrench, Shield, Heart,
  Scissors, Camera, Palette, Megaphone, Briefcase
} from "lucide-react";

const SECTOR_ICONS: Record<SectorType, any> = {
  ELECTRICITE: Zap,
  PLOMBERIE: Droplets,
  CHAUFFAGE: Flame,
  CONSTRUCTION: Building2,
  RENOVATION: Hammer,
  PEINTURE: PaintBucket,
  MENUISERIE: Ruler,
  TOITURE: Home,
  JARDINAGE: TreeDeciduous,
  NETTOYAGE: SparklesIcon,
  DEMENAGEMENT: Truck,
  INFORMATIQUE: Monitor,
  COMPTABILITE: Calculator,
  JURIDIQUE: Scale,
  CONSEIL: Lightbulb,
  FORMATION: GraduationCap,
  EVENEMENTIEL: PartyPopper,
  RESTAURATION: UtensilsCrossed,
  TRANSPORT: Car,
  DEPANNAGE: Wrench,
  SECURITE: Shield,
  SANTE: Heart,
  BEAUTE: Scissors,
  PHOTO_VIDEO: Camera,
  DESIGN: Palette,
  MARKETING: Megaphone,
  AUTRE: Briefcase,
};

export default function OnboardingPage() {
  const [selectedSectors, setSelectedSectors] = useState<SectorType[]>([]);
  const [plan, setPlan] = useState<SubscriptionPlan>("free");
  const [maxSectors, setMaxSectors] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Create Supabase client lazily to avoid SSR issues
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createClient();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Vérifier si l'onboarding est déjà fait
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.push("/dashboard");
        return;
      }

      // Récupérer le plan actuel
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_name")
        .eq("user_id", user.id)
        .single();

      if (subscription) {
        setPlan(subscription.plan_name as SubscriptionPlan);
        setMaxSectors(PLAN_FEATURES[subscription.plan_name as SubscriptionPlan].maxSectors);
      }

      setLoading(false);
    };

    checkUser();
  }, [router, supabase, setPlan, setMaxSectors]);

  const toggleSector = (sector: SectorType) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      // Vérifier la limite
      if (maxSectors !== -1 && selectedSectors.length >= maxSectors) {
        toast({
          title: "Limite atteinte",
          description: `Votre plan ${PLAN_FEATURES[plan].displayName} permet ${maxSectors} secteur(s). Passez à un plan supérieur pour en ajouter.`,
          variant: "destructive",
        });
        return;
      }
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const handleContinue = async () => {
    if (selectedSectors.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un secteur d'activité",
        variant: "destructive",
      });
      return;
    }

    if (!supabase) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Ajouter les secteurs sélectionnés
      const sectorsToInsert = selectedSectors.map((sector, index) => ({
        user_id: user.id,
        sector,
        is_primary: index === 0, // Le premier est le principal
      }));

      const { error: sectorsError } = await supabase
        .from("user_sectors")
        .insert(sectorsToInsert);

      if (sectorsError) throw sectorsError;

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          default_sector: selectedSectors[0],
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Configuration terminée",
        description: "Bienvenue sur QuoteVoice !",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving sectors:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos secteurs",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sectorEntries = Object.entries(SECTORS) as [SectorType, string][];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Bienvenue sur QuoteVoice</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Sélectionnez votre secteur d'activité pour personnaliser votre expérience
          </p>
          <p className="text-sm text-muted-foreground">
            Plan <span className="font-semibold text-primary">{PLAN_FEATURES[plan].displayName}</span> :
            {maxSectors === -1 ? " Secteurs illimités" : ` ${maxSectors} secteur(s) maximum`}
          </p>
        </div>

        {/* Sélection de secteurs */}
        <Card>
          <CardHeader>
            <CardTitle>Choisissez vos secteurs ({selectedSectors.length}/{maxSectors === -1 ? "∞" : maxSectors})</CardTitle>
            <CardDescription>
              Les modèles, vocabulaire et suggestions IA seront adaptés à vos secteurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sectorEntries.map(([key, label]) => {
                const Icon = SECTOR_ICONS[key];
                const isSelected = selectedSectors.includes(key);
                const isDisabled = !isSelected && maxSectors !== -1 && selectedSectors.length >= maxSectors;

                return (
                  <button
                    key={key}
                    onClick={() => toggleSector(key)}
                    disabled={isDisabled}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    {isDisabled && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium text-center">{label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade prompt si limite atteinte */}
        {maxSectors !== -1 && selectedSectors.length >= maxSectors && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Besoin de plus de secteurs ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Passez au plan supérieur pour débloquer plus de secteurs et de fonctionnalités
                  </p>
                </div>
                <Button variant="default" onClick={() => router.push("/pricing")}>
                  Voir les plans
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={saving || selectedSectors.length === 0}
            className="min-w-[200px]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Continuer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
