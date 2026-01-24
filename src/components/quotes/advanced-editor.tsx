"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  SECTORS,
  TAX_RATES,
  UNITS,
  getSectorConfig,
  type Quote,
  type QuoteItem,
  type Profile,
  type SectorType,
  type SectorConfig,
} from "@/types/database";
import {
  Loader2,
  Save,
  Trash2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileText,
  Mail,
  ClipboardCheck,
  Package,
  Clock,
  Pen,
  Calculator,
  Wand2,
  Copy,
  RotateCcw,
  MessageSquare,
} from "lucide-react";

// Types
interface Section {
  id: string;
  title: string;
  items: QuoteItem[];
  collapsed: boolean;
}

interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface LaborEstimate {
  id: string;
  task: string;
  hours: number;
  hourlyRate: number;
  workers: number;
}

interface AdvancedEditorProps {
  quote: Quote;
  items: QuoteItem[];
  profile: Profile | null;
  onSave: (quote: Quote, items: QuoteItem[]) => Promise<void>;
  saving: boolean;
}

// Auto-resizing textarea
function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  className = "",
  minRows = 1,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, minRows * 24)}px`;
    }
  }, [value, minRows]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none overflow-hidden border-0 bg-transparent p-0 focus:outline-none focus:ring-0 ${className}`}
      rows={minRows}
    />
  );
}

