"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { SECTORS, type SectorType } from "@/types/database";
import type { LineGroup } from "./EditableLineTable";

interface PdfPreviewProps {
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientPhone?: string;
  sector: SectorType;
  groups: LineGroup[];
  notes?: string;
  formatCurrency: (n: number) => string;
  quoteNumber?: string;
  companyName?: string;
  companyAddress?: string;
  companyVat?: string;
  epcQRCode?: string | null;
}

function computeBreakdown(groups: LineGroup[]) {
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
  return { vatBuckets, subtotalHT, totalVAT, totalTTC: subtotalHT + totalVAT };
}

export function PdfPreview({
  clientName,
  clientEmail,
  clientAddress,
  clientCity,
  clientPostalCode,
  clientPhone,
  sector,
  groups,
  notes,
  formatCurrency,
  quoteNumber,
  companyName,
  companyAddress,
  companyVat,
  epcQRCode,
}: PdfPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const { vatBuckets, subtotalHT, totalVAT, totalTTC } = useMemo(() => computeBreakdown(groups), [groups]);
  const allItems = groups.flatMap((g) => g.items);
  const today = new Date().toLocaleDateString("fr-BE");

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        <Badge variant="outline" className="text-2xs">Aperçu live</Badge>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(50, zoom - 10))}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(150, zoom + 10))}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(100)}>
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* A4 preview */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 p-4">
        <div
          className="mx-auto bg-white shadow-xl rounded-sm origin-top"
          style={{
            width: `${595 * (zoom / 100)}px`,
            minHeight: `${842 * (zoom / 100)}px`,
            transform: `scale(1)`,
            fontSize: `${10 * (zoom / 100)}px`,
          }}
        >
          <div className="p-8 text-gray-900" style={{ fontSize: "inherit" }}>
            {/* Header */}
            <div className="flex justify-between mb-6">
              <div>
                <div className="text-lg font-bold text-[#252B4A]">{companyName || "Mon Entreprise"}</div>
                {companyAddress && <div className="text-xs text-gray-500">{companyAddress}</div>}
                {companyVat && <div className="text-xs text-gray-500">TVA: {companyVat}</div>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#E85A5A]">DEVIS</div>
                {quoteNumber && <div className="text-xs text-gray-500">{quoteNumber}</div>}
                <div className="text-xs text-gray-500">{today}</div>
              </div>
            </div>

            {/* Quote info bar */}
            <div className="flex gap-4 p-3 bg-gray-50 rounded mb-4">
              <div>
                <div className="text-[8px] uppercase text-gray-400 tracking-wide">Secteur</div>
                <div className="text-xs font-semibold">{SECTORS[sector]}</div>
              </div>
              <div>
                <div className="text-[8px] uppercase text-gray-400 tracking-wide">Lignes</div>
                <div className="text-xs font-semibold">{allItems.length}</div>
              </div>
            </div>

            {/* Client */}
            <div className="mb-4">
              <div className="text-[9px] uppercase text-gray-400 tracking-wide font-semibold border-b border-gray-200 pb-1 mb-2">
                Client
              </div>
              <div className="text-xs font-semibold">{clientName || "—"}</div>
              {clientAddress && <div className="text-xs text-gray-600">{clientAddress}</div>}
              {(clientPostalCode || clientCity) && (
                <div className="text-xs text-gray-600">{clientPostalCode} {clientCity}</div>
              )}
              {clientEmail && <div className="text-xs text-gray-600">{clientEmail}</div>}
              {clientPhone && <div className="text-xs text-gray-600">Tél: {clientPhone}</div>}
            </div>

            {/* Items table */}
            <div className="mb-4">
              <div className="text-[9px] uppercase text-gray-400 tracking-wide font-semibold border-b border-gray-200 pb-1 mb-2">
                Prestations
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#252B4A] text-white">
                    <th className="p-1.5 text-left text-[9px]">Description</th>
                    <th className="p-1.5 text-center text-[9px] w-12">Qté</th>
                    <th className="p-1.5 text-center text-[9px] w-14">Unité</th>
                    <th className="p-1.5 text-right text-[9px] w-16">P.U. HT</th>
                    <th className="p-1.5 text-center text-[9px] w-12">TVA</th>
                    <th className="p-1.5 text-right text-[9px] w-16">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) =>
                    group.items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 1 ? "bg-gray-50" : ""}>
                        <td className="p-1.5">{item.description || <span className="text-gray-300 italic">—</span>}</td>
                        <td className="p-1.5 text-center">{item.quantity}</td>
                        <td className="p-1.5 text-center">{item.unit}</td>
                        <td className="p-1.5 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="p-1.5 text-center">
                          <span className="text-[8px] px-1 py-0.5 rounded bg-gray-100">{item.vatRate}%</span>
                        </td>
                        <td className="p-1.5 text-right font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-56 space-y-0.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total HT</span>
                  <span className="font-medium">{formatCurrency(subtotalHT)}</span>
                </div>
                {Object.entries(vatBuckets)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([rate, base]) => {
                    const r = parseInt(rate);
                    if (r === 0) return null;
                    return (
                      <div key={rate} className="flex justify-between text-gray-500">
                        <span>TVA {rate}%</span>
                        <span>{formatCurrency(base * (r / 100))}</span>
                      </div>
                    );
                  })}
                <div className="flex justify-between pt-1.5 border-t-2 border-[#E85A5A] font-bold text-sm">
                  <span>Total TTC</span>
                  <span className="text-[#E85A5A]">{formatCurrency(totalTTC)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mt-4 p-3 bg-amber-50 border-l-3 border-amber-400 rounded text-xs">
                <div className="font-semibold text-amber-800 mb-1">Conditions</div>
                <div className="text-amber-700 whitespace-pre-wrap">{notes}</div>
              </div>
            )}

            {/* Signature block */}
            <div className="mt-6 flex justify-between">
              <div>
                <div className="w-44 border-t border-gray-400 mt-10" />
                <div className="text-[8px] text-gray-400 mt-1">Date et signature du client</div>
              </div>
              <div className="text-[8px] text-gray-400 mt-10">Mention "Lu et approuvé"</div>
            </div>

            {/* QR code */}
            {epcQRCode && (
              <div className="mt-4 flex justify-end">
                <div className="text-center">
                  <img src={epcQRCode} alt="QR Paiement" className="w-16 h-16" />
                  <div className="text-[7px] text-gray-400 mt-0.5">Scanner pour payer</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 pt-3 border-t border-gray-200 text-[7px] text-gray-400 text-center">
              Devis valable 30 jours. En cas d'acceptation, ce devis fait office de contrat.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
