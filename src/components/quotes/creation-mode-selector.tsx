"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Mic,
  PenLine,
  LayoutTemplate,
  ScanLine,
  Sparkles,
  Check,
  Zap,
  Clock,
} from "lucide-react";

export type CreationMode = "vocal" | "manual" | "template" | "scanner";

interface ModeOption {
  id: CreationMode;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "new" | "popular" | "fast";
  features: string[];
  recommended?: boolean;
}

const modeOptions: ModeOption[] = [
  {
    id: "vocal",
    title: "Dictée vocale",
    description: "Collez votre transcription et laissez l'IA générer le devis",
    icon: Mic,
    badge: "Recommandé",
    badgeVariant: "popular",
    features: [
      "Transcription → Devis en 30s",
      "Détection auto du secteur",
      "Prix estimés intelligemment",
    ],
    recommended: true,
  },
  {
    id: "manual",
    title: "Saisie manuelle",
    description: "Créez votre devis ligne par ligne avec contrôle total",
    icon: PenLine,
    features: [
      "Contrôle total sur chaque ligne",
      "Idéal pour devis complexes",
      "Ajout de sections personnalisées",
    ],
  },
  {
    id: "template",
    title: "Depuis un template",
    description: "Partez d'un modèle pré-configuré pour votre secteur",
    icon: LayoutTemplate,
    badge: "Rapide",
    badgeVariant: "fast",
    features: [
      "Templates par secteur",
      "Personnalisation facile",
      "Vos templates sauvegardés",
    ],
  },
  {
    id: "scanner",
    title: "Scanner un document",
    description: "Importez un devis existant ou un bon de commande",
    icon: ScanLine,
    badge: "Bientôt",
    badgeVariant: "new",
    features: [
      "Import PDF/image",
      "Extraction OCR",
      "Conversion automatique",
    ],
  },
];

interface CreationModeSelectorProps {
  selectedMode: CreationMode | null;
  onSelectMode: (mode: CreationMode) => void;
  disabled?: boolean;
}

export function CreationModeSelector({
  selectedMode,
  onSelectMode,
  disabled = false,
}: CreationModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<CreationMode | null>(null);

  const getBadgeStyles = (variant?: string) => {
    switch (variant) {
      case "popular":
        return "bg-[#E85A5A]/10 text-[#E85A5A] border-[#E85A5A]/30";
      case "new":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "fast":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Comment souhaitez-vous créer votre devis ?</h2>
        <p className="text-muted-foreground text-sm">
          Choisissez le mode qui correspond le mieux à votre situation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modeOptions.map((mode, index) => {
          const isSelected = selectedMode === mode.id;
          const isHovered = hoveredMode === mode.id;
          const isDisabled = disabled || mode.badge === "Bientôt";
          const Icon = mode.icon;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative cursor-pointer transition-all duration-300 overflow-hidden",
                  "border-2",
                  isSelected
                    ? "border-[#E85A5A] bg-[#E85A5A]/5 shadow-lg shadow-[#E85A5A]/10"
                    : isHovered && !isDisabled
                    ? "border-[#E85A5A]/50 bg-muted/50"
                    : "border-transparent hover:border-muted",
                  isDisabled && "opacity-60 cursor-not-allowed",
                  mode.recommended && !isSelected && "ring-2 ring-[#E85A5A]/20"
                )}
                onClick={() => !isDisabled && onSelectMode(mode.id)}
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#E85A5A] flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                {/* Recommended glow */}
                {mode.recommended && !isSelected && (
                  <div className="absolute -inset-px bg-gradient-to-r from-[#E85A5A]/20 via-transparent to-[#E85A5A]/20 rounded-xl opacity-50" />
                )}

                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <motion.div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "bg-[#E85A5A] text-white"
                          : "bg-[#252B4A]/10 text-[#252B4A] dark:bg-white/10 dark:text-white"
                      )}
                      animate={{
                        scale: isSelected ? 1.1 : isHovered ? 1.05 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{mode.title}</h3>
                        {mode.badge && (
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", getBadgeStyles(mode.badgeVariant))}
                          >
                            {mode.badgeVariant === "popular" && <Sparkles className="w-3 h-3 mr-1" />}
                            {mode.badgeVariant === "fast" && <Zap className="w-3 h-3 mr-1" />}
                            {mode.badgeVariant === "new" && <Clock className="w-3 h-3 mr-1" />}
                            {mode.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {mode.description}
                      </p>

                      {/* Features */}
                      <ul className="space-y-1">
                        {mode.features.map((feature, i) => (
                          <motion.li
                            key={i}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{
                              opacity: isSelected || isHovered ? 1 : 0.7,
                              x: 0,
                            }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <div
                              className={cn(
                                "w-1 h-1 rounded-full",
                                isSelected ? "bg-[#E85A5A]" : "bg-muted-foreground"
                              )}
                            />
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
