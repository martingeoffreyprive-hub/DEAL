"use client";

import { useState } from "react";
import { Filter, X, Calendar, Building2, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { SECTORS, type SectorType } from "@/types/database";

export type QuoteStatus =
  | "all"
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "finalized"
  | "exported"
  | "archived";

export type DateRange = "all" | "today" | "week" | "month" | "quarter" | "year";

export interface QuoteFilters {
  status: QuoteStatus;
  sector: SectorType | "all";
  dateRange: DateRange;
}

interface QuoteFiltersProps {
  filters: QuoteFilters;
  onChange: (filters: QuoteFilters) => void;
  className?: string;
}

const STATUS_OPTIONS: { value: QuoteStatus; label: string; color: string }[] = [
  { value: "all", label: "Tous les statuts", color: "bg-muted" },
  { value: "draft", label: "Brouillon", color: "bg-gray-500" },
  { value: "sent", label: "Envoyé", color: "bg-blue-500" },
  { value: "accepted", label: "Accepté", color: "bg-green-500" },
  { value: "rejected", label: "Refusé", color: "bg-red-500" },
  { value: "finalized", label: "Finalisé", color: "bg-purple-500" },
  { value: "exported", label: "Exporté", color: "bg-amber-500" },
  { value: "archived", label: "Archivé", color: "bg-slate-500" },
];

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
  { value: "quarter", label: "Ce trimestre" },
  { value: "year", label: "Cette année" },
];

export function QuoteFilters({ filters, onChange, className }: QuoteFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = [
    filters.status !== "all",
    filters.sector !== "all",
    filters.dateRange !== "all",
  ].filter(Boolean).length;

  const handleReset = () => {
    onChange({
      status: "all",
      sector: "all",
      dateRange: "all",
    });
  };

  const updateFilter = <K extends keyof QuoteFilters>(
    key: K,
    value: QuoteFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtrer les devis</h4>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-7 text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Réinitialiser
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Statut
              </label>
              <Select
                value={filters.status}
                onValueChange={(value: QuoteStatus) =>
                  updateFilter("status", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        {option.value !== "all" && (
                          <span
                            className={`w-2 h-2 rounded-full ${option.color}`}
                          />
                        )}
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sector Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Secteur
              </label>
              <Select
                value={filters.sector}
                onValueChange={(value: SectorType | "all") =>
                  updateFilter("sector", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  {(Object.entries(SECTORS) as [SectorType, string][]).map(
                    ([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Période
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value: DateRange) =>
                  updateFilter("dateRange", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filters as badges */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {filters.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
              <button
                onClick={() => updateFilter("status", "all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.sector !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {SECTORS[filters.sector]}
              <button
                onClick={() => updateFilter("sector", "all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.dateRange !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {DATE_OPTIONS.find((o) => o.value === filters.dateRange)?.label}
              <button
                onClick={() => updateFilter("dateRange", "all")}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Filter quotes based on filters
 */
export function filterQuotes<
  T extends {
    status?: string;
    sector?: string;
    created_at?: string;
  }
>(quotes: T[], filters: QuoteFilters): T[] {
  return quotes.filter((quote) => {
    // Status filter
    if (filters.status !== "all" && quote.status !== filters.status) {
      return false;
    }

    // Sector filter
    if (filters.sector !== "all" && quote.sector !== filters.sector) {
      return false;
    }

    // Date range filter
    if (filters.dateRange !== "all" && quote.created_at) {
      const quoteDate = new Date(quote.created_at);
      const now = new Date();

      switch (filters.dateRange) {
        case "today": {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (quoteDate < today) return false;
          break;
        }
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (quoteDate < weekAgo) return false;
          break;
        }
        case "month": {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          if (quoteDate < monthStart) return false;
          break;
        }
        case "quarter": {
          const quarter = Math.floor(now.getMonth() / 3);
          const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
          if (quoteDate < quarterStart) return false;
          break;
        }
        case "year": {
          const yearStart = new Date(now.getFullYear(), 0, 1);
          if (quoteDate < yearStart) return false;
          break;
        }
      }
    }

    return true;
  });
}

export default QuoteFilters;
