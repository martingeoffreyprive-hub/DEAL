"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Send,
  FileDown,
  Loader2,
  Eye,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { LineGroup } from "./EditableLineTable";

interface BottomBarProps {
  groups: LineGroup[];
  formatCurrency: (n: number) => string;
  onSave: () => void;
  onPreviewToggle: () => void;
  onExportPDF: () => void;
  onSend?: () => void;
  saving: boolean;
  previewOpen: boolean;
  dirty: boolean;
}

function computeTotals(groups: LineGroup[]) {
  const allItems = groups.flatMap((g) => g.items);
  const vatBuckets: Record<number, number> = {};

  for (const item of allItems) {
    const ht = item.quantity * item.unitPrice;
    vatBuckets[item.vatRate] = (vatBuckets[item.vatRate] || 0) + ht;
  }

  const subtotalHT = Object.values(vatBuckets).reduce((s, v) => s + v, 0);
  const totalVAT = Object.entries(vatBuckets).reduce(
    (s, [rate, base]) => s + base * (parseInt(rate) / 100),
    0
  );
  return { subtotalHT, totalVAT, totalTTC: subtotalHT + totalVAT, lineCount: allItems.length };
}

export function BottomBar({
  groups,
  formatCurrency,
  onSave,
  onPreviewToggle,
  onExportPDF,
  onSend,
  saving,
  previewOpen,
  dirty,
}: BottomBarProps) {
  const { subtotalHT, totalVAT, totalTTC, lineCount } = computeTotals(groups);

  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md shadow-2xl"
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-2.5 flex items-center gap-4">
        {/* Line count */}
        <Badge variant="secondary" className="text-xs shrink-0">
          {lineCount} ligne{lineCount > 1 ? "s" : ""}
        </Badge>

        {/* Totals summary */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            HT <span className="font-medium text-foreground tabular-nums">{formatCurrency(subtotalHT)}</span>
          </span>
          <span className="text-muted-foreground">
            TVA <span className="font-medium text-foreground tabular-nums">{formatCurrency(totalVAT)}</span>
          </span>
          <Separator orientation="vertical" className="h-5" />
          <span className="font-bold text-deal-coral text-base tabular-nums">
            {formatCurrency(totalTTC)}
          </span>
        </div>

        {/* Mobile: just TTC */}
        <span className="md:hidden font-bold text-deal-coral tabular-nums">
          {formatCurrency(totalTTC)}
        </span>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewToggle}
            className="gap-1.5"
          >
            {previewOpen ? <ChevronDown className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="hidden sm:inline">{previewOpen ? "Masquer" : "Aperçu"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            className="gap-1.5"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>

          {onSend && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSend}
              className="gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={onSave}
            disabled={saving || !dirty}
            className="gap-1.5 bg-deal-coral hover:bg-deal-coral/90 text-white min-w-[100px]"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
