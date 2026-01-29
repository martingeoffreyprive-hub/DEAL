"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistStep {
  id: string;
  label: string;
  href: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  profileCompleted: boolean;
  sectorSelected: boolean;
  hasQuotes: boolean;
  hasPdfExported: boolean;
}

export function OnboardingChecklist({
  profileCompleted,
  sectorSelected,
  hasQuotes,
  hasPdfExported,
}: OnboardingChecklistProps) {
  const steps: ChecklistStep[] = [
    {
      id: "sector",
      label: "Sélectionner votre secteur",
      href: "/onboarding",
      completed: sectorSelected,
    },
    {
      id: "profile",
      label: "Compléter votre profil",
      href: "/profile",
      completed: profileCompleted,
    },
    {
      id: "quote",
      label: "Créer votre premier devis",
      href: "/quotes/new",
      completed: hasQuotes,
    },
    {
      id: "pdf",
      label: "Exporter votre premier PDF",
      href: "/quotes",
      completed: hasPdfExported,
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const allDone = completedCount === steps.length;

  // Don't render if all steps are complete
  if (allDone) return null;

  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <Card className="border-[#252B4A]/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Démarrage rapide</CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{steps.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-[#E85A5A] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.completed ? "#" : step.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              step.completed
                ? "text-muted-foreground"
                : "hover:bg-muted/50 text-foreground"
            )}
          >
            {step.completed ? (
              <Check className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-[#E85A5A] shrink-0" />
            )}
            <span
              className={cn(
                "text-sm flex-1",
                step.completed && "line-through"
              )}
            >
              {step.label}
            </span>
            {!step.completed && (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
