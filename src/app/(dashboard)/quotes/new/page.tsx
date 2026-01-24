"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { SECTORS, PLAN_FEATURES, type SectorType } from "@/types/database";
import { Loader2, Sparkles, FileText, AlertTriangle, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

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

export default function NewQuotePage() {
  const [transcription, setTranscription] = useState("");
  const [sector, setSector] = useState<SectorType | "auto">("auto");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

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
  const availableSectors = plan === "ultimate"
    ? (Object.keys(SECTORS) as SectorType[])
    : userSectors.map(s => s.sector);

  const handleGenerate = async () => {
    if (!transcription.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez coller une transcription",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la limite de devis
    if (!canCreate) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez atteint votre limite de devis ce mois. Passez à un plan supérieur.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier l'accès au secteur si sélectionné
    if (sector !== "auto" && !canUseSector(sector)) {
      toast({
        title: "Secteur non disponible",
        description: "Vous n'avez pas accès à ce secteur. Ajoutez-le dans vos paramètres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call the API to generate the quote
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

      const generatedQuote: GeneratedQuote = await response.json();

      // Vérifier si le secteur généré est accessible
      if (!canUseSector(generatedQuote.sector) && plan !== "ultimate") {
        // Utiliser le premier secteur disponible de l'utilisateur
        if (availableSectors.length > 0) {
          generatedQuote.sector = availableSectors[0];
        }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Calculate totals
      const subtotal = generatedQuote.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxRate = 21; // TVA belge par défaut
      const taxAmount = subtotal * taxRate / 100;
      const total = subtotal + taxAmount;

      // Create quote in database
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          client_name: generatedQuote.client.name || "Client",
          client_email: generatedQuote.client.email,
          client_address: generatedQuote.client.address,
          client_phone: generatedQuote.client.phone,
          client_city: generatedQuote.client.city,
          client_postal_code: generatedQuote.client.postalCode,
          sector: generatedQuote.sector,
          transcription,
          notes: generatedQuote.notes,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
        })
        .select()
        .single();

      if (quoteError) {
        console.error("Supabase error details:", JSON.stringify(quoteError, null, 2));
        throw new Error(`Erreur base de données: ${quoteError.message}`);
      }

      // Create quote items
      if (generatedQuote.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(
            generatedQuote.items.map((item, index) => ({
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

      // Rafraîchir les stats d'utilisation
      refreshSubscription();

      toast({
        title: "Devis généré",
        description: "Votre devis a été créé avec succès",
      });

      // Redirect to quote editor
      router.push(`/quotes/${quote.id}`);
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

  if (subLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau devis</h1>
        <p className="text-muted-foreground">
          Collez votre transcription pour générer un devis automatiquement
        </p>
      </div>

      {/* Usage Stats */}
      <Card className={!canCreate ? "border-red-300 bg-red-50 dark:bg-red-950/20" : ""}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Devis ce mois : {usedQuotes} / {maxQuotes === -1 ? "∞" : maxQuotes}
            </span>
            <Badge variant={canCreate ? "secondary" : "destructive"}>
              {remainingQuotes === -1 ? "Illimité" : `${remainingQuotes} restant${remainingQuotes > 1 ? "s" : ""}`}
            </Badge>
          </div>
          {maxQuotes !== -1 && (
            <Progress
              value={(usedQuotes / maxQuotes) * 100}
              className={!canCreate ? "bg-red-200" : ""}
            />
          )}
          {!canCreate && (
            <div className="flex items-center justify-between mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  Limite atteinte pour ce mois
                </span>
              </div>
              <Button size="sm" asChild>
                <Link href="/pricing">
                  Upgrader <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcription Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcription
          </CardTitle>
          <CardDescription>
            Collez ici le texte de votre transcription vocale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Collez votre transcription ici...

Exemple :
'Bonjour, je suis M. Dupont, j'aurais besoin de faire installer une nouvelle chaudière gaz.
L'ancienne a 15 ans et consomme beaucoup. Je voudrais aussi faire vérifier les radiateurs.
Ma maison fait environ 120m². J'habite au 15 rue des Lilas à Bruxelles.'"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="min-h-[200px] resize-y"
              disabled={loading || !canCreate}
            />
            <p className="text-xs text-muted-foreground text-right">
              {transcription.length} caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Secteur d'activité</Label>
            <Select
              value={sector}
              onValueChange={(value) => setSector(value as SectorType | "auto")}
              disabled={loading || !canCreate}
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
                {plan !== "ultimate" && availableSectors.length < Object.keys(SECTORS).length && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">
                    <Lock className="inline h-3 w-3 mr-1" />
                    {Object.keys(SECTORS).length - availableSectors.length} secteurs verrouillés
                  </div>
                )}
              </SelectContent>
            </Select>
            {plan !== "ultimate" && (
              <p className="text-xs text-muted-foreground">
                <Link href="/settings/subscription" className="text-primary hover:underline">
                  Gérer mes secteurs
                </Link>
              </p>
            )}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !transcription.trim() || !canCreate}
            className="w-full gap-2"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Génération en cours...
              </>
            ) : !canCreate ? (
              <>
                <Lock className="h-5 w-5" />
                Limite atteinte
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Générer le devis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conseils pour de meilleurs résultats</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Incluez le nom et les coordonnées du client si mentionnés
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Décrivez les prestations demandées avec le plus de détails possible
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Mentionnez les quantités et dimensions si applicable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Les prix seront estimés et pourront être ajustés ensuite
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
