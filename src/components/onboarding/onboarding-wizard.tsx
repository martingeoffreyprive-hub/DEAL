"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  User,
  Palette,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Upload,
  Globe,
  CreditCard,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingData {
  // Step 1: Profile
  fullName: string;
  companyName: string;
  email: string;
  phone: string;

  // Step 2: Business
  sector: string;
  companySize: string;
  vatNumber: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;

  // Step 3: Branding
  logoUrl: string | null;
  primaryColor: string;
  legalMentions: string;

  // Step 4: Banking
  iban: string;
  bic: string;
  bankName: string;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

const STEPS = [
  { id: 1, title: "Profil", icon: User, description: "Vos informations personnelles" },
  { id: 2, title: "Entreprise", icon: Building2, description: "Détails de votre activité" },
  { id: 3, title: "Personnalisation", icon: Palette, description: "Image de marque" },
  { id: 4, title: "Paiement", icon: CreditCard, description: "Coordonnées bancaires" },
];

const SECTORS = [
  { value: "construction", label: "Construction & BTP" },
  { value: "renovation", label: "Rénovation" },
  { value: "plumbing", label: "Plomberie" },
  { value: "electrical", label: "Électricité" },
  { value: "painting", label: "Peinture" },
  { value: "landscaping", label: "Jardinage & Paysage" },
  { value: "cleaning", label: "Nettoyage" },
  { value: "consulting", label: "Conseil" },
  { value: "design", label: "Design & Créatif" },
  { value: "tech", label: "Technologie" },
  { value: "other", label: "Autre" },
];

const COMPANY_SIZES = [
  { value: "solo", label: "Auto-entrepreneur" },
  { value: "1-5", label: "1-5 employés" },
  { value: "6-20", label: "6-20 employés" },
  { value: "21-50", label: "21-50 employés" },
  { value: "50+", label: "Plus de 50 employés" },
];

const BRAND_COLORS = [
  "#252B4A", // Navy (DEAL primary)
  "#E85A5A", // Coral (DEAL accent)
  "#2563eb", // Blue
  "#059669", // Green
  "#7c3aed", // Purple
  "#ea580c", // Orange
  "#dc2626", // Red
  "#0891b2", // Teal
];

export function OnboardingWizard({ onComplete, initialData = {} }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    sector: "",
    companySize: "",
    vatNumber: "",
    address: "",
    postalCode: "",
    city: "",
    country: "BE",
    logoUrl: null,
    primaryColor: "#252B4A",
    legalMentions: "",
    iban: "",
    bic: "",
    bankName: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progress = (currentStep / STEPS.length) * 100;

  const updateData = (field: keyof OnboardingData, value: string | null) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.fullName.trim()) newErrors.fullName = "Nom requis";
      if (!data.companyName.trim()) newErrors.companyName = "Nom d'entreprise requis";
      if (!data.email.trim()) newErrors.email = "Email requis";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = "Email invalide";
      }
    }

    if (step === 2) {
      if (!data.sector) newErrors.sector = "Secteur requis";
      if (!data.companySize) newErrors.companySize = "Taille d'entreprise requise";
    }

    // Step 3 and 4 are optional

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep((prev) => prev + 1);
      } else {
        onComplete(data);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const skipStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(data);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#252B4A] to-[#1a1f35]">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E85A5A] to-[#d64545] flex items-center justify-center"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[#252B4A]">Bienvenue sur DEAL</h1>
            <p className="text-muted-foreground mt-2">
              Configurons votre espace en quelques étapes
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {STEPS.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isComplete = step.id < currentStep;
                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex flex-col items-center",
                      isActive || isComplete ? "text-[#252B4A]" : "text-muted-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isComplete
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-[#252B4A] text-white"
                          : "bg-muted"
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                  </div>
                );
              })}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold">Vos informations</h2>
                    <p className="text-sm text-muted-foreground">
                      Ces informations apparaîtront sur vos devis
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Nom complet *</Label>
                      <Input
                        value={data.fullName}
                        onChange={(e) => updateData("fullName", e.target.value)}
                        placeholder="Jean Dupont"
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && (
                        <span className="text-xs text-red-500">{errors.fullName}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Nom d'entreprise *</Label>
                      <Input
                        value={data.companyName}
                        onChange={(e) => updateData("companyName", e.target.value)}
                        placeholder="Dupont SPRL"
                        className={errors.companyName ? "border-red-500" : ""}
                      />
                      {errors.companyName && (
                        <span className="text-xs text-red-500">{errors.companyName}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Email professionnel *</Label>
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => updateData("email", e.target.value)}
                        placeholder="jean@dupont.be"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <span className="text-xs text-red-500">{errors.email}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Téléphone</Label>
                      <Input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => updateData("phone", e.target.value)}
                        placeholder="+32 470 123 456"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold">Votre activité</h2>
                    <p className="text-sm text-muted-foreground">
                      Dites-nous en plus sur votre entreprise
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Secteur d'activité *</Label>
                      <Select
                        value={data.sector}
                        onValueChange={(v) => updateData("sector", v)}
                      >
                        <SelectTrigger className={errors.sector ? "border-red-500" : ""}>
                          <SelectValue placeholder="Choisir un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTORS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.sector && (
                        <span className="text-xs text-red-500">{errors.sector}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Taille de l'entreprise *</Label>
                      <Select
                        value={data.companySize}
                        onValueChange={(v) => updateData("companySize", v)}
                      >
                        <SelectTrigger className={errors.companySize ? "border-red-500" : ""}>
                          <SelectValue placeholder="Choisir" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANY_SIZES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.companySize && (
                        <span className="text-xs text-red-500">{errors.companySize}</span>
                      )}
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Numéro de TVA</Label>
                      <Input
                        value={data.vatNumber}
                        onChange={(e) => updateData("vatNumber", e.target.value)}
                        placeholder="BE0123456789"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label>Pays</Label>
                      <Select
                        value={data.country}
                        onValueChange={(v) => updateData("country", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BE">🇧🇪 Belgique</SelectItem>
                          <SelectItem value="FR">🇫🇷 France</SelectItem>
                          <SelectItem value="LU">🇱🇺 Luxembourg</SelectItem>
                          <SelectItem value="CH">🇨🇭 Suisse</SelectItem>
                          <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Adresse</Label>
                      <Input
                        value={data.address}
                        onChange={(e) => updateData("address", e.target.value)}
                        placeholder="123 Rue de la Paix"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Code postal</Label>
                      <Input
                        value={data.postalCode}
                        onChange={(e) => updateData("postalCode", e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Ville</Label>
                      <Input
                        value={data.city}
                        onChange={(e) => updateData("city", e.target.value)}
                        placeholder="Bruxelles"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold">Personnalisation</h2>
                    <p className="text-sm text-muted-foreground">
                      Adaptez DEAL à votre image de marque
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Logo de l'entreprise</Label>
                      <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center hover:border-[#E85A5A] transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Glissez votre logo ou cliquez pour sélectionner
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG ou SVG (max 2MB)
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Couleur principale</Label>
                      <div className="flex gap-3 mt-2">
                        {BRAND_COLORS.map((color) => (
                          <button
                            key={color}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                              data.primaryColor === color
                                ? "border-[#252B4A] ring-2 ring-offset-2 ring-[#252B4A]"
                                : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => updateData("primaryColor", color)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Mentions légales (optionnel)</Label>
                      <Textarea
                        value={data.legalMentions}
                        onChange={(e) => updateData("legalMentions", e.target.value)}
                        placeholder="Conditions de paiement, assurances, etc."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ces mentions apparaîtront en bas de vos devis
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold">Coordonnées bancaires</h2>
                    <p className="text-sm text-muted-foreground">
                      Pour recevoir les paiements de vos clients
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>IBAN</Label>
                      <Input
                        value={data.iban}
                        onChange={(e) => updateData("iban", e.target.value)}
                        placeholder="BE68 5390 0754 7034"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>BIC/SWIFT</Label>
                        <Input
                          value={data.bic}
                          onChange={(e) => updateData("bic", e.target.value)}
                          placeholder="BNAGBEBB"
                        />
                      </div>
                      <div>
                        <Label>Nom de la banque</Label>
                        <Input
                          value={data.bankName}
                          onChange={(e) => updateData("bankName", e.target.value)}
                          placeholder="BNP Paribas Fortis"
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Astuce:</strong> Vos coordonnées bancaires seront affichées sur
                        vos devis et permettront de générer un QR code de paiement instantané.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div className="flex gap-2">
              {currentStep > 2 && (
                <Button variant="ghost" onClick={skipStep}>
                  Passer
                </Button>
              )}
              <Button
                onClick={nextStep}
                className="gap-2 bg-[#252B4A] hover:bg-[#1a1f35]"
              >
                {currentStep === STEPS.length ? "Terminer" : "Suivant"}
                {currentStep < STEPS.length && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
