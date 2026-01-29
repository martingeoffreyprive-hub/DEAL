"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { SECTORS, PLAN_FEATURES, type SectorType } from "@/types/database";
import { Sparkles, FileText, AlertTriangle, Lock, ArrowRight, Mic, Plus, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import { DealIconD, DealLoadingSpinner } from "@/components/brand";
import { staggerContainer, staggerItem, cardHover } from "@/components/animations/page-transition";
import { QuoteWizard, type WizardStep } from "@/components/quotes/quote-wizard";
import { CreationModeSelector, type CreationMode } from "@/components/quotes/creation-mode-selector";
import { TutorialOverlay } from "@/components/onboarding/tutorial-overlay";

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

interface QuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

export default function NewQuotePage() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("mode");
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

  // Quote details
  const [transcription, setTranscription] = useState("");
  const [sector, setSector] = useState<SectorType | "auto">("auto");
  const [notes, setNotes] = useState("");

  // Items (for manual mode)
  const [items, setItems] = useState<QuoteItem[]>([
    { description: "", quantity: 1, unit: "u", unitPrice: 0 }
  ]);

  // Loading & generation
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedQuote | null>(null);

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
    canUseSector,
    getRemainingQuotes,
    refresh: refreshSubscription,
  } = useSubscription();

  const planInfo = PLAN_FEATURES[plan];
  const remainingQuotes = getRemainingQuotes();
  const canCreate = canCreateQuote();
  const usedQuotes = usage?.quotes_created ?? 0;
  const maxQuotes = planInfo.maxQuotes;

  // Secteurs disponibles pour l'utilisateur
  const availableSectors = plan === "business"
    ? (Object.keys(SECTORS) as SectorType[])
    : userSectors.map(s => s.sector);

  // Check if can proceed to next step
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case "mode":
        return selectedMode !== null;
      case "client":
        return clientInfo.name.trim().length > 0;
      case "details":
        if (selectedMode === "vocal") {
          return transcription.trim().length > 0;
        }
        return sector !== "auto" || selectedMode === "manual";
      case "items":
        if (selectedMode === "vocal" && generatedData) {
          return generatedData.items.length > 0;
        }
        return items.some(item => item.description.trim().length > 0 && item.unitPrice > 0);
      case "review":
        return true;
      default:
        return false;
    }
  }, [currentStep, selectedMode, clientInfo, transcription, sector, items, generatedData]);

  // Handle AI generation for vocal mode
  const handleGenerate = async () => {
    if (!transcription.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller une transcription",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription,
          sector: sector === "auto" ? undefined : sector,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la génération");
      }

      const generated: GeneratedQuote = await response.json();

      // Update client info from generated data
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

      // Update sector
      if (generated.sector) {
        setSector(generated.sector);
      }

      // Store generated data
      setGeneratedData(generated);

      // Move to items step
      setCurrentStep("items");

      toast({
        title: "Analyse terminée",
        description: "Les informations ont été extraites avec succès",
      });
    } catch (error) {
      console.error("Error generating quote:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle final quote creation
  const handleComplete = async () => {
    if (!canCreate) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint votre limite de devis ce mois.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Use generated items for vocal mode, or manual items
      const quoteItems = selectedMode === "vocal" && generatedData
        ? generatedData.items
        : items.filter(item => item.description.trim().length > 0);

      // Calculate totals
      const subtotal = quoteItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxRate = localePack.tax.standard;
      const taxAmount = subtotal * taxRate / 100;
      const total = subtotal + taxAmount;

      // Determine sector
      const finalSector = sector === "auto"
        ? (generatedData?.sector || availableSectors[0] || "plomberie")
        : sector;

      // Create quote in database
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
          sector: finalSector,
          transcription: selectedMode === "vocal" ? transcription : null,
          notes: notes || generatedData?.notes || null,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          locale,
        })
        .select()
        .single();

      if (quoteError) throw new Error(`Erreur base de données: ${quoteError.message}`);

      // Create quote items
      if (quoteItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(
            quoteItems.map((item, index) => ({
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

      toast({
        title: "Devis créé",
        description: "Votre devis a été créé avec succès",
      });

      router.push(`/quotes/${quote.id}`);
    } catch (error) {
      console.error("Error creating quote:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item for manual mode
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit: "u", unitPrice: 0 }]);
  };

  // Remove item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Update item
  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Calculate current total
  const currentTotal = useCallback(() => {
    const quoteItems = selectedMode === "vocal" && generatedData
      ? generatedData.items
      : items;
    return quoteItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [selectedMode, generatedData, items]);

  if (subLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DealLoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "mode":
        return (
          <CreationModeSelector
            selectedMode={selectedMode}
            onSelectMode={(mode) => {
              setSelectedMode(mode);
              // Auto-advance after selection
              setTimeout(() => setCurrentStep("client"), 300);
            }}
            disabled={!canCreate}
          />
        );

      case "client":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Informations client</h2>
              <p className="text-muted-foreground text-sm">
                Renseignez les coordonnées de votre client
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client-name">Nom / Entreprise *</Label>
                <Input
                  id="client-name"
                  placeholder="Ex: Jean Dupont ou SARL Dupont"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="client@example.com"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-phone">Téléphone</Label>
                <Input
                  id="client-phone"
                  placeholder="+33 6 12 34 56 78"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="client-address">Adresse</Label>
                <Input
                  id="client-address"
                  placeholder="15 rue des Lilas"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-city">Ville</Label>
                <Input
                  id="client-city"
                  placeholder="Paris"
                  value={clientInfo.city}
                  onChange={(e) => setClientInfo({ ...clientInfo, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-postal">Code postal</Label>
                <Input
                  id="client-postal"
                  placeholder="75001"
                  value={clientInfo.postalCode}
                  onChange={(e) => setClientInfo({ ...clientInfo, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {selectedMode === "vocal" ? "Transcription vocale" : "Détails du devis"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {selectedMode === "vocal"
                  ? "Collez votre transcription et laissez l'IA analyser"
                  : "Sélectionnez le secteur d'activité"
                }
              </p>
            </div>

            {selectedMode === "vocal" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transcription">Transcription</Label>
                  <Textarea
                    id="transcription"
                    placeholder="Collez votre transcription ici...

Exemple :
'Bonjour, je suis M. Dupont, j'aurais besoin de faire installer une nouvelle chaudière gaz.
L'ancienne a 15 ans et consomme beaucoup. Je voudrais aussi faire vérifier les radiateurs.'"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    className="min-h-[200px] resize-y"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {transcription.length} caractères
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur (optionnel)</Label>
                  <Select
                    value={sector}
                    onValueChange={(value) => setSector(value as SectorType | "auto")}
                  >
                    <SelectTrigger id="sector">
                      <SelectValue placeholder="Détection automatique" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Détection automatique</SelectItem>
                      {availableSectors.map((key) => (
                        <SelectItem key={key} value={key}>
                          {SECTORS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !transcription.trim()}
                  className="w-full gap-2 bg-[#E85A5A] hover:bg-[#D64545] text-white"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <DealLoadingSpinner size="sm" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Analyser avec l'IA
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sector-manual">Secteur d'activité</Label>
                  <Select
                    value={sector === "auto" ? "" : sector}
                    onValueChange={(value) => setSector(value as SectorType)}
                  >
                    <SelectTrigger id="sector-manual">
                      <SelectValue placeholder="Sélectionnez un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSectors.map((key) => (
                        <SelectItem key={key} value={key}>
                          {SECTORS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Observations</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ajoutez des notes pour ce devis..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "items":
        const displayItems = selectedMode === "vocal" && generatedData
          ? generatedData.items
          : items;

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Prestations</h2>
              <p className="text-muted-foreground text-sm">
                {selectedMode === "vocal"
                  ? "Vérifiez et ajustez les lignes générées"
                  : "Ajoutez les lignes de votre devis"
                }
              </p>
            </div>

            <div className="space-y-4">
              {displayItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 md:col-span-5 space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        placeholder="Description de la prestation"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        readOnly={selectedMode === "vocal"}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-1">
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                        readOnly={selectedMode === "vocal"}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-1">
                      <Label className="text-xs">Unité</Label>
                      <Input
                        placeholder="u"
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        readOnly={selectedMode === "vocal"}
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-1">
                      <Label className="text-xs">Prix unitaire</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        readOnly={selectedMode === "vocal"}
                      />
                    </div>
                    {selectedMode !== "vocal" && (
                      <div className="col-span-12 md:col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="text-right mt-2 text-sm text-muted-foreground">
                    Sous-total: {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </Card>
              ))}

              {selectedMode !== "vocal" && (
                <Button
                  variant="outline"
                  onClick={addItem}
                  className="w-full gap-2 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une ligne
                </Button>
              )}

              <Card className="p-4 bg-[#252B4A]/5 border-[#252B4A]/20">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total HT</span>
                  <span className="text-[#E85A5A]">{formatCurrency(currentTotal())}</span>
                </div>
              </Card>
            </div>
          </div>
        );

      case "review":
        const reviewItems = selectedMode === "vocal" && generatedData
          ? generatedData.items
          : items.filter(item => item.description.trim().length > 0);
        const subtotal = currentTotal();
        const taxRate = localePack.tax.standard;
        const taxAmount = subtotal * taxRate / 100;
        const total = subtotal + taxAmount;

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2">Récapitulatif</h2>
              <p className="text-muted-foreground text-sm">
                Vérifiez les informations avant de créer le devis
              </p>
            </div>

            {/* Client */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-[#252B4A] dark:text-white">Client</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nom:</span>
                  <span className="ml-2 font-medium">{clientInfo.name || "Non renseigné"}</span>
                </div>
                {clientInfo.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{clientInfo.email}</span>
                  </div>
                )}
                {clientInfo.phone && (
                  <div>
                    <span className="text-muted-foreground">Tél:</span>
                    <span className="ml-2">{clientInfo.phone}</span>
                  </div>
                )}
                {clientInfo.city && (
                  <div>
                    <span className="text-muted-foreground">Ville:</span>
                    <span className="ml-2">{clientInfo.postalCode} {clientInfo.city}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Items */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-[#252B4A] dark:text-white">
                Prestations ({reviewItems.length})
              </h3>
              <div className="space-y-2">
                {reviewItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{item.description}</span>
                      <span className="text-muted-foreground ml-2">
                        ({item.quantity} {item.unit})
                      </span>
                    </div>
                    <span>{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Totals */}
            <Card className="p-4 bg-[#252B4A] text-white">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total HT</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>TVA ({taxRate}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/20">
                  <span>Total TTC</span>
                  <span className="text-[#E85A5A]">{formatCurrency(total)}</span>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <TutorialOverlay />
    <motion.div
      className="max-w-4xl mx-auto"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Usage Warning */}
      {!canCreate && (
        <motion.div variants={staggerItem} className="mb-6">
          <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">
                      Limite atteinte
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {usedQuotes}/{maxQuotes} devis utilisés ce mois
                    </p>
                  </div>
                </div>
                <Button size="sm" className="bg-[#E85A5A] hover:bg-[#D64545]" asChild>
                  <Link href="/pricing">
                    Upgrader <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Wizard */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#E85A5A]/10 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#E85A5A] to-[#252B4A]" />
          <CardContent className="p-6 md:p-8">
            <QuoteWizard
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              canProceed={canProceed()}
              isLoading={loading}
              onComplete={handleComplete}
              hideStepIndicator={currentStep === "mode"}
            >
              {renderStepContent()}
            </QuoteWizard>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips - Only show on mode selection */}
      {currentStep === "mode" && (
        <motion.div variants={staggerItem} className="mt-6">
          <Card className="border-[#E85A5A]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-[#252B4A] dark:text-white">
                <DealIconD size="xs" variant="primary" />
                Conseils DEAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-[#E85A5A] font-bold">1</span>
                  La dictée vocale est idéale après un appel client
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E85A5A] font-bold">2</span>
                  Les templates accélèrent la création pour les travaux récurrents
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#E85A5A] font-bold">3</span>
                  Vous pouvez toujours modifier le devis après génération
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
    </>
  );
}
