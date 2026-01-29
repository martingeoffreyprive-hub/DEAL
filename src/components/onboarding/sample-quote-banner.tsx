"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SECTOR_CONFIGS, type SectorType } from "@/types/database";

// Sample transcriptions per sector (subset of most common)
const SAMPLE_TRANSCRIPTIONS: Partial<Record<SectorType, string>> = {
  ELECTRICITE: "Bonjour, je voudrais refaire l'électricité de ma cuisine. Il faut installer 6 prises, 2 interrupteurs, un point lumineux plafonnier et tirer une ligne dédiée pour le four. La pièce fait environ 15m².",
  PLOMBERIE: "J'ai besoin de remplacer un chauffe-eau de 200L, installer un mitigeur dans la salle de bain et réparer une fuite au niveau du siphon sous l'évier de la cuisine.",
  CONSTRUCTION: "Nous souhaitons construire un mur de séparation en blocs de 14cm sur 8 mètres de long et 2,5m de haut, avec une porte. Il faut aussi couler une fondation.",
  RENOVATION: "Rénovation complète d'un studio de 35m² : démolition cloison existante, ragréage sol, pose de carrelage, peinture murs et plafond, remplacement porte d'entrée.",
  PEINTURE: "Peinture de 3 chambres (12m², 10m², 14m²) et du couloir (8m²). Murs et plafonds. Les murs sont en bon état, juste un lessivage et deux couches.",
  MENUISERIE: "Fabrication et pose d'un dressing sur mesure de 3m de large avec 2 portes coulissantes, étagères intérieures, 2 tiroirs et une tringle.",
  TOITURE: "Remplacement de 20m² de tuiles cassées sur le versant sud, vérification de la charpente, et remplacement de la gouttière en zinc sur 6m.",
  JARDINAGE: "Entretien annuel du jardin : taille de 3 haies (total 25m), tonte pelouse 200m², élagage d'un arbre de 6m, désherbage massifs.",
  NETTOYAGE: "Nettoyage de fin de chantier d'un appartement de 80m² : sols, vitres (8 fenêtres), sanitaires, cuisine, dépoussiérage général.",
  AUTRE: "Prestation de service pour un client : diagnostic initial, planification, exécution du travail et rapport final. Durée estimée : 2 jours.",
};

interface SampleQuoteBannerProps {
  userSector: SectorType;
  hasQuotes: boolean;
}

export function SampleQuoteBanner({ userSector, hasQuotes }: SampleQuoteBannerProps) {
  const [generating, setGenerating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Don't show if user already has quotes
  if (hasQuotes) return null;

  const sampleText = SAMPLE_TRANSCRIPTIONS[userSector] || SAMPLE_TRANSCRIPTIONS.AUTRE!;
  const sectorConfig = SECTOR_CONFIGS[userSector];

  const handleTrySample = async () => {
    setGenerating(true);
    try {
      // Navigate to new quote page with sample transcription pre-filled
      const params = new URLSearchParams({
        mode: "sample",
        sector: userSector,
        transcription: sampleText,
      });
      router.push(`/quotes/new?${params.toString()}`);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de lancer l'exemple",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-[#E85A5A]/30 bg-gradient-to-r from-[#E85A5A]/5 to-transparent">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-semibold text-base">
            Essayez avec un exemple {sectorConfig?.label ? `(${sectorConfig.label})` : ""}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Découvrez la puissance de l'IA DEAL avec un devis exemple pré-rempli pour votre secteur.
          </p>
        </div>
        <Button
          onClick={handleTrySample}
          disabled={generating}
          className="bg-[#E85A5A] hover:bg-[#D64545] text-white shrink-0"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Essayer avec un exemple
        </Button>
      </CardContent>
    </Card>
  );
}
