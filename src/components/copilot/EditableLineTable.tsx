"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TAX_RATES, UNITS, getSectorConfig, type SectorType } from "@/types/database";
import {
  Plus,
  Trash2,
  GripVertical,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number; // 0 | 6 | 12 | 21
}

export interface LineGroup {
  id: string;
  title: string;
  collapsed: boolean;
  items: LineItem[];
}

interface EditableLineTableProps {
  groups: LineGroup[];
  onChange: (groups: LineGroup[]) => void;
  sector: SectorType;
  formatCurrency: (amount: number) => string;
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function newLineItem(sector: SectorType, defaultVat: number = 21): LineItem {
  const config = getSectorConfig(sector);
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: "",
    quantity: 1,
    unit: config.units[0] || "unité",
    unitPrice: 0,
    vatRate: defaultVat,
  };
}

function lineTotal(item: LineItem) {
  return item.quantity * item.unitPrice;
}

const VAT_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-600",
  6: "bg-emerald-100 text-emerald-700",
  12: "bg-amber-100 text-amber-700",
  21: "bg-blue-100 text-blue-700",
};

// ---------------------------------------------------------------------------
// SortableRow
// ---------------------------------------------------------------------------
function SortableRow({
  item,
  sectorUnits,
  formatCurrency,
  onUpdate,
  onDelete,
  onDuplicate,
  readOnly,
}: {
  item: LineItem;
  sectorUnits: string[];
  formatCurrency: (n: number) => string;
  onUpdate: (field: keyof LineItem, value: string | number) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  readOnly?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group grid grid-cols-[24px_1fr_80px_90px_100px_80px_100px_64px] gap-2 items-center px-3 py-2 rounded-lg transition-colors
        ${isDragging ? "ring-2 ring-deal-coral shadow-lg bg-card" : "hover:bg-muted/40"}`}
    >
      {/* Grip */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none flex justify-center">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Description */}
      <Input
        value={item.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        placeholder="Description de la prestation…"
        className="h-8 text-sm border-0 bg-transparent shadow-none focus-visible:ring-1"
        readOnly={readOnly}
      />

      {/* Quantity */}
      <Input
        type="number"
        min={0}
        step={0.5}
        value={item.quantity}
        onChange={(e) => onUpdate("quantity", parseFloat(e.target.value) || 0)}
        className="h-8 text-sm text-center border-0 bg-transparent shadow-none focus-visible:ring-1"
        readOnly={readOnly}
      />

      {/* Unit */}
      <Select
        value={item.unit}
        onValueChange={(v) => onUpdate("unit", v)}
        disabled={readOnly}
      >
        <SelectTrigger className="h-8 text-xs border-0 bg-transparent shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sectorUnits.map((u) => (
            <SelectItem key={u} value={u}>{u}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Unit price */}
      <Input
        type="number"
        min={0}
        step={0.01}
        value={item.unitPrice}
        onChange={(e) => onUpdate("unitPrice", parseFloat(e.target.value) || 0)}
        className="h-8 text-sm text-right border-0 bg-transparent shadow-none focus-visible:ring-1"
        readOnly={readOnly}
      />

      {/* VAT selector */}
      <Select
        value={item.vatRate.toString()}
        onValueChange={(v) => onUpdate("vatRate", parseInt(v))}
        disabled={readOnly}
      >
        <SelectTrigger className="h-8 text-xs border-0 bg-transparent shadow-none">
          <Badge variant="secondary" className={`text-2xs px-1.5 py-0 ${VAT_COLORS[item.vatRate] || ""}`}>
            {item.vatRate}%
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {TAX_RATES.map((r) => (
            <SelectItem key={r.value} value={r.value.toString()}>
              <Badge variant="secondary" className={`text-2xs ${VAT_COLORS[r.value] || ""}`}>
                {r.label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Line total */}
      <span className="text-sm font-semibold text-right tabular-nums">
        {formatCurrency(lineTotal(item))}
      </span>

      {/* Actions */}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!readOnly && (
          <>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate}>
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DragOverlayRow
// ---------------------------------------------------------------------------
function DragOverlayRow({ item, formatCurrency }: { item: LineItem; formatCurrency: (n: number) => string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg shadow-xl border-2 border-deal-coral">
      <GripVertical className="h-4 w-4 text-deal-coral" />
      <span className="text-sm flex-1 truncate">{item.description || "Sans description"}</span>
      <span className="font-semibold text-sm">{formatCurrency(lineTotal(item))}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GroupHeader
// ---------------------------------------------------------------------------
function GroupHeader({
  group,
  groupTotal,
  formatCurrency,
  onToggle,
  onRename,
  onDelete,
  readOnly,
}: {
  group: LineGroup;
  groupTotal: number;
  formatCurrency: (n: number) => string;
  onToggle: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-t-lg cursor-pointer hover:bg-muted/70 transition-colors"
      onClick={onToggle}
    >
      {group.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}

      {editing && !readOnly ? (
        <input
          ref={inputRef}
          defaultValue={group.title}
          className="text-sm font-semibold bg-transparent border-b-2 border-deal-coral outline-none flex-1"
          onBlur={(e) => { onRename(e.target.value); setEditing(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { onRename((e.target as HTMLInputElement).value); setEditing(false); } }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="text-sm font-semibold flex-1"
          onDoubleClick={(e) => { e.stopPropagation(); if (!readOnly) setEditing(true); }}
        >
          {group.title}
        </span>
      )}

      <Badge variant="secondary" className="text-2xs">{group.items.length} lignes</Badge>
      <span className="text-sm font-semibold text-deal-coral tabular-nums">{formatCurrency(groupTotal)}</span>

      {!readOnly && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column header row
// ---------------------------------------------------------------------------
function ColumnHeaders() {
  return (
    <div className="grid grid-cols-[24px_1fr_80px_90px_100px_80px_100px_64px] gap-2 px-3 py-1.5 text-2xs font-medium text-muted-foreground uppercase tracking-wider border-b">
      <span />
      <span>Description</span>
      <span className="text-center">Qté</span>
      <span className="text-center">Unité</span>
      <span className="text-right">P.U. HT</span>
      <span className="text-center">TVA</span>
      <span className="text-right">Total HT</span>
      <span />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Totals summary with per-VAT breakdown
// ---------------------------------------------------------------------------
export function TotalsSummary({
  groups,
  formatCurrency,
}: {
  groups: LineGroup[];
  formatCurrency: (n: number) => string;
}) {
  const allItems = groups.flatMap((g) => g.items);

  // Group by VAT rate
  const vatBuckets = allItems.reduce<Record<number, number>>((acc, item) => {
    const ht = lineTotal(item);
    acc[item.vatRate] = (acc[item.vatRate] || 0) + ht;
    return acc;
  }, {});

  const subtotalHT = Object.values(vatBuckets).reduce((s, v) => s + v, 0);
  const totalVAT = Object.entries(vatBuckets).reduce(
    (s, [rate, base]) => s + base * (parseInt(rate) / 100),
    0
  );
  const totalTTC = subtotalHT + totalVAT;

  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Sous-total HT</span>
        <span className="font-medium tabular-nums">{formatCurrency(subtotalHT)}</span>
      </div>

      {Object.entries(vatBuckets)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([rate, base]) => {
          const r = parseInt(rate);
          if (r === 0) return null;
          return (
            <div key={rate} className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                TVA {rate}%
                <Badge variant="secondary" className={`text-2xs px-1 py-0 ${VAT_COLORS[r] || ""}`}>
                  base {formatCurrency(base)}
                </Badge>
              </span>
              <span className="tabular-nums">{formatCurrency(base * (r / 100))}</span>
            </div>
          );
        })}

      <div className="flex justify-between pt-2 border-t-2 border-deal-coral text-base font-bold">
        <span>Total TTC</span>
        <span className="text-deal-coral tabular-nums">{formatCurrency(totalTTC)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function EditableLineTable({
  groups,
  onChange,
  sector,
  formatCurrency,
  readOnly = false,
}: EditableLineTableProps) {
  const sectorConfig = getSectorConfig(sector);
  const sectorUnits = Array.from(new Set([...sectorConfig.units, ...UNITS.slice(0, 10)]));
  const defaultVat = sectorConfig.taxRate;

  const [activeItem, setActiveItem] = useState<LineItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Mutations -----------------------------------------------------------
  const updateGroups = useCallback(
    (fn: (draft: LineGroup[]) => LineGroup[]) => onChange(fn([...groups.map((g) => ({ ...g, items: [...g.items] }))])),
    [groups, onChange]
  );

  const addGroup = () => {
    updateGroups((draft) => [
      ...draft,
      { id: `grp-${Date.now()}`, title: "Nouvelle section", collapsed: false, items: [newLineItem(sector, defaultVat)] },
    ]);
  };

  const deleteGroup = (gid: string) => {
    if (groups.length <= 1) return;
    updateGroups((draft) => draft.filter((g) => g.id !== gid));
  };

  const toggleGroup = (gid: string) => {
    updateGroups((draft) => draft.map((g) => (g.id === gid ? { ...g, collapsed: !g.collapsed } : g)));
  };

  const renameGroup = (gid: string, title: string) => {
    updateGroups((draft) => draft.map((g) => (g.id === gid ? { ...g, title } : g)));
  };

  const addItem = (gid: string) => {
    updateGroups((draft) =>
      draft.map((g) => (g.id === gid ? { ...g, items: [...g.items, newLineItem(sector, defaultVat)] } : g))
    );
  };

  const updateItem = (gid: string, itemId: string, field: keyof LineItem, value: string | number) => {
    updateGroups((draft) =>
      draft.map((g) =>
        g.id === gid
          ? { ...g, items: g.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)) }
          : g
      )
    );
  };

  const deleteItem = (gid: string, itemId: string) => {
    updateGroups((draft) =>
      draft.map((g) => (g.id === gid ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g))
    );
  };

  const duplicateItem = (gid: string, itemId: string) => {
    updateGroups((draft) =>
      draft.map((g) => {
        if (g.id !== gid) return g;
        const idx = g.items.findIndex((i) => i.id === itemId);
        if (idx === -1) return g;
        const clone = { ...g.items[idx], id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
        const newItems = [...g.items];
        newItems.splice(idx + 1, 0, clone);
        return { ...g, items: newItems };
      })
    );
  };

  // --- DnD ----------------------------------------------------------------
  const handleDragStart = (e: DragStartEvent) => {
    for (const g of groups) {
      const found = g.items.find((i) => i.id === e.active.id);
      if (found) { setActiveItem(found); break; }
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    updateGroups((draft) => {
      for (const g of draft) {
        const oldIdx = g.items.findIndex((i) => i.id === active.id);
        const newIdx = g.items.findIndex((i) => i.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
          g.items = arrayMove(g.items, oldIdx, newIdx);
          break;
        }
      }
      return draft;
    });
  };

  // --- Render --------------------------------------------------------------
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {groups.map((group) => {
          const groupTotal = group.items.reduce((s, i) => s + lineTotal(i), 0);
          return (
            <div key={group.id} className="border rounded-lg overflow-hidden bg-card">
              <GroupHeader
                group={group}
                groupTotal={groupTotal}
                formatCurrency={formatCurrency}
                onToggle={() => toggleGroup(group.id)}
                onRename={(t) => renameGroup(group.id, t)}
                onDelete={() => deleteGroup(group.id)}
                readOnly={readOnly}
              />

              {!group.collapsed && (
                <div className="px-1 pb-2">
                  <ColumnHeaders />
                  <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {group.items.map((item) => (
                      <SortableRow
                        key={item.id}
                        item={item}
                        sectorUnits={sectorUnits}
                        formatCurrency={formatCurrency}
                        onUpdate={(f, v) => updateItem(group.id, item.id, f, v)}
                        onDelete={() => deleteItem(group.id, item.id)}
                        onDuplicate={() => duplicateItem(group.id, item.id)}
                        readOnly={readOnly}
                      />
                    ))}
                  </SortableContext>

                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addItem(group.id)}
                      className="w-full mt-1 border border-dashed text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Ajouter une ligne
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!readOnly && (
          <Button variant="outline" className="w-full border-dashed" onClick={addGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </Button>
        )}
      </div>

      <DragOverlay>
        {activeItem ? <DragOverlayRow item={activeItem} formatCurrency={formatCurrency} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
