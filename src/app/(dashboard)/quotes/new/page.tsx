"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { useLocaleContext } from "@/contexts/locale-context";
import { SECTORS, PLAN_FEATURES, getSectorConfig, type SectorType } from "@/types/database";
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Zap,
  Mic,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { DealIconD, DealLoadingSpinner } from "@/components/brand";
import { staggerContainer, staggerItem } from "@/components/animations/page-transition";
import { CreationModeSelector, type CreationMode } from "@/components/quotes/creation-mode-selector";
import { TutorialOverlay } from "@/components/onboarding/tutorial-overlay";

// Copilot components – design 2028
import {
  SplitScreenEditor,
  BottomBar,
  type LineGroup,
  type ClientInfo,
} from "@/components/copilot";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GeneratedQuote {
  sector: SectorType;
  client: {
    name: string;
    email?: string;
    address?: string;
    phone?: string;
    city?: string;
    postalCode?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildGroupsFromGenerated(items: GeneratedQuote["items"], sector: SectorType): LineGroup[] {
  const config = getSectorConfig(sector);
  return [
    {
      id: "main",
      title: config.defaultSections[0] || "Prestations",
      collapsed: false,
      items: items.map((item, idx) => ({
        id: `gen-${idx}-${Date.now()}`,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        vatRate: config.taxRate,
      })),
    },
  ];
}

function defaultGroups(sector: SectorType): LineGroup[] {
  const config = getSectorConfig(sector);
  return [
    {
      id: "main",
      title: config.defaultSections[0] || "Prestations",
      collapsed: false,
      items: [
        {
          id: `line-init-${Date.now()}`,
          description: "",
          quantity: 1,
          unit: config.units[0] || "unité",
          unitPrice: 0,
          vatRate: config.taxRate,
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function NewQuotePage() {
  console.log("[DEAL] NewQuotePage loaded — design 2028 copilot");
  // Phase: "mode" → "transcription" → "editor"
  const [phase, setPhase] = useState<"mode" | "transcription" | "editor">("mode");
  const [selectedMode, setSelectedMode] = useState<CreationMode | null>(null);

  // Client info
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Quote data
  const [sector, setSector] = useState<SectorType>("AUTRE");
  const [groups, setGroups] = useState<LineGroup[]>(defaultGroups("AUTRE"));
  const [notes, setNotes] = useState("");
  const [transcription, setTranscription] = useState("");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [dirty, setDirty] = useState(false);

  // Loading
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<{
    company_name?: string;
    address?: string;
    siret?: string;
    iban?: string | null;
    bic?: string | null;
  } | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const { locale, localePack, formatCurrency } = useLocaleContext();

  const {
    plan,
    userSectors,
    usage,
    loading: subLoading,
    canCreateQuote,
    getRemainingQuotes,
    refresh: refreshSubscription,
  } = useSubscription();

  const planInfo = PLAN_FEATURES[plan];
  const canCreate = canCreateQuote();
  const usedQuotes = usage?.quotes_created ?? 0;
  const maxQuotes = planInfo.maxQuotes;

  const availableSectors = useMemo(
    () =>
      plan === "business" || plan === "corporate"
        ? (Object.keys(SECTORS) as SectorType[])
        : userSectors.map((s) => s.sector),
    [plan, userSectors]
  );

  // Fetch profile on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        if (data.default_sector) {
          setSector(data.default_sector);
          setGroups(defaultGroups(data.default_sector));
        }
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark dirty on changes
  const handleGroupsChange = useCallback((g: LineGroup[]) => {
    setGroups(g);
    setDirty(true);
  }, []);

  const handleClientChange = useCallback((info: ClientInfo) => {
    setClientInfo(info);
    setDirty(true);
  }, []);

  const handleNotesChange = useCallback((n: string) => {
    setNotes(n);
    setDirty(true);
  }, []);

  const handleSectorChange = useCallback((s: SectorType) => {
    setSector(s);
    // Update default VAT rate on existing items if they still use the old sector rate
    const oldConfig = getSectorConfig(sector);
    const newConfig = getSectorConfig(s);
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((item) =>
          item.vatRate === oldConfig.taxRate ? { ...item, vatRate: newConfig.taxRate } : item
        ),
      }))
    );
    setDirty(true);
  }, [sector]);

  // ---------------------------------------------------------------------------
  // AI generation (vocal mode)
  // ---------------------------------------------------------------------------
  const handleGenerate = async () => {
    if (!transcription.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription,
          sector: sector === "AUTRE" ? undefined : sector,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la génération");
      }

      const generated: GeneratedQuote = await response.json();

      // Populate client
      if (generated.client) {
        setClientInfo({
          name: generated.client.name || clientInfo.name,
          email: generated.client.email || clientInfo.email,
          phone: generated.client.phone || clientInfo.phone,
          address: generated.client.address || clientInfo.address,
          city: generated.client.city || clientInfo.city,
          postalCode: generated.client.postalCode || clientInfo.postalCode,
        });
      }

      // Populate sector & lines
      if (generated.sector) setSector(generated.sector);
      const resolvedSector = generated.sector || sector;
      setGroups(buildGroupsFromGenerated(generated.items, resolvedSector));
      if (generated.notes) setNotes(generated.notes);

      setDirty(true);
      setPhase("editor");

      toast({ title: "Analyse terminée", description: "Les informations ont été extraites avec succès" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Save to database
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!canCreate) {
      toast({ title: "Limite atteinte", description: "Vous avez atteint votre limite de devis ce mois.", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const allItems = groups.flatMap((g) => g.items).filter((i) => i.description.trim().length > 0);

      // Compute totals per-VAT
      const subtotal = allItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      // Use weighted average tax rate for the quote record
      const totalVAT = allItems.reduce((s, i) => s + i.quantity * i.unitPrice * (i.vatRate / 100), 0);
      const total = subtotal + totalVAT;
      const avgTaxRate = subtotal > 0 ? (totalVAT / subtotal) * 100 : localePack.tax.standard;

      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          client_name: clientInfo.name || "Client",
          client_email: clientInfo.email || null,
          client_address: clientInfo.address || null,
          client_phone: clientInfo.phone || null,
          client_city: clientInfo.city || null,
          client_postal_code: clientInfo.postalCode || null,
          sector,
          transcription: selectedMode === "vocal" ? transcription : null,
          notes: notes || null,
          subtotal,
          tax_rate: Math.round(avgTaxRate * 100) / 100,
          tax_amount: totalVAT,
          total,
          locale,
        })
        .select()
        .single();

      if (quoteError) throw new Error(`Erreur base de données: ${quoteError.message}`);

      if (allItems.length > 0) {
        const { error: itemsError } = await supabase.from("quote_items").insert(
          allItems.map((item, index) => ({
            quote_id: quote.id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unitPrice,
            order_index: index,
          }))
        );
        if (itemsError) throw itemsError;
      }

      refreshSubscription();
      setDirty(false);
      toast({ title: "Devis créé", description: "Votre devis a été créé avec succès" });
      router.push(`/quotes/${quote.id}`);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render: Loading
  // ---------------------------------------------------------------------------
  if (subLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DealLoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Mode selection
  // ---------------------------------------------------------------------------
  if (phase === "mode") {
    return (
      <>
        <TutorialOverlay />
        <motion.div className="max-w-4xl mx-auto" initial="initial" animate="animate" variants={staggerContainer}>
          {/* Quota warning */}
          {!canCreate && (
            <motion.div variants={staggerItem} className="mb-6">
              <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-300">Limite atteinte</p>
                        <p className="text-sm text-red-600 dark:text-red-400">{usedQuotes}/{maxQuotes} devis utilisés ce mois</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-deal-coral hover:bg-deal-coral/90" asChild>
                      <Link href="/pricing">Upgrader <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Mode selector */}
          <motion.div variants={staggerItem}>
            <Card className="border-deal-coral/10 shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-deal-coral to-deal-navy" />
              <CardContent className="p-6 md:p-8">
                <CreationModeSelector
                  selectedMode={selectedMode}
                  onSelectMode={(mode) => {
                    setSelectedMode(mode);
                    if (mode === "vocal") {
                      setTimeout(() => setPhase("transcription"), 300);
                    } else if (mode === "manual") {
                      setTimeout(() => setPhase("editor"), 300);
                    }
                  }}
                  disabled={!canCreate}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips */}
          <motion.div variants={staggerItem} className="mt-6">
            <Card className="border-deal-coral/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-deal-navy dark:text-white">
                  <DealIconD size="xs" variant="primary" />
                  Conseils DEAL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-deal-coral font-bold">1</span>
                    La dictée vocale est idéale après un appel client
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-deal-coral font-bold">2</span>
                    Chaque ligne peut avoir sa propre TVA (6%, 12%, 21%)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-deal-coral font-bold">3</span>
                    L'aperçu PDF se met à jour en temps réel
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Transcription (vocal mode)
  // ---------------------------------------------------------------------------
  if (phase === "transcription") {
    return (
      <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-deal-coral/10 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-deal-coral to-deal-navy" />
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="text-center">
              <Mic className="h-10 w-10 text-deal-coral mx-auto mb-3" />
              <h2 className="text-xl font-semibold mb-1">Transcription vocale</h2>
              <p className="text-muted-foreground text-sm">
                Collez votre transcription et laissez l'IA analyser le contenu
              </p>
            </div>

            <Textarea
              placeholder="Collez votre transcription ici…

Exemple:
'Bonjour, je suis M. Dupont, j'aurais besoin de faire installer une nouvelle chaudière gaz.
L'ancienne a 15 ans et consomme beaucoup. Je voudrais aussi faire vérifier les radiateurs.'"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="min-h-[200px] resize-y"
            />

            <div className="flex items-center gap-3">
              <Select
                value={sector}
                onValueChange={(v) => setSector(v as SectorType)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Secteur (auto)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTRE">Détection auto</SelectItem>
                  {availableSectors.map((s) => (
                    <SelectItem key={s} value={s}>{SECTORS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1" />

              <Button variant="outline" onClick={() => setPhase("mode")}>
                Retour
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={loading || !transcription.trim()}
                className="gap-2 bg-deal-coral hover:bg-deal-coral/90 text-white min-w-[180px]"
              >
                {loading ? (
                  <>
                    <DealLoadingSpinner size="sm" />
                    Analyse en cours…
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Analyser avec l'IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: Split-screen editor (main phase)
  // ---------------------------------------------------------------------------
  return (
    <>
      <TutorialOverlay />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
        {/* Top bar with back + title */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setPhase("mode")}>
            ← Mode
          </Button>
          <Sparkles className="h-4 w-4 text-deal-coral" />
          <h1 className="text-lg font-semibold">Nouveau devis</h1>
          {selectedMode && (
            <Badge variant="secondary" className="text-2xs">
              {selectedMode === "vocal" ? "IA" : "Manuel"}
            </Badge>
          )}
        </div>

        {/* Split-screen editor */}
        <SplitScreenEditor
          clientInfo={clientInfo}
          onClientInfoChange={handleClientChange}
          sector={sector}
          onSectorChange={handleSectorChange}
          groups={groups}
          onGroupsChange={handleGroupsChange}
          notes={notes}
          onNotesChange={handleNotesChange}
          formatCurrency={formatCurrency}
          availableSectors={availableSectors}
          companyName={profile?.company_name}
          companyAddress={profile?.address}
          companyVat={profile?.siret}
          iban={profile?.iban}
          bic={profile?.bic}
        />

        {/* Persistent bottom bar */}
        <BottomBar
          groups={groups}
          formatCurrency={formatCurrency}
          onSave={handleSave}
          onPreviewToggle={() => setPreviewOpen((p) => !p)}
          onExportPDF={() => toast({ title: "PDF", description: "Sauvegardez d'abord pour exporter en PDF" })}
          saving={saving}
          previewOpen={previewOpen}
          dirty={dirty}
        />
      </motion.div>
    </>
  );
}
