"use client";

import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ComplianceResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

interface ComplianceAlertProps {
  result: ComplianceResult;
  localeName: string;
  className?: string;
}

export function ComplianceAlert({ result, localeName, className }: ComplianceAlertProps) {
  const [isOpen, setIsOpen] = useState(true);

  const hasIssues = result.errors.length > 0 || result.warnings.length > 0 || result.info.length > 0;

  if (!hasIssues) {
    return (
      <Alert className={cn("border-green-200 bg-green-50 dark:bg-green-950/20", className)}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">
          Conformité {localeName}
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          Votre devis respecte les exigences légales pour {localeName}.
        </AlertDescription>
      </Alert>
    );
  }

  const totalIssues = result.errors.length + result.warnings.length + result.info.length;
  const variant = result.errors.length > 0 ? "destructive" : "default";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert
        variant={variant}
        className={cn(
          result.errors.length > 0
            ? ""
            : result.warnings.length > 0
            ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20"
            : "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
          className
        )}
      >
        <CollapsibleTrigger className="flex items-start gap-2 w-full text-left">
          {result.errors.length > 0 ? (
            <AlertCircle className="h-4 w-4 mt-0.5" />
          ) : result.warnings.length > 0 ? (
            <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-600" />
          ) : (
            <Info className="h-4 w-4 mt-0.5 text-blue-600" />
          )}
          <div className="flex-1">
            <AlertTitle className="flex items-center justify-between">
              <span
                className={cn(
                  result.errors.length > 0
                    ? ""
                    : result.warnings.length > 0
                    ? "text-yellow-800 dark:text-yellow-200"
                    : "text-blue-800 dark:text-blue-200"
                )}
              >
                Conformité {localeName}
              </span>
              <div className="flex items-center gap-2">
                {result.errors.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {result.errors.length} erreur{result.errors.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {result.warnings.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-yellow-400 text-yellow-700 dark:text-yellow-300"
                  >
                    {result.warnings.length} avertissement{result.warnings.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {result.info.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-400 text-blue-700 dark:text-blue-300"
                  >
                    {result.info.length} info{result.info.length > 1 ? "s" : ""}
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen ? "rotate-180" : ""
                  )}
                />
              </div>
            </AlertTitle>
            <AlertDescription
              className={cn(
                "text-sm",
                result.errors.length > 0
                  ? ""
                  : result.warnings.length > 0
                  ? "text-yellow-700 dark:text-yellow-300"
                  : "text-blue-700 dark:text-blue-300"
              )}
            >
              {totalIssues} point{totalIssues > 1 ? "s" : ""} de conformité à vérifier
            </AlertDescription>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3 space-y-3">
          {result.errors.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Erreurs (bloquantes)
              </p>
              <ul className="space-y-1">
                {result.errors.map((error, index) => (
                  <li
                    key={`error-${index}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="space-y-1.5">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  result.errors.length > 0
                    ? "text-yellow-600"
                    : "opacity-70"
                )}
              >
                Avertissements
              </p>
              <ul className="space-y-1">
                {result.warnings.map((warning, index) => (
                  <li
                    key={`warning-${index}`}
                    className={cn(
                      "flex items-start gap-2 text-sm",
                      result.errors.length > 0
                        ? "text-yellow-700 dark:text-yellow-300"
                        : ""
                    )}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-600" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.info.length > 0 && (
            <div className="space-y-1.5">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  result.errors.length > 0 || result.warnings.length > 0
                    ? "text-blue-600"
                    : "opacity-70"
                )}
              >
                Informations
              </p>
              <ul className="space-y-1">
                {result.info.map((info, index) => (
                  <li
                    key={`info-${index}`}
                    className={cn(
                      "flex items-start gap-2 text-sm",
                      result.errors.length > 0 || result.warnings.length > 0
                        ? "text-blue-700 dark:text-blue-300"
                        : ""
                    )}
                  >
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-600" />
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
}
