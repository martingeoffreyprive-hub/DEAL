"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { SECTORS, SECTOR_CONFIGS, type SectorType, PLAN_FEATURES } from "@/types/database";
import {
  Crown, Zap, Sparkles, Check, Plus, Trash2, Loader2,
  ArrowRight, AlertTriangle, Calendar, CreditCard, ExternalLink
} from "lucide-react";
import { SubscriptionAlert } from "@/components/subscription/subscription-alert";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Icons mapping
import {
  Zap as ZapIcon, Droplets, Flame, Building2, Hammer, PaintBucket,
  Ruler, Home, TreeDeciduous, Sparkles as SparklesIcon,
  Truck, Monitor, Calculator, Scale, Lightbulb, GraduationCap,
  PartyPopper, UtensilsCrossed, Car, Wrench, Shield, Heart,
  Scissors, Camera, Palette, Megaphone, Briefcase
} from "lucide-react";

const SECTOR_ICONS: Record<SectorType, any> = {
  ELECTRICITE: ZapIcon, PLOMBERIE: Droplets, CHAUFFAGE: Flame,
  CONSTRUCTION: Building2, RENOVATION: Hammer, PEINTURE: PaintBucket,
  MENUISERIE: Ruler, TOITURE: Home, JARDINAGE: TreeDeciduous,
  NETTOYAGE: SparklesIcon, DEMENAGEMENT: Truck, INFORMATIQUE: Monitor,
  COMPTABILITE: Calculator, JURIDIQUE: Scale, CONSEIL: Lightbulb,
  FORMATION: GraduationCap, EVENEMENTIEL: PartyPopper, RESTAURATION: UtensilsCrossed,
  TRANSPORT: Car, DEPANNAGE: Wrench, SECURITE: Shield, SANTE: Heart,
  BEAUTE: Scissors, PHOTO_VIDEO: Camera, DESIGN: Palette,
  MARKETING: Megaphone, AUTRE: Briefcase,
};

