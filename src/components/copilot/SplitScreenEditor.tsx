"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PanelLeftClose,
  PanelRightClose,
  FileText,
  Eye,
  QrCode,
  User,
  StickyNote,
} from "lucide-react";
import { SECTORS, type SectorType } from "@/types/database";
import {
  EditableLineTable,
  TotalsSummary,
  type LineGroup,
} from "./EditableLineTable";
import { PdfPreview } from "./PdfPreview";
import { QrPayment } from "./QrPayment";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface SplitScreenEditorProps {
  // Data
  clientInfo: ClientInfo;
  onClientInfoChange: (info: ClientInfo) => void;
  sector: SectorType;
  onSectorChange: (sector: SectorType) => void;
  groups: LineGroup[];
  onGroupsChange: (groups: LineGroup[]) => void;
  notes: string;
  onNotesChange: (notes: string) => void;

  // Display
  formatCurrency: (n: number) => string;
  availableSectors: SectorType[];

  // Profile
  companyName?: string;
  companyAddress?: string;
  companyVat?: string;
  iban?: string | null;
  bic?: string | null;
  quoteNumber?: string;
  epcQRCode?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SplitScreenEditor({
  clientInfo,
  onClientInfoChange,
  sector,
  onSectorChange,
  groups,
  onGroupsChange,
  notes,
  onNotesChange,
  formatCurrency,
  availableSectors,
  companyName,
  companyAddress,
  companyVat,
  iban,
  bic,
  quoteNumber,
  epcQRCode,
}: SplitScreenEditorProps) {
  const [previewOpen, setPreviewOpen] = useState(true);
  const [rightTab, setRightTab] = useState<string>("preview");

  // Compute TTC for QR
  const allItems = groups.flatMap((g) => g.items);
  const subtotalHT = allItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalVAT = allItems.reduce(
    (s, i) => s + i.quantity * i.unitPrice * (i.vatRate / 100),
    0
  );
  const totalTTC = subtotalHT + totalVAT;

  return (
    <div className="flex h-[calc(100vh-280px)] gap-0 rounded-xl border overflow-hidden bg-background">
      {/* ==================== LEFT PANEL: Editor ==================== */}
      <div className={`flex flex-col transition-all duration-300 ${previewOpen ? "w-1/2 xl:w-[55%]" : "w-full"}`}>
        {/* Left header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/30">
          <FileText className="h-4 w-4 text-deal-coral" />
          <span className="text-sm font-semibold">Éditeur</span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPreviewOpen(!previewOpen)}
          >
            {previewOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6 pb-32">
            {/* Client + Sector */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Client & Secteur</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 flex gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Nom / Entreprise *</Label>
                    <Input
                      value={clientInfo.name}
                      onChange={(e) => onClientInfoChange({ ...clientInfo, name: e.target.value })}
                      placeholder="Jean Dupont"
                      className="h-9"
                    />
                  </div>
                  <div className="w-48 space-y-1">
                    <Label className="text-xs">Secteur</Label>
                    <Select value={sector} onValueChange={(v) => onSectorChange(v as SectorType)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSectors.map((s) => (
                          <SelectItem key={s} value={s}>{SECTORS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => onClientInfoChange({ ...clientInfo, email: e.target.value })}
                    placeholder="client@example.com"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Téléphone</Label>
                  <Input
                    value={clientInfo.phone}
                    onChange={(e) => onClientInfoChange({ ...clientInfo, phone: e.target.value })}
                    placeholder="+32 4XX XX XX XX"
                    className="h-9"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <Label className="text-xs">Adresse</Label>
                  <Input
                    value={clientInfo.address}
                    onChange={(e) => onClientInfoChange({ ...clientInfo, address: e.target.value })}
                    placeholder="15 rue des Lilas"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Ville</Label>
                  <Input
                    value={clientInfo.city}
                    onChange={(e) => onClientInfoChange({ ...clientInfo, city: e.target.value })}
                    placeholder="Bruxelles"
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Code postal</Label>
                  <Input
                    value={clientInfo.postalCode}
                    onChange={(e) => onClientInfoChange({ ...clientInfo, postalCode: e.target.value })}
                    placeholder="1000"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Line items table */}
            <div>
              <EditableLineTable
                groups={groups}
                onChange={onGroupsChange}
                sector={sector}
                formatCurrency={formatCurrency}
              />
            </div>

            <Separator />

            {/* Totals */}
            <div className="max-w-xs ml-auto">
              <TotalsSummary groups={groups} formatCurrency={formatCurrency} />
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Notes & Conditions</Label>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Conditions particulières, délais, modalités de paiement…"
                className="min-h-[80px] resize-y"
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* ==================== RIGHT PANEL: Preview / QR ==================== */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col border-l w-1/2 xl:w-[45%]"
          >
            {/* Tab bar */}
            <Tabs value={rightTab} onValueChange={setRightTab} className="flex flex-col h-full">
              <div className="px-3 py-2 border-b bg-muted/30">
                <TabsList className="h-8 p-0.5">
                  <TabsTrigger value="preview" className="text-xs gap-1.5 h-7 px-3">
                    <Eye className="h-3.5 w-3.5" />
                    Aperçu PDF
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="text-xs gap-1.5 h-7 px-3">
                    <QrCode className="h-3.5 w-3.5" />
                    QR Paiement
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                <PdfPreview
                  clientName={clientInfo.name}
                  clientEmail={clientInfo.email}
                  clientAddress={clientInfo.address}
                  clientCity={clientInfo.city}
                  clientPostalCode={clientInfo.postalCode}
                  clientPhone={clientInfo.phone}
                  sector={sector}
                  groups={groups}
                  notes={notes}
                  formatCurrency={formatCurrency}
                  quoteNumber={quoteNumber}
                  companyName={companyName}
                  companyAddress={companyAddress}
                  companyVat={companyVat}
                  epcQRCode={epcQRCode}
                />
              </TabsContent>

              <TabsContent value="qr" className="flex-1 m-0 overflow-auto p-4">
                <QrPayment
                  amount={totalTTC}
                  beneficiaryName={companyName || ""}
                  iban={iban}
                  bic={bic}
                  quoteNumber={quoteNumber}
                  formatCurrency={formatCurrency}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
