"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ClipboardPaste, Sparkles, Edit3, FileDown, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const TUTORIAL_STEPS = [
  {
    icon: ClipboardPaste,
    title: "Collez votre transcription",
    description: "Décrivez le travail à réaliser ou collez la transcription d'un appel client. Plus c'est détaillé, plus le devis sera précis.",
  },
  {
    icon: Sparkles,
    title: "Générez avec l'IA",
    description: "Cliquez sur « Générer » — l'IA DEAL analyse votre texte et crée un devis structuré avec les postes, quantités et prix.",
  },
  {
    icon: Edit3,
    title: "Vérifiez et ajustez",
    description: "Relisez les lignes générées, modifiez les prix ou quantités si nécessaire, et ajoutez des notes pour votre client.",
  },
  {
    icon: FileDown,
    title: "Exportez en PDF",
    description: "Exportez votre devis professionnel en PDF et envoyez-le directement à votre client par email.",
  },
];

interface TutorialOverlayProps {
  onDismiss?: () => void;
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTutorial = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: settings } = await supabase
        .from("user_settings")
        .select("tutorial_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!settings?.tutorial_completed) {
        setVisible(true);
      }
      setLoading(false);
    };
    checkTutorial();
  }, []);

  const dismiss = async (dontShowAgain: boolean) => {
    setVisible(false);
    onDismiss?.();

    if (dontShowAgain) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_settings")
          .upsert(
            { user_id: user.id, tutorial_completed: true },
            { onConflict: "user_id" }
          );
      }
    }
  };

  if (loading || !visible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <button
          onClick={() => dismiss(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-2">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentStep ? "bg-[#E85A5A]" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-[#E85A5A]/10 flex items-center justify-center mx-auto">
            <StepIcon className="w-8 h-8 text-[#E85A5A]" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Étape {currentStep + 1}: {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(s => s - 1)}
              disabled={isFirst}
              className={cn(isFirst && "invisible")}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>

            {isLast ? (
              <Button
                size="sm"
                onClick={() => dismiss(true)}
                className="bg-[#E85A5A] hover:bg-[#D64545] text-white"
              >
                C'est compris !
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setCurrentStep(s => s + 1)}
                className="bg-[#E85A5A] hover:bg-[#D64545] text-white"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Don't show again */}
          <button
            onClick={() => dismiss(true)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Ne plus afficher
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