// Inline editable field
function InlineEdit({
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
  suffix,
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  type?: "text" | "number" | "currency";
  placeholder?: string;
  className?: string;
  suffix?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (type === "number" || type === "currency") {
      onChange(parseFloat(tempValue) || 0);
    } else {
      onChange(tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setTempValue(String(value));
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type === "currency" ? "number" : type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        step={type === "currency" ? "0.01" : undefined}
        className={`border-b-2 border-primary bg-transparent outline-none ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setTempValue(String(value));
        setEditing(true);
      }}
      className={`cursor-pointer hover:bg-muted/50 px-1 rounded transition-colors ${className}`}
    >
      {type === "currency" ? formatCurrency(Number(value)) : value}
      {suffix}
    </span>
  );
}

// Sortable Item Component
function SortableItem({
  item,
  index,
  onUpdateItem,
  onDeleteItem,
  sectorUnits,
}: {
  item: QuoteItem;
  index: number;
  onUpdateItem: (itemId: string, field: keyof QuoteItem, value: any) => void;
  onDeleteItem: (itemId: string) => void;
  sectorUnits: string[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors group ${
        isDragging ? "ring-2 ring-primary shadow-lg" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mt-1 touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
      </div>
      <span className="text-xs text-muted-foreground mt-1 w-5">
        {index + 1}.
      </span>
      <div className="flex-1 space-y-2">
        <AutoResizeTextarea
          value={item.description}
          onChange={(value) => onUpdateItem(item.id, "description", value)}
          placeholder="Description de la prestation..."
          className="text-sm"
        />
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <InlineEdit
              value={item.quantity}
              onChange={(value) => onUpdateItem(item.id, "quantity", value)}
              type="number"
              className="w-16 text-center"
            />
            <Select
              value={item.unit}
              onValueChange={(value) => onUpdateItem(item.id, "unit", value)}
            >
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sectorUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-muted-foreground">×</span>
          <InlineEdit
            value={item.unit_price}
            onChange={(value) => onUpdateItem(item.id, "unit_price", value)}
            type="currency"
            className="w-24"
          />
          <span className="text-muted-foreground">=</span>
          <span className="font-semibold text-primary">
            {formatCurrency(item.quantity * item.unit_price)}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
        onClick={() => onDeleteItem(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Drag Overlay Item (shown while dragging)
function DragOverlayItem({ item }: { item: QuoteItem }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-card rounded-lg shadow-xl border-2 border-primary">
      <GripVertical className="h-4 w-4 text-primary mt-1" />
      <div className="flex-1">
        <p className="text-sm font-medium truncate">{item.description || "Sans description"}</p>
        <p className="text-xs text-muted-foreground">
          {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
        </p>
      </div>
      <span className="font-semibold text-primary">
        {formatCurrency(item.quantity * item.unit_price)}
      </span>
    </div>
  );
}

// Droppable Section Component
function DroppableSection({
  section,
  onUpdate,
  onDelete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  isOver,
  sectorUnits,
}: {
  section: Section;
  onUpdate: (section: Section) => void;
  onDelete: () => void;
  onAddItem: () => void;
  onUpdateItem: (itemId: string, field: keyof QuoteItem, value: any) => void;
  onDeleteItem: (itemId: string) => void;
  isOver: boolean;
  sectorUnits: string[];
}) {
  const { setNodeRef } = useDroppable({ id: section.id });

  const sectionTotal = section.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  return (
    <div
      ref={setNodeRef}
      className={`border rounded-lg overflow-hidden bg-card transition-all ${
        isOver ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
      }`}
    >
      {/* Section Header */}
      <div
        className="flex items-center gap-2 p-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
        onClick={() => onUpdate({ ...section, collapsed: !section.collapsed })}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        {section.collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        <InlineEdit
          value={section.title}
          onChange={(value) => onUpdate({ ...section, title: String(value) })}
          placeholder="Titre de la section"
          className="font-semibold flex-1"
        />
        <Badge variant="secondary">{section.items.length} lignes</Badge>
        <span className="font-semibold text-primary">
          {formatCurrency(sectionTotal)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Section Content */}
      {!section.collapsed && (
        <div className="p-3 space-y-2">
          <SortableContext
            items={section.items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {section.items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                index={index}
                onUpdateItem={onUpdateItem}
                onDeleteItem={onDeleteItem}
                sectorUnits={sectorUnits}
              />
            ))}
          </SortableContext>
          {section.items.length === 0 && isOver && (
            <div className="p-4 border-2 border-dashed border-primary rounded-lg text-center text-primary">
              Déposez ici
            </div>
          )}
          {section.items.length === 0 && !isOver && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Aucune ligne. Glissez-déposez ou ajoutez-en une.
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddItem}
            className="w-full border-dashed border"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une ligne
          </Button>
        </div>
      )}
    </div>
  );
}

// AI Assistant Dialog
function AIAssistantDialog({
  quote,
  items,
  onApplySuggestion,
}: {
  quote: Quote;
  items: QuoteItem[];
  onApplySuggestion: (suggestion: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const actions = [
    {
      id: "audit",
      label: "Auditer le devis",
      description: "Vérifier la cohérence des prix pour ce métier",
      icon: ClipboardCheck,
    },
    {
      id: "optimize",
      label: "Optimiser les prix",
      description: "Ajuster les prix selon le marché du secteur",
      icon: Calculator,
    },
    {
      id: "suggest",
      label: "Suggérer des prestations",
      description: "Proposer des services complémentaires",
      icon: Sparkles,
    },
    {
      id: "email",
      label: "Générer un email",
      description: "Email adapté au vocabulaire du métier",
      icon: Mail,
    },
    {
      id: "materials",
      label: "Estimer les matériaux",
      description: "Liste de fournitures spécifiques au secteur",
      icon: Package,
    },
    {
      id: "planning",
      label: "Estimer le planning",
      description: "Temps de travail réaliste pour ce métier",
      icon: Clock,
    },
    {
      id: "improve",
      label: "Améliorer les descriptions",
      description: "Vocabulaire technique professionnel",
      icon: Wand2,
    },
  ];

  const executeAction = async (actionId: string) => {
    setAction(actionId);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionId,
          quote,
          items,
        }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'exécution");

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter l'action IA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Assistant IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Assistant IA QuoteVoice
          </DialogTitle>
          <DialogDescription>
            Utilisez l'IA pour optimiser et enrichir votre devis
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {actions.map((a) => (
            <Button
              key={a.id}
              variant={action === a.id ? "default" : "outline"}
              className="h-auto flex-col items-start p-4 gap-1"
              onClick={() => executeAction(a.id)}
              disabled={loading}
            >
              <div className="flex items-center gap-2">
                <a.icon className="h-4 w-4" />
                <span className="font-semibold">{a.label}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left">
                {a.description}
              </span>
            </Button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Analyse en cours...</span>
          </div>
        )}

        {result && (
          <ScrollArea className="h-64 border rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          {result && (
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(result);
                toast({ title: "Copié !" });
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
          )}
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Signature Pad
function SignaturePad({
  onSave,
}: {
  onSave: (signature: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL("image/png");
    onSave(signature);
  };

  return (
    <div className="space-y-2">
      <Label>Signature du client</Label>
      <div className="border rounded-lg p-2 bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full border rounded cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={clear}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Effacer
        </Button>
        <Button size="sm" onClick={save} disabled={!hasSignature}>
          <Pen className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

// Materials List
function MaterialsList({
  materials,
  onUpdate,
}: {
  materials: Material[];
  onUpdate: (materials: Material[]) => void;
}) {
  const addMaterial = () => {
    onUpdate([
      ...materials,
      {
        id: `mat-${Date.now()}`,
        name: "",
        category: "Fournitures",
        quantity: 1,
        unit: "unité",
        unitPrice: 0,
      },
    ]);
  };

  const updateMaterial = (id: string, field: keyof Material, value: any) => {
    onUpdate(
      materials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const deleteMaterial = (id: string) => {
    onUpdate(materials.filter((m) => m.id !== id));
  };

  const total = materials.reduce(
    (sum, m) => sum + m.quantity * m.unitPrice,
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Liste des matériaux
        </Label>
        <Button variant="outline" size="sm" onClick={addMaterial}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {materials.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun matériau. Utilisez l'assistant IA pour générer une liste.
        </p>
      ) : (
        <div className="space-y-2">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
            >
              <Input
                value={material.name}
                onChange={(e) => updateMaterial(material.id, "name", e.target.value)}
                placeholder="Nom du matériau"
                className="flex-1 h-8"
              />
              <Input
                type="number"
                value={material.quantity}
                onChange={(e) =>
                  updateMaterial(material.id, "quantity", parseFloat(e.target.value) || 0)
                }
                className="w-16 h-8 text-center"
              />
              <Select
                value={material.unit}
                onValueChange={(value) => updateMaterial(material.id, "unit", value)}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={material.unitPrice}
                onChange={(e) =>
                  updateMaterial(material.id, "unitPrice", parseFloat(e.target.value) || 0)
                }
                className="w-20 h-8 text-right"
                step="0.01"
              />
              <span className="w-20 text-right font-medium">
                {formatCurrency(material.quantity * material.unitPrice)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => deleteMaterial(material.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t">
            <span className="font-semibold">
              Total matériaux: {formatCurrency(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Labor Estimates
function LaborEstimates({
  estimates,
  onUpdate,
}: {
  estimates: LaborEstimate[];
  onUpdate: (estimates: LaborEstimate[]) => void;
}) {
  const addEstimate = () => {
    onUpdate([
      ...estimates,
      {
        id: `labor-${Date.now()}`,
        task: "",
        hours: 1,
        hourlyRate: 45,
        workers: 1,
      },
    ]);
  };

  const updateEstimate = (id: string, field: keyof LaborEstimate, value: any) => {
    onUpdate(
      estimates.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const deleteEstimate = (id: string) => {
    onUpdate(estimates.filter((e) => e.id !== id));
  };

  const totalHours = estimates.reduce(
    (sum, e) => sum + e.hours * e.workers,
    0
  );
  const totalCost = estimates.reduce(
    (sum, e) => sum + e.hours * e.hourlyRate * e.workers,
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Estimation main d'œuvre
        </Label>
        <Button variant="outline" size="sm" onClick={addEstimate}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {estimates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune estimation. Utilisez l'assistant IA pour générer un planning.
        </p>
      ) : (
        <div className="space-y-2">
          {estimates.map((estimate) => (
            <div
              key={estimate.id}
              className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
            >
              <Input
                value={estimate.task}
                onChange={(e) => updateEstimate(estimate.id, "task", e.target.value)}
                placeholder="Tâche"
                className="flex-1 h-8"
              />
              <Input
                type="number"
                value={estimate.hours}
                onChange={(e) =>
                  updateEstimate(estimate.id, "hours", parseFloat(e.target.value) || 0)
                }
                className="w-16 h-8 text-center"
              />
              <span className="text-xs text-muted-foreground">h ×</span>
              <Input
                type="number"
                value={estimate.workers}
                onChange={(e) =>
                  updateEstimate(estimate.id, "workers", parseInt(e.target.value) || 1)
                }
                className="w-12 h-8 text-center"
              />
              <span className="text-xs text-muted-foreground">pers. @</span>
              <Input
                type="number"
                value={estimate.hourlyRate}
                onChange={(e) =>
                  updateEstimate(estimate.id, "hourlyRate", parseFloat(e.target.value) || 0)
                }
                className="w-16 h-8 text-right"
              />
              <span className="text-xs text-muted-foreground">€/h =</span>
              <span className="w-20 text-right font-medium">
                {formatCurrency(estimate.hours * estimate.hourlyRate * estimate.workers)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => deleteEstimate(estimate.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex justify-between pt-2 border-t text-sm">
            <span className="text-muted-foreground">
              Total: {totalHours} heures
            </span>
            <span className="font-semibold">
              Coût main d'œuvre: {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Advanced Editor Component
export function AdvancedQuoteEditor({
  quote,
  items,
  profile,
  onSave,
  saving,
}: AdvancedEditorProps) {
  const { toast } = useToast();

  // Get sector configuration
  const sectorConfig = getSectorConfig(quote.sector as SectorType);
  const sectorUnits = sectorConfig.units;

  // Initialize sections with sector-specific default name
  const [localQuote, setLocalQuote] = useState<Quote>(quote);
  const [sections, setSections] = useState<Section[]>(() => {
    const defaultSectionTitle = sectorConfig.defaultSections[0] || "Prestations";
    return [
      {
        id: "main",
        title: defaultSectionTitle,
        items: items,
        collapsed: false,
      },
    ];
  });
  const [materials, setMaterials] = useState<Material[]>([]);
  const [laborEstimates, setLaborEstimates] = useState<LaborEstimate[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showLabor, setShowLabor] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  // Drag and Drop state
  const [activeItem, setActiveItem] = useState<QuoteItem | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find item and its section
  const findItemAndSection = (itemId: string) => {
    for (const section of sections) {
      const item = section.items.find((i) => i.id === itemId);
      if (item) {
        return { item, section };
      }
    }
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const result = findItemAndSection(active.id as string);
    if (result) {
      setActiveItem(result.item);
    }
  };

  // Handle drag over (for visual feedback)
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      // Check if over a section
      const section = sections.find((s) => s.id === over.id);
      if (section) {
        setOverSectionId(section.id);
      } else {
        // Over an item - find its section
        const result = findItemAndSection(over.id as string);
        if (result) {
          setOverSectionId(result.section.id);
        }
      }
    } else {
      setOverSectionId(null);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    setOverSectionId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source section and item
    const sourceResult = findItemAndSection(activeId);
    if (!sourceResult) return;

    const { item: activeItemData, section: sourceSection } = sourceResult;

    // Check if dropping on a section directly
    const targetSection = sections.find((s) => s.id === overId);

    if (targetSection) {
      // Moving to a different section (drop on section header or empty area)
      if (targetSection.id !== sourceSection.id) {
        setSections((prev) =>
          prev.map((s) => {
            if (s.id === sourceSection.id) {
              return { ...s, items: s.items.filter((i) => i.id !== activeId) };
            }
            if (s.id === targetSection.id) {
              return { ...s, items: [...s.items, activeItemData] };
            }
            return s;
          })
        );
        toast({
          title: "Ligne déplacée",
          description: `Vers "${targetSection.title}"`,
        });
      }
      return;
    }

    // Dropping on another item
    const targetResult = findItemAndSection(overId);
    if (!targetResult) return;

    const { section: targetSectionFromItem } = targetResult;

    if (sourceSection.id === targetSectionFromItem.id) {
      // Same section - reorder
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== sourceSection.id) return s;
          const oldIndex = s.items.findIndex((i) => i.id === activeId);
          const newIndex = s.items.findIndex((i) => i.id === overId);
          return { ...s, items: arrayMove(s.items, oldIndex, newIndex) };
        })
      );
    } else {
      // Different section - move item
      const targetIndex = targetSectionFromItem.items.findIndex((i) => i.id === overId);
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === sourceSection.id) {
            return { ...s, items: s.items.filter((i) => i.id !== activeId) };
          }
          if (s.id === targetSectionFromItem.id) {
            const newItems = [...s.items];
            newItems.splice(targetIndex, 0, activeItemData);
            return { ...s, items: newItems };
          }
          return s;
        })
      );
      toast({
        title: "Ligne déplacée",
        description: `Vers "${targetSectionFromItem.title}"`,
      });
    }
  };

  // Calculate totals
  const allItems = sections.flatMap((s) => s.items);
  const subtotal = allItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxRate = localQuote.tax_rate || 20;
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // Update quote field
  const updateQuote = (field: keyof Quote, value: any) => {
    setLocalQuote({ ...localQuote, [field]: value });
  };

  // Section handlers
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${Date.now()}`,
        title: "Nouvelle section",
        items: [],
        collapsed: false,
      },
    ]);
  };

  const updateSection = (sectionId: string, section: Section) => {
    setSections(sections.map((s) => (s.id === sectionId ? section : s)));
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length === 1) {
      toast({
        title: "Impossible",
        description: "Vous devez garder au moins une section",
        variant: "destructive",
      });
      return;
    }
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const addItemToSection = (sectionId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: [
            ...s.items,
            {
              id: `item-${Date.now()}`,
              quote_id: quote.id,
              description: "",
              quantity: 1,
              unit: "unité",
              unit_price: 0,
              total: 0,
              order_index: s.items.length,
              created_at: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const updateItemInSection = (
    sectionId: string,
    itemId: string,
    field: keyof QuoteItem,
    value: any
  ) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: s.items.map((item) =>
            item.id === itemId ? { ...item, [field]: value } : item
          ),
        };
      })
    );
  };

  const deleteItemFromSection = (sectionId: string, itemId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          items: s.items.filter((item) => item.id !== itemId),
        };
      })
    );
  };

  // Save handler
  const handleSave = async () => {
    const updatedQuote = {
      ...localQuote,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
    };
    await onSave(updatedQuote, allItems);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
          <AIAssistantDialog
            quote={localQuote}
            items={allItems}
            onApplySuggestion={() => {}}
          />
          <Separator orientation="vertical" className="h-8" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showMaterials ? "default" : "outline"}
                size="sm"
                onClick={() => setShowMaterials(!showMaterials)}
              >
                <Package className="h-4 w-4 mr-2" />
                Matériaux
              </Button>
            </TooltipTrigger>
            <TooltipContent>Afficher la liste des matériaux</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showLabor ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLabor(!showLabor)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Main d'œuvre
              </Button>
            </TooltipTrigger>
            <TooltipContent>Afficher l'estimation main d'œuvre</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showSignature ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSignature(!showSignature)}
              >
                <Pen className="h-4 w-4 mr-2" />
                Signature
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ajouter une signature</TooltipContent>
          </Tooltip>
          <div className="flex-1" />
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Sauvegarder
          </Button>
        </div>

        {/* Client Info - Inline */}
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-start gap-8">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground">CLIENT</Label>
              <div className="space-y-1">
                <InlineEdit
                  value={localQuote.client_name}
                  onChange={(value) => updateQuote("client_name", value)}
                  placeholder="Nom du client"
                  className="text-lg font-semibold block"
                />
                <InlineEdit
                  value={localQuote.client_address || ""}
                  onChange={(value) => updateQuote("client_address", value)}
                  placeholder="Adresse"
                  className="text-sm text-muted-foreground block"
                />
                <InlineEdit
                  value={localQuote.client_email || ""}
                  onChange={(value) => updateQuote("client_email", value)}
                  placeholder="email@exemple.com"
                  className="text-sm text-muted-foreground block"
                />
                <InlineEdit
                  value={localQuote.client_phone || ""}
                  onChange={(value) => updateQuote("client_phone", value)}
                  placeholder="Téléphone"
                  className="text-sm text-muted-foreground block"
                />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Label className="text-xs text-muted-foreground">DEVIS</Label>
              <div className="text-lg font-bold text-primary">
                {localQuote.quote_number}
              </div>
              <div className="text-sm text-muted-foreground">
                <Select
                  value={localQuote.sector}
                  onValueChange={(value) => updateQuote("sector", value)}
                >
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SECTORS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Sections with Drag and Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {sections.map((section) => (
              <DroppableSection
                key={section.id}
                section={section}
                onUpdate={(s) => updateSection(section.id, s)}
                onDelete={() => deleteSection(section.id)}
                onAddItem={() => addItemToSection(section.id)}
                onUpdateItem={(itemId, field, value) =>
                  updateItemInSection(section.id, itemId, field, value)
                }
                onDeleteItem={(itemId) => deleteItemFromSection(section.id, itemId)}
                isOver={overSectionId === section.id}
                sectorUnits={sectorUnits}
              />
            ))}
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={addSection}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une section
            </Button>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem ? <DragOverlayItem item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Materials */}
        {showMaterials && (
          <div className="p-4 border rounded-lg bg-card">
            <MaterialsList materials={materials} onUpdate={setMaterials} />
          </div>
        )}

        {/* Labor Estimates */}
        {showLabor && (
          <div className="p-4 border rounded-lg bg-card">
            <LaborEstimates estimates={laborEstimates} onUpdate={setLaborEstimates} />
          </div>
        )}

        {/* Signature */}
        {showSignature && (
          <div className="p-4 border rounded-lg bg-card">
            <SignaturePad onSave={setSignature} />
            {signature && (
              <div className="mt-4">
                <img src={signature} alt="Signature" className="border rounded" />
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="p-4 border rounded-lg bg-card">
          <Label className="text-xs text-muted-foreground">NOTES & CONDITIONS</Label>
          <AutoResizeTextarea
            value={localQuote.notes || ""}
            onChange={(value) => updateQuote("notes", value)}
            placeholder="Conditions particulières, délais, modalités de paiement..."
            className="mt-2"
            minRows={2}
          />
        </div>

        {/* Totals */}
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-4 mb-4">
            <Label className="text-xs text-muted-foreground">TVA</Label>
            <Select
              value={taxRate.toString()}
              onValueChange={(value) => updateQuote("tax_rate", parseFloat(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_RATES.map((rate) => (
                  <SelectItem key={rate.value} value={rate.value.toString()}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total HT</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA ({taxRate}%)</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl">
              <span className="font-bold">Total TTC</span>
              <span className="font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
