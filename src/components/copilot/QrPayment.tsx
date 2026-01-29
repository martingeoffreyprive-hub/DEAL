"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Copy, Check, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QrPaymentProps {
  amount: number;
  beneficiaryName: string;
  iban?: string | null;
  bic?: string | null;
  quoteNumber?: string;
  formatCurrency: (n: number) => string;
}

/**
 * EPC QR Code generator widget.
 * Uses the `qrcode` library (already in dependencies) to generate
 * a Girocode / EPC QR code for SEPA credit transfers.
 */
export function QrPayment({
  amount,
  beneficiaryName,
  iban,
  bic,
  quoteNumber,
  formatCurrency,
}: QrPaymentProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const canGenerate = !!iban && iban.length >= 15 && amount > 0;

  useEffect(() => {
    if (!canGenerate) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Build EPC payload (Girocode)
    const epcPayload = [
      "BCD",                    // Service tag
      "002",                    // Version
      "1",                      // Character set (UTF-8)
      "SCT",                    // SEPA Credit Transfer
      bic || "",                // BIC (optional since SEPA 2.0)
      beneficiaryName.slice(0, 70),
      iban!.replace(/\s/g, ""),
      `EUR${amount.toFixed(2)}`,
      "",                       // Purpose
      quoteNumber ? `Devis ${quoteNumber}` : "",
      "",                       // Reference
      "",                       // Information
    ].join("\n");

    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(epcPayload, {
        width: 200,
        margin: 2,
        color: { dark: "#252B4A", light: "#FFFFFF" },
        errorCorrectionLevel: "M",
      }).then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setLoading(false);
        }
      }).catch(() => {
        if (!cancelled) setLoading(false);
      });
    });

    return () => { cancelled = true; };
  }, [canGenerate, iban, bic, beneficiaryName, amount, quoteNumber]);

  const copyIBAN = () => {
    if (!iban) return;
    navigator.clipboard.writeText(iban.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!iban) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center text-muted-foreground text-sm">
          <QrCode className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>Ajoutez votre IBAN dans les paramètres de profil pour activer le QR code de paiement.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <QrCode className="h-4 w-4 text-deal-coral" />
          QR Code de paiement
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Code EPC / Girocode SEPA. Le client scanne avec son app bancaire pour pré-remplir un virement.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* QR */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-[160px] h-[160px] bg-muted/50 rounded-lg animate-pulse flex items-center justify-center">
              <QrCode className="h-8 w-8 text-muted-foreground/30" />
            </div>
          ) : qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Paiement" className="w-[160px] h-[160px] rounded-lg" />
          ) : (
            <div className="w-[160px] h-[160px] bg-muted/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
              Montant requis
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-center">
          <Badge className="bg-deal-coral/10 text-deal-coral text-sm font-bold px-3 py-1">
            {formatCurrency(amount)}
          </Badge>
        </div>

        {/* IBAN */}
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <div className="text-2xs text-muted-foreground uppercase tracking-wide">IBAN</div>
            <div className="text-xs font-mono">{iban}</div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyIBAN}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {bic && (
          <div className="px-3 text-2xs text-muted-foreground">
            BIC: <span className="font-mono">{bic}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
