"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  X,
  Pencil,
  Save,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
  Download,
  Loader2,
  AlertTriangle,
  Sparkles,
  User,
  Building2,
  Euro,
  Calendar,
  Eye,
  EyeOff,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/contexts/locale-context";
import { formatCurrency as formatCurrencyFallback, formatDate as formatDateFallback } from "@/lib/utils";
import { LegalRiskAlert } from "./legal-risk-alert";
import type { Quote, QuoteItem, Profile, SectorType, SECTORS } from "@/types/database";
import type { LocaleCode } from "@/lib/locale-packs";

interface QuickApproveEditorProps {
  quote: Quote;
  items: QuoteItem[];
  profile: Profile | null;
  locale?: LocaleCode;
  onSave: (quote: Quote, items: QuoteItem[]) => Promise<void>;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onSendEmail?: () => Promise<void>;
  onDownloadPDF?: () => void;
  saving?: boolean;
}

type ValidationStatus = "pending" | "validated" | "modified" | "rejected";

interface ItemValidation {
  id: string;
  status: ValidationStatus;
  originalDescription: string;
  originalPrice: number;
  modifiedDescription?: string;
  modifiedPrice?: number;
}

function QuickItem({
  item,
  validation,
  onValidate,
  onReject,
  onModify,
  onReset,
  isEditing,
  setEditing,
}: {
  item: QuoteItem;
  validation: ItemValidation;
  onValidate: () => void;
  onReject: () => void;
  onModify: (description: string, price: number) => void;
  onReset: () => void;
  isEditing: boolean;
  setEditing: (editing: boolean) => void;
}) {
  const [editDescription, setEditDescription] = useState(item.description);
  const [editPrice, setEditPrice] = useState(item.unit_price);
  const total = item.quantity * item.unit_price;

  const getStatusColor = () => {
    switch (validation.status) {
      case "validated":
        return "border-l-green-500 bg-green-50/30";
      case "modified":
        return "border-l-blue-500 bg-blue-50/30";
      case "rejected":
        return "border-l-red-500 bg-red-50/30 opacity-50";
      default:
        return "border-l-gray-300";
    }
  };

  const handleSaveEdit = () => {
    onModify(editDescription, editPrice);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditDescription(item.description);
    setEditPrice(item.unit_price);
    setEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn(
        "p-3 rounded-lg border-l-4 transition-all",
        "border-l-blue-500 bg-blue-50/50"
      )}>
        <div className="space-y-3">
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description de la prestation..."
            className="min-h-[60px] text-sm"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{item.quantity} {item.unit} ×</span>
              <Input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                className="w-24 h-8 text-right"
                step="0.01"
              />
              <span className="text-sm text-muted-foreground">€</span>
            </div>
            <span className="text-sm">=</span>
            <span className="font-semibold text-primary">
              {formatCurrencyFallback(item.quantity * editPrice)}
            </span>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="gap-1">
              <Check className="h-3 w-3" />
              Valider
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-3 rounded-lg border-l-4 transition-all group",
      getStatusColor()
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className={cn(
            "text-sm",
            validation.status === "rejected" && "line-through"
          )}>
            {item.description || <span className="text-muted-foreground italic">Sans description</span>}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{item.quantity} {item.unit}</span>
            <span>×</span>
            <span>{formatCurrencyFallback(item.unit_price)}</span>
            <span>=</span>
            <span className="font-semibold text-foreground">{formatCurrencyFallback(total)}</span>
          </div>
          {validation.status === "modified" && (
            <p className="text-xs text-blue-600 mt-1">
              Modifié depuis l'original
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "flex items-center gap-1",
          validation.status !== "pending" ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          "transition-opacity"
        )}>
          {validation.status === "pending" ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={onValidate}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Valider</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={onReject}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Retirer</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  validation.status === "validated" && "bg-green-50 text-green-700 border-green-200",
                  validation.status === "modified" && "bg-blue-50 text-blue-700 border-blue-200",
                  validation.status === "rejected" && "bg-red-50 text-red-700 border-red-200"
                )}
              >
                {validation.status === "validated" && "Validé"}
                {validation.status === "modified" && "Modifié"}
                {validation.status === "rejected" && "Retiré"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onReset}
              >
                Réinitialiser
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuickApproveEditor({
  quote,
  items,
  profile,
  locale = "fr-BE",
  onSave,
  onApprove,
  onReject,
  onSendEmail,
  onDownloadPDF,
  saving = false,
}: QuickApproveEditorProps) {
  const { formatCurrency, formatDate } = useLocaleContext();

  // Validation state for each item
  const [validations, setValidations] = useState<Record<string, ItemValidation>>(() => {
    const initial: Record<string, ItemValidation> = {};
    items.forEach((item) => {
      initial[item.id] = {
        id: item.id,
        status: "pending",
        originalDescription: item.description,
        originalPrice: item.unit_price,
      };
    });
    return initial;
  });

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<QuoteItem[]>(items);
  const [localQuote, setLocalQuote] = useState<Quote>(quote);
  const [showNotes, setShowNotes] = useState(false);
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(true);

  // Update local items when validations change
  useEffect(() => {
    setLocalItems(
      items.map((item) => {
        const validation = validations[item.id];
        if (validation?.status === "modified") {
          return {
            ...item,
            description: validation.modifiedDescription || item.description,
            unit_price: validation.modifiedPrice || item.unit_price,
          };
        }
        return item;
      })
    );
  }, [items, validations]);

  // Calculate stats
  const validatedCount = Object.values(validations).filter((v) => v.status === "validated").length;
  const modifiedCount = Object.values(validations).filter((v) => v.status === "modified").length;
  const rejectedCount = Object.values(validations).filter((v) => v.status === "rejected").length;
  const pendingCount = Object.values(validations).filter((v) => v.status === "pending").length;
  const totalItems = items.length;

  // Calculate totals excluding rejected items
  const activeItems = localItems.filter((item) => validations[item.id]?.status !== "rejected");
  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxAmount = (subtotal * (localQuote.tax_rate || 21)) / 100;
  const total = subtotal + taxAmount;

  // Handlers
  const handleValidateItem = (itemId: string) => {
    setValidations((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status: "validated" },
    }));
  };

  const handleRejectItem = (itemId: string) => {
    setValidations((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status: "rejected" },
    }));
  };

  const handleModifyItem = (itemId: string, description: string, price: number) => {
    setValidations((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status: "modified",
        modifiedDescription: description,
        modifiedPrice: price,
      },
    }));
  };

  const handleResetItem = (itemId: string) => {
    setValidations((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status: "pending",
        modifiedDescription: undefined,
        modifiedPrice: undefined,
      },
    }));
  };

  const handleValidateAll = () => {
    const newValidations = { ...validations };
    Object.keys(newValidations).forEach((id) => {
      if (newValidations[id].status === "pending") {
        newValidations[id].status = "validated";
      }
    });
    setValidations(newValidations);
  };

  const handleSave = async () => {
    const finalItems = activeItems.map((item, index) => ({
      ...item,
      order_index: index,
      total: item.quantity * item.unit_price,
    }));

    const finalQuote = {
      ...localQuote,
      subtotal,
      tax_amount: taxAmount,
      total,
    };

    await onSave(finalQuote, finalItems);
  };

  const allValidated = pendingCount === 0;
  const hasChanges = modifiedCount > 0 || rejectedCount > 0;

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Validation rapide</h3>
              <p className="text-sm text-muted-foreground">
                Validez chaque ligne ou modifiez-la directement
              </p>
            </div>

            {/* Progress Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{validatedCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>{modifiedCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>{rejectedCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-300" />
                  <span>{pendingCount}</span>
                </div>
              </div>

              {pendingCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleValidateAll} className="gap-1">
                  <Check className="h-3 w-3" />
                  Tout valider
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(validatedCount / totalItems) * 100}%` }}
            />
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(modifiedCount / totalItems) * 100}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(rejectedCount / totalItems) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client & Quote Info Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{quote.client_name}</p>
            {quote.client_email && (
              <p className="text-muted-foreground text-xs">{quote.client_email}</p>
            )}
            {quote.client_phone && (
              <p className="text-muted-foreground text-xs">{quote.client_phone}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Devis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{quote.quote_number}</p>
            <p className="text-muted-foreground text-xs">
              {formatDate(quote.created_at)}
            </p>
            {quote.valid_until && (
              <p className="text-xs text-orange-600">
                Valide jusqu'au {formatDate(quote.valid_until)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legal Risk Analysis */}
      {showRiskAnalysis && (
        <LegalRiskAlert
          quote={localQuote}
          items={activeItems}
          locale={locale}
          onApplyFix={(risk) => {
            // Apply auto-fix logic here
            if (risk.autoFix?.type === "add_mention" && risk.autoFix.value) {
              setLocalQuote((prev) => ({
                ...prev,
                notes: (prev.notes || "") + "\n\n" + risk.autoFix!.value,
              }));
            }
          }}
        />
      )}

      {/* Items List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Prestations ({activeItems.length}/{totalItems})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            <div className="p-4 space-y-2">
              {items.map((item) => (
                <QuickItem
                  key={item.id}
                  item={validations[item.id]?.status === "modified"
                    ? {
                        ...item,
                        description: validations[item.id].modifiedDescription || item.description,
                        unit_price: validations[item.id].modifiedPrice || item.unit_price,
                      }
                    : item
                  }
                  validation={validations[item.id]}
                  onValidate={() => handleValidateItem(item.id)}
                  onReject={() => handleRejectItem(item.id)}
                  onModify={(desc, price) => handleModifyItem(item.id, desc, price)}
                  onReset={() => handleResetItem(item.id)}
                  isEditing={editingItemId === item.id}
                  setEditing={(editing) => setEditingItemId(editing ? item.id : null)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Notes Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={() => setShowNotes(!showNotes)}
      >
        <MessageSquare className="h-4 w-4" />
        Notes et conditions
        {showNotes ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
      </Button>

      {showNotes && (
        <Card>
          <CardContent className="p-4">
            <Textarea
              value={localQuote.notes || ""}
              onChange={(e) => setLocalQuote({ ...localQuote, notes: e.target.value })}
              placeholder="Conditions particulières, délais, modalités de paiement..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA ({localQuote.tax_rate || 21}%)</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total TTC</span>
              <span className="font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            {rejectedCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {rejectedCount} ligne{rejectedCount > 1 ? 's' : ''} retirée{rejectedCount > 1 ? 's' : ''}
                (économie: {formatCurrency(
                  items
                    .filter((item) => validations[item.id]?.status === "rejected")
                    .reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
                )})
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder
        </Button>

        {onDownloadPDF && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onDownloadPDF}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Télécharger PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {onSendEmail && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onSendEmail}>
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Envoyer par email</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {onApprove && allValidated && (
          <Button
            variant="default"
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={onApprove}
          >
            <Check className="h-4 w-4" />
            Finaliser
          </Button>
        )}
      </div>
    </div>
  );
}