export default function SubscriptionSettingsPage() {
  const {
    plan,
    subscription,
    userSectors,
    usage,
    loading,
    getMaxSectors,
    refresh
  } = useSubscription();
  const [addingSector, setAddingSector] = useState(false);
  const [removingSector, setRemovingSector] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const planInfo = PLAN_FEATURES[plan];
  const maxSectors = getMaxSectors();
  const canAddSector = maxSectors === -1 || userSectors.length < maxSectors;

  const unlockedSectorKeys = userSectors.map(s => s.sector);
  const availableSectors = (Object.keys(SECTORS) as SectorType[]).filter(
    s => !unlockedSectorKeys.includes(s)
  );

  const handleAddSector = async (sector: SectorType) => {
    if (!canAddSector) {
      toast({
        title: "Limite atteinte",
        description: "Passez à un plan supérieur pour ajouter plus de secteurs",
        variant: "destructive",
      });
      return;
    }

    setAddingSector(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("user_sectors")
        .insert({
          user_id: user.id,
          sector,
          is_primary: userSectors.length === 0,
        });

      if (error) throw error;

      toast({ title: "Secteur ajouté", description: SECTORS[sector] });
      refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le secteur",
        variant: "destructive",
      });
    } finally {
      setAddingSector(false);
    }
  };

  const handleRemoveSector = async (sectorId: string) => {
    if (userSectors.length <= 1) {
      toast({
        title: "Impossible",
        description: "Vous devez garder au moins un secteur",
        variant: "destructive",
      });
      return;
    }

    setRemovingSector(sectorId);
    try {
      const { error } = await supabase
        .from("user_sectors")
        .delete()
        .eq("id", sectorId);

      if (error) throw error;

      toast({ title: "Secteur retiré" });
      refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer le secteur",
        variant: "destructive",
      });
    } finally {
      setRemovingSector(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const PlanIcon = plan === "ultimate" ? Crown : plan === "pro" ? Zap : Sparkles;

  const [openingPortal, setOpeningPortal] = useState(false);

  const handleOpenPortal = async () => {
    setOpeningPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'accéder au portail",
        variant: "destructive",
      });
      setOpeningPortal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Payment Alert */}
      <SubscriptionAlert />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Abonnement</h1>
        <p className="text-muted-foreground">
          Gérez votre plan et vos secteurs d'activité
        </p>
      </div>

      {/* Plan actuel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <PlanIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Plan {planInfo.displayName}</CardTitle>
                <CardDescription>
                  {plan === "free" ? "Gratuit" : `${subscription?.status === "active" ? "Actif" : "Inactif"}`}
                </CardDescription>
              </div>
            </div>
            {plan !== "ultimate" && (
              <Button asChild>
                <Link href="/pricing">
                  Changer de plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{usage?.quotes_created ?? 0}</p>
              <p className="text-xs text-muted-foreground">
                Devis ce mois / {planInfo.maxQuotes === -1 ? "∞" : planInfo.maxQuotes}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{userSectors.length}</p>
              <p className="text-xs text-muted-foreground">
                Secteurs / {maxSectors === -1 ? "∞" : maxSectors}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{planInfo.features.includes("Assistant IA") || plan !== "free" ? "✓" : "✗"}</p>
              <p className="text-xs text-muted-foreground">Assistant IA</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{plan === "pro" || plan === "ultimate" ? "✓" : "✗"}</p>
              <p className="text-xs text-muted-foreground">Protection PDF</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secteurs actifs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mes secteurs d'activité</CardTitle>
              <CardDescription>
                {userSectors.length} / {maxSectors === -1 ? "illimité" : maxSectors} secteurs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Secteurs actuels */}
          <div className="space-y-2">
            {userSectors.map((userSector) => {
              const Icon = SECTOR_ICONS[userSector.sector];
              return (
                <div
                  key={userSector.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{SECTORS[userSector.sector]}</p>
                      {userSector.is_primary && (
                        <Badge variant="secondary" className="text-xs">Principal</Badge>
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={userSectors.length <= 1 || removingSector === userSector.id}
                      >
                        {removingSector === userSector.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Retirer ce secteur ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Vous ne pourrez plus créer de devis pour "{SECTORS[userSector.sector]}".
                          Vous pourrez le réactiver plus tard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveSector(userSector.id)}>
                          Retirer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>

          {/* Ajouter un secteur */}
          {canAddSector && availableSectors.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Ajouter un secteur</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableSectors.slice(0, 8).map((sector) => {
                  const Icon = SECTOR_ICONS[sector];
                  return (
                    <Button
                      key={sector}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      disabled={addingSector}
                      onClick={() => handleAddSector(sector)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="truncate">{SECTORS[sector]}</span>
                    </Button>
                  );
                })}
              </div>
              {availableSectors.length > 8 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{availableSectors.length - 8} autres secteurs disponibles
                </p>
              )}
            </div>
          )}

          {/* Message si limite atteinte */}
          {!canAddSector && plan !== "ultimate" && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Limite de secteurs atteinte
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Passez au plan supérieur pour débloquer plus de secteurs
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/pricing">Upgrader</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facturation et gestion d'abonnement */}
      {plan !== "free" && subscription?.stripe_customer_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Facturation
            </CardTitle>
            <CardDescription>
              Gérez votre moyen de paiement et consultez vos factures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Période actuelle */}
            {subscription.current_period_end && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Prochaine facturation</span>
                </div>
                <span className="text-sm font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString("fr-BE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {/* Annulation programmée */}
            {subscription.cancel_at_period_end && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Annulation programmée
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Votre abonnement prendra fin le{" "}
                    {subscription.current_period_end &&
                      new Date(subscription.current_period_end).toLocaleDateString("fr-BE")}
                  </p>
                </div>
              </div>
            )}

            {/* Bouton portail Stripe */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleOpenPortal}
              disabled={openingPortal}
            >
              {openingPortal ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Gérer l'abonnement sur Stripe
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Modifiez votre moyen de paiement, téléchargez vos factures ou annulez votre abonnement
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
