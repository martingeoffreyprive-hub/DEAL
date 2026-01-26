"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/use-subscription";
import { PLAN_FEATURES } from "@/types/database";
import { FileText, Sparkles, Crown, Zap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export function UsageCard() {
  const {
    plan,
    usage,
    userSectors,
    loading,
    getRemainingQuotes,
    getMaxSectors,
    canUseAI,
  } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const planInfo = PLAN_FEATURES[plan];
  const maxQuotes = planInfo.maxQuotes;
  const usedQuotes = usage?.quotes_created ?? 0;
  const remainingQuotes = getRemainingQuotes();
  const maxSectors = getMaxSectors();
  const usedSectors = userSectors.length;

  const quotesPercentage = maxQuotes === -1 ? 0 : (usedQuotes / maxQuotes) * 100;
  const sectorsPercentage = maxSectors === -1 ? 0 : (usedSectors / maxSectors) * 100;

  const PlanIcon = plan === "business" ? Crown : plan === "pro" ? Zap : Sparkles;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <PlanIcon className="h-5 w-5 text-primary" />
            Plan {planInfo.displayName}
          </CardTitle>
          {plan !== "business" && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">
                Upgrader <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Devis ce mois */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Devis ce mois
            </span>
            <span className="font-medium">
              {usedQuotes} / {maxQuotes === -1 ? "∞" : maxQuotes}
            </span>
          </div>
          {maxQuotes !== -1 && (
            <Progress
              value={quotesPercentage}
              className={quotesPercentage >= 80 ? "bg-red-100" : ""}
            />
          )}
          {maxQuotes !== -1 && remainingQuotes <= 2 && remainingQuotes > 0 && (
            <p className="text-xs text-orange-600">
              Plus que {remainingQuotes} devis restant{remainingQuotes > 1 ? "s" : ""}
            </p>
          )}
          {remainingQuotes === 0 && maxQuotes !== -1 && (
            <p className="text-xs text-red-600 font-medium">
              Limite atteinte ! Passez au plan supérieur.
            </p>
          )}
        </div>

        {/* Secteurs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Secteurs actifs</span>
            <span className="font-medium">
              {usedSectors} / {maxSectors === -1 ? "∞" : maxSectors}
            </span>
          </div>
          {maxSectors !== -1 && (
            <Progress value={sectorsPercentage} />
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 pt-2">
          {canUseAI() && (
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Assistant IA
            </Badge>
          )}
          {plan === "pro" || plan === "business" ? (
            <Badge variant="secondary" className="text-xs">
              Protection PDF
            </Badge>
          ) : null}
          {plan === "business" && (
            <Badge variant="secondary" className="text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Support prioritaire
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
