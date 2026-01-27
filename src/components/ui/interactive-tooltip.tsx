"use client";

/**
 * Interactive Tooltip - Infobulles contextuelles
 * Affiche des conseils, exemples et avertissements
 */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContent {
  title?: string;
  description: string;
  type?: "info" | "tip" | "warning" | "help" | "feature";
  example?: string;
  learnMoreUrl?: string;
  shortcuts?: { key: string; description: string }[];
}

interface InteractiveTooltipProps {
  children: React.ReactNode;
  content: TooltipContent;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  className?: string;
}

const typeConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
    titleColor: "text-blue-700 dark:text-blue-300",
  },
  tip: {
    icon: Lightbulb,
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-500",
    titleColor: "text-amber-700 dark:text-amber-300",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-500",
    titleColor: "text-red-700 dark:text-red-300",
  },
  help: {
    icon: HelpCircle,
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-500",
    titleColor: "text-purple-700 dark:text-purple-300",
  },
  feature: {
    icon: Sparkles,
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-700 dark:text-emerald-300",
  },
};

const TooltipContentComponent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    tooltipContent: TooltipContent;
  }
>(({ className, tooltipContent, sideOffset = 8, ...props }, ref) => {
  const type = tooltipContent.type || "info";
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-lg border shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        config.bgColor,
        config.borderColor,
        "max-w-sm",
        className
      )}
      {...props}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start gap-2">
          <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.iconColor)} />
          <div className="flex-1 min-w-0">
            {tooltipContent.title && (
              <p className={cn("font-semibold text-sm", config.titleColor)}>
                {tooltipContent.title}
              </p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tooltipContent.description}
            </p>
          </div>
        </div>

        {/* Example */}
        {tooltipContent.example && (
          <div className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded text-xs font-mono">
            <span className="text-muted-foreground">Exemple: </span>
            {tooltipContent.example}
          </div>
        )}

        {/* Shortcuts */}
        {tooltipContent.shortcuts && tooltipContent.shortcuts.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Raccourcis:</p>
            {tooltipContent.shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <kbd className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded text-[10px] font-mono">
                  {shortcut.key}
                </kbd>
                <span className="text-muted-foreground">{shortcut.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Learn more link */}
        {tooltipContent.learnMoreUrl && (
          <a
            href={tooltipContent.learnMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-2 inline-flex items-center gap-1 text-xs font-medium",
              config.titleColor,
              "hover:underline"
            )}
          >
            En savoir plus
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Arrow */}
      <TooltipPrimitive.Arrow className="fill-current text-border" />
    </TooltipPrimitive.Content>
  );
});
TooltipContentComponent.displayName = "TooltipContentComponent";

export function InteractiveTooltip({
  children,
  content,
  side = "top",
  align = "center",
  delayDuration = 400,
  className,
}: InteractiveTooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={delayDuration}>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipContentComponent
            tooltipContent={content}
            side={side}
            align={align}
          />
        </TooltipPrimitive.Portal>
      </TooltipRoot>
    </TooltipProvider>
  );
}

/**
 * Hook pour les tooltips contextuels
 */
export function useTooltipContent(key: string): TooltipContent | null {
  const tooltips: Record<string, TooltipContent> = {
    // Dashboard
    "dashboard.stats.revenue": {
      title: "Chiffre d'affaires",
      description: "Total des devis acceptés sur la période sélectionnée.",
      type: "info",
      example: "Si vous avez 5 devis acceptés de 1000€ chacun, le CA = 5000€",
    },
    "dashboard.stats.quotes": {
      title: "Devis envoyés",
      description: "Nombre total de devis envoyés aux clients.",
      type: "info",
    },
    "dashboard.stats.conversion": {
      title: "Taux de conversion",
      description: "Pourcentage de devis acceptés par rapport aux devis envoyés.",
      type: "tip",
      example: "10 devis envoyés, 3 acceptés = 30% de conversion",
    },

    // Quotes
    "quote.status.draft": {
      title: "Brouillon",
      description: "Ce devis est en cours de rédaction et n'a pas encore été envoyé au client.",
      type: "info",
    },
    "quote.status.sent": {
      title: "Envoyé",
      description: "Ce devis a été envoyé au client et est en attente de réponse.",
      type: "info",
    },
    "quote.vat.belgium": {
      title: "TVA Belgique",
      description: "Taux de TVA applicables en Belgique: 21% (standard), 6% (rénovation +10 ans).",
      type: "help",
      learnMoreUrl: "/help/vat-belgium",
    },
    "quote.ai.transcription": {
      title: "Transcription IA",
      description: "Dictez votre devis et l'IA le transcrit automatiquement en texte structuré.",
      type: "feature",
      shortcuts: [
        { key: "⌘ + M", description: "Démarrer l'enregistrement" },
        { key: "Échap", description: "Annuler" },
      ],
    },

    // Settings
    "settings.theme": {
      title: "Thème visuel",
      description: "Choisissez le thème de couleur qui correspond à votre style de travail.",
      type: "tip",
    },
    "settings.chantier": {
      title: "Mode Chantier",
      description: "Active des boutons plus grands et une interface optimisée pour les écrans tactiles en conditions de chantier.",
      type: "feature",
    },

    // RGPD
    "rgpd.consent.ai": {
      title: "Consentement IA",
      description: "Autorise le traitement de vos données par notre IA pour améliorer la génération de devis.",
      type: "warning",
    },
    "rgpd.data.export": {
      title: "Export de données",
      description: "Téléchargez toutes vos données personnelles au format JSON conformément au RGPD.",
      type: "info",
    },

    // Workflow
    "workflow.human_review": {
      title: "Contrôle humain",
      description: "Cette action nécessite votre validation avant d'être exécutée automatiquement.",
      type: "warning",
    },
  };

  return tooltips[key] || null;
}

/**
 * Composant helper pour tooltip avec clé
 */
export function TooltipByKey({
  children,
  tooltipKey,
  fallback,
  ...props
}: Omit<InteractiveTooltipProps, "content"> & {
  tooltipKey: string;
  fallback?: TooltipContent;
}) {
  const content = useTooltipContent(tooltipKey);

  if (!content && !fallback) {
    return <>{children}</>;
  }

  return (
    <InteractiveTooltip content={content || fallback!} {...props}>
      {children}
    </InteractiveTooltip>
  );
}

/**
 * Badge d'aide avec tooltip
 */
export function HelpBadge({
  tooltipKey,
  content,
  className,
}: {
  tooltipKey?: string;
  content?: TooltipContent;
  className?: string;
}) {
  const keyContent = tooltipKey ? useTooltipContent(tooltipKey) : null;
  const finalContent = content || keyContent;

  if (!finalContent) return null;

  return (
    <InteractiveTooltip content={finalContent}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center",
          "h-4 w-4 rounded-full",
          "bg-muted text-muted-foreground",
          "hover:bg-muted/80 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
      >
        <HelpCircle className="h-3 w-3" />
        <span className="sr-only">Aide</span>
      </button>
    </InteractiveTooltip>
  );
}
