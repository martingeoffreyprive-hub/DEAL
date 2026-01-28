"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  FileText,
  ListOrdered,
  Send,
} from "lucide-react";

export type WizardStep = "mode" | "client" | "details" | "items" | "review";

interface WizardStepConfig {
  id: WizardStep;
  title: string;
  description: string;
  icon: React.ElementType;
}

const wizardSteps: WizardStepConfig[] = [
  {
    id: "mode",
    title: "Mode",
    description: "Choisissez comment créer",
    icon: FileText,
  },
  {
    id: "client",
    title: "Client",
    description: "Informations client",
    icon: User,
  },
  {
    id: "details",
    title: "Détails",
    description: "Secteur et options",
    icon: FileText,
  },
  {
    id: "items",
    title: "Articles",
    description: "Prestations et prix",
    icon: ListOrdered,
  },
  {
    id: "review",
    title: "Finaliser",
    description: "Vérifier et envoyer",
    icon: Send,
  },
];

interface QuoteWizardProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
  children: React.ReactNode;
  canProceed?: boolean;
  isLoading?: boolean;
  onComplete?: () => void;
  hideStepIndicator?: boolean;
}

export function QuoteWizard({
  currentStep,
  onStepChange,
  children,
  canProceed = true,
  isLoading = false,
  onComplete,
  hideStepIndicator = false,
}: QuoteWizardProps) {
  const currentStepIndex = wizardSteps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / wizardSteps.length) * 100;

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < wizardSteps.length - 1) {
      onStepChange(wizardSteps[currentStepIndex + 1].id);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentStepIndex, onStepChange, onComplete]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      onStepChange(wizardSteps[currentStepIndex - 1].id);
    }
  }, [currentStepIndex, onStepChange]);

  const isLastStep = currentStepIndex === wizardSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      {!hideStepIndicator && (
        <div className="mb-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={progress} className="h-1.5 bg-muted" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isUpcoming = index > currentStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStepIndex && onStepChange(step.id)}
                  disabled={isUpcoming}
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-all",
                    isUpcoming ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                    isCurrent && "scale-105"
                  )}
                >
                  {/* Step Circle */}
                  <motion.div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isCompleted
                        ? "bg-[#E85A5A] border-[#E85A5A] text-white"
                        : isCurrent
                        ? "bg-[#E85A5A]/10 border-[#E85A5A] text-[#E85A5A]"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    )}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <div className="text-center hidden sm:block">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        isCurrent ? "text-[#E85A5A]" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {index < wizardSteps.length - 1 && (
                    <div
                      className={cn(
                        "absolute h-0.5 w-[calc(100%/4-2rem)] top-5",
                        "hidden sm:block",
                        isCompleted ? "bg-[#E85A5A]" : "bg-muted"
                      )}
                      style={{
                        left: `calc(${(index + 1) * (100 / wizardSteps.length)}% - ${
                          100 / wizardSteps.length / 2
                        }%)`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <Button
          variant="ghost"
          onClick={goToPrevStep}
          disabled={isFirstStep || isLoading}
          className={cn(isFirstStep && "invisible")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="flex items-center gap-2">
          {/* Step indicator for mobile */}
          <span className="text-sm text-muted-foreground sm:hidden">
            {currentStepIndex + 1} / {wizardSteps.length}
          </span>

          <Button
            onClick={goToNextStep}
            disabled={!canProceed || isLoading}
            className={cn(
              "min-w-[120px]",
              isLastStep && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Chargement...
              </>
            ) : isLastStep ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Créer le devis
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export step types for use in parent components
export { wizardSteps };
export type { WizardStepConfig };
