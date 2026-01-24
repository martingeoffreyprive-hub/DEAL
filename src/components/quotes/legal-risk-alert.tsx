"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Wand2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeQuote, type RiskAnalysisResult, type DetectedRisk, type RiskSeverity } from "@/lib/legal-risk";
import type { LocaleCode } from "@/lib/locale-packs";
import type { Quote, QuoteItem } from "@/types/database";

interface LegalRiskAlertProps {
  quote: Quote;
  items: QuoteItem[];
  locale?: LocaleCode;
  onApplyFix?: (risk: DetectedRisk) => void;
  compact?: boolean;
  className?: string;
}

const SEVERITY_CONFIG: Record<RiskSeverity, {
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  label: string;
}> = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    label: "Critique",
  },
  high: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    label: "Élevé",
  },
  medium: {
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    label: "Moyen",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    label: "Faible",
  },
  info: {
    icon: Info,
    color: "text-gray-600",
    bgColor: "bg-gray-50 border-gray-200",
    label: "Info",
  },
};

function RiskBadge({ severity, count }: { severity: RiskSeverity; count: number }) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  if (count === 0) return null;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1", config.bgColor, config.color)}
    >
      <Icon className="h-3 w-3" />
      {count}
    </Badge>
  );
}

function RiskItem({
  risk,
  onApplyFix,
}: {
  risk: DetectedRisk;
  onApplyFix?: (risk: DetectedRisk) => void;
}) {
  const config = SEVERITY_CONFIG[risk.severity];
  const Icon = config.icon;

  return (
    <div className={cn("p-3 rounded-lg border", config.bgColor)}>
      <div className="flex items-start gap-2">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{risk.description}</span>
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>

          {risk.text && (
            <p className="text-xs text-muted-foreground">
              Détecté: "<span className="font-mono bg-muted px-1 rounded">{risk.text}</span>"
            </p>
          )}

          <p className="text-xs text-muted-foreground">{risk.explanation}</p>

          {risk.suggestion && (
            <div className="flex items-start gap-2 pt-2">
              <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
              <p className="text-xs text-primary">{risk.suggestion}</p>
            </div>
          )}

          {risk.autoFix && onApplyFix && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs gap-1"
              onClick={() => onApplyFix(risk)}
            >
              <Wand2 className="h-3 w-3" />
              Corriger automatiquement
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskScore({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score === 0) return "text-green-600";
    if (score <= 15) return "text-blue-600";
    if (score <= 40) return "text-yellow-600";
    if (score <= 70) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = () => {
    if (score === 0) return "Aucun risque";
    if (score <= 15) return "Risque faible";
    if (score <= 40) return "Risque modéré";
    if (score <= 70) return "Risque élevé";
    return "Risque critique";
  };

  const getScoreIcon = () => {
    if (score === 0) return ShieldCheck;
    if (score <= 40) return Shield;
    return ShieldAlert;
  };

  const ScoreIcon = getScoreIcon();

  return (
    <div className="flex items-center gap-2">
      <ScoreIcon className={cn("h-5 w-5", getScoreColor())} />
      <div>
        <span className={cn("font-bold", getScoreColor())}>{score}</span>
        <span className="text-muted-foreground text-xs ml-1">/ 100</span>
        <p className={cn("text-xs", getScoreColor())}>{getScoreLabel()}</p>
      </div>
    </div>
  );
}

export function LegalRiskAlert({
  quote,
  items,
  locale = "fr-BE",
  onApplyFix,
  compact = false,
  className,
}: LegalRiskAlertProps) {
  const [analysis, setAnalysis] = useState<RiskAnalysisResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Analyser le devis quand il change
  useEffect(() => {
    const quoteData = {
      ...quote,
      items,
    };
    const result = analyzeQuote(quoteData, locale);
    setAnalysis(result);
  }, [quote, items, locale]);

  if (!analysis) return null;

  // Mode compact: juste un indicateur
  if (compact) {
    if (!analysis.hasRisks) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn("flex items-center gap-1", className)}>
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aucun risque juridique détecté</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto p-1 gap-1",
              analysis.criticalCount > 0 && "text-red-600",
              analysis.highCount > 0 && analysis.criticalCount === 0 && "text-orange-600",
              className
            )}
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="text-xs font-medium">{analysis.totalRisks}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Analyse des risques</h4>
              <RiskScore score={analysis.score} />
            </div>
            <div className="flex gap-2 mb-3">
              <RiskBadge severity="critical" count={analysis.criticalCount} />
              <RiskBadge severity="high" count={analysis.highCount} />
              <RiskBadge severity="medium" count={analysis.mediumCount} />
              <RiskBadge severity="low" count={analysis.lowCount} />
            </div>
            <Separator className="my-3" />
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {analysis.risks.map((risk) => (
                  <RiskItem
                    key={risk.id}
                    risk={risk}
                    onApplyFix={onApplyFix}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Mode complet
  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground"
        onClick={() => setIsVisible(true)}
      >
        <Eye className="h-4 w-4" />
        Afficher l'analyse des risques
      </Button>
    );
  }

  if (!analysis.hasRisks) {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200",
        className
      )}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <span className="text-sm text-green-800">Aucun risque juridique détecté</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
          onClick={() => setIsVisible(false)}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border",
      analysis.criticalCount > 0 ? "border-red-200 bg-red-50/50" :
      analysis.highCount > 0 ? "border-orange-200 bg-orange-50/50" :
      "border-yellow-200 bg-yellow-50/50",
      className
    )}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <ShieldAlert className={cn(
            "h-5 w-5",
            analysis.criticalCount > 0 ? "text-red-600" :
            analysis.highCount > 0 ? "text-orange-600" :
            "text-yellow-600"
          )} />
          <div>
            <span className="font-medium text-sm">
              {analysis.totalRisks} risque{analysis.totalRisks > 1 ? 's' : ''} détecté{analysis.totalRisks > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2 mt-1">
              <RiskBadge severity="critical" count={analysis.criticalCount} />
              <RiskBadge severity="high" count={analysis.highCount} />
              <RiskBadge severity="medium" count={analysis.mediumCount} />
              <RiskBadge severity="low" count={analysis.lowCount} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RiskScore score={analysis.score} />
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </div>
      </div>

      {/* Details */}
      {isExpanded && (
        <>
          <Separator />
          <div className="p-3">
            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Recommandations
                </h5>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <ChevronRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks list */}
            <div className="space-y-2">
              {analysis.risks.map((risk) => (
                <RiskItem key={risk.id} risk={risk} onApplyFix={onApplyFix} />
              ))}
            </div>

            {/* Auto-fix all button */}
            {analysis.autoFixAvailable && onApplyFix && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 gap-2"
                onClick={() => {
                  analysis.risks
                    .filter((r) => r.autoFix)
                    .forEach((r) => onApplyFix(r));
                }}
              >
                <Wand2 className="h-4 w-4" />
                Corriger tous les risques automatiquement
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
