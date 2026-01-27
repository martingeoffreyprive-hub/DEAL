"use client";

/**
 * Portail B2C - Pour les particuliers
 * Simulateur de prix, comparateur de devis, annuaire artisans
 */

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealLogo } from "@/components/brand/DealLogo";
import {
  Calculator,
  FileSearch,
  Users,
  Shield,
  Star,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Upload,
  Euro,
  Home,
  Zap,
  Droplets,
  Paintbrush,
  Wrench,
} from "lucide-react";

// Types de travaux
const WORK_TYPES = [
  { id: "renovation-kitchen", label: "Rénovation cuisine", icon: Home, pricePerSqm: { min: 400, max: 1200 } },
  { id: "renovation-bathroom", label: "Rénovation salle de bain", icon: Droplets, pricePerSqm: { min: 500, max: 1500 } },
  { id: "electricity", label: "Installation électrique", icon: Zap, pricePerSqm: { min: 80, max: 150 } },
  { id: "plumbing", label: "Plomberie", icon: Droplets, pricePerSqm: { min: 60, max: 120 } },
  { id: "painting", label: "Peinture", icon: Paintbrush, pricePerSqm: { min: 25, max: 50 } },
  { id: "general-renovation", label: "Rénovation générale", icon: Wrench, pricePerSqm: { min: 800, max: 2000 } },
];

// Artisans fictifs pour la démo
const DEMO_ARTISANS = [
  {
    id: "1",
    name: "Électricité Dubois",
    specialty: "Électricité",
    location: "Bruxelles",
    rating: 4.9,
    reviews: 127,
    responseTime: "< 2h",
    certifications: ["VCA", "Légionelle"],
    trustScore: 95,
  },
  {
    id: "2",
    name: "Plomberie Janssen",
    specialty: "Plomberie / Chauffage",
    location: "Anvers",
    rating: 4.7,
    reviews: 89,
    responseTime: "< 4h",
    certifications: ["Cerga"],
    trustScore: 88,
  },
  {
    id: "3",
    name: "Réno Plus SPRL",
    specialty: "Rénovation générale",
    location: "Liège",
    rating: 4.8,
    reviews: 203,
    responseTime: "< 24h",
    certifications: ["Constructiv"],
    trustScore: 92,
  },
];

export default function B2CPortalPage() {
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [surfaceArea, setSurfaceArea] = useState([50]);
  const [standing, setStanding] = useState("standard");
  const [estimatedPrice, setEstimatedPrice] = useState<{ min: number; max: number } | null>(null);

  // Calculer l'estimation
  const calculateEstimate = () => {
    const workType = WORK_TYPES.find(w => w.id === selectedWorkType);
    if (!workType) return;

    const area = surfaceArea[0];
    const standingMultiplier = standing === "budget" ? 0.7 : standing === "premium" ? 1.5 : 1;

    setEstimatedPrice({
      min: Math.round(workType.pricePerSqm.min * area * standingMultiplier),
      max: Math.round(workType.pricePerSqm.max * area * standingMultiplier),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <DealLogo size="sm" />
            <Badge variant="outline" className="text-xs">Particuliers</Badge>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#simulateur" className="text-sm hover:text-[#1E3A5F]">Simulateur</Link>
            <Link href="#comparateur" className="text-sm hover:text-[#1E3A5F]">Comparateur</Link>
            <Link href="#artisans" className="text-sm hover:text-[#1E3A5F]">Trouver un artisan</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button size="sm" className="bg-[#1E3A5F]" asChild>
              <Link href="/register">Inscription</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-[#1E3A5F] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Vos travaux en toute confiance
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
          >
            Estimez vos coûts, comparez les devis, trouvez des artisans vérifiés
            et sécurisez vos paiements.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
              <Calculator className="mr-2 h-5 w-5" />
              Estimer mes travaux
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Users className="mr-2 h-5 w-5" />
              Trouver un artisan
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        <Tabs defaultValue="simulator" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="simulator" className="gap-2">
              <Calculator className="h-4 w-4" />
              Simulateur
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <FileSearch className="h-4 w-4" />
              Comparateur
            </TabsTrigger>
            <TabsTrigger value="artisans" className="gap-2">
              <Users className="h-4 w-4" />
              Artisans
            </TabsTrigger>
          </TabsList>

          {/* ==================== */}
          {/* SIMULATEUR DE PRIX */}
          {/* ==================== */}
          <TabsContent value="simulator">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-[#1E3A5F]" />
                    Simulateur de prix
                  </CardTitle>
                  <CardDescription>
                    Obtenez une estimation instantanée du coût de vos travaux
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Type de travaux */}
                  <div className="space-y-2">
                    <Label>Type de travaux</Label>
                    <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type de travaux" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <span className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Surface */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Surface (m²)</Label>
                      <span className="text-sm font-medium">{surfaceArea[0]} m²</span>
                    </div>
                    <Slider
                      value={surfaceArea}
                      onValueChange={setSurfaceArea}
                      min={5}
                      max={200}
                      step={5}
                    />
                  </div>

                  {/* Standing */}
                  <div className="space-y-2">
                    <Label>Niveau de finition</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "budget", label: "Économique", desc: "-30%" },
                        { value: "standard", label: "Standard", desc: "Prix moyen" },
                        { value: "premium", label: "Premium", desc: "+50%" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setStanding(option.value)}
                          className={`p-4 rounded-lg border-2 text-center transition-all ${
                            standing === option.value
                              ? "border-[#1E3A5F] bg-[#1E3A5F]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calculate button */}
                  <Button
                    onClick={calculateEstimate}
                    className="w-full bg-[#1E3A5F]"
                    disabled={!selectedWorkType}
                  >
                    Calculer l'estimation
                  </Button>

                  {/* Result */}
                  {estimatedPrice && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-gradient-to-r from-[#1E3A5F] to-[#0D1B2A] rounded-xl text-white"
                    >
                      <div className="text-sm text-white/70 mb-2">Estimation pour vos travaux</div>
                      <div className="text-4xl font-bold mb-2">
                        {estimatedPrice.min.toLocaleString()}€ - {estimatedPrice.max.toLocaleString()}€
                      </div>
                      <div className="text-sm text-white/70">
                        TVA 21% incluse • Prix indicatif
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="secondary">
                          Demander des devis
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/30 text-white">
                          Affiner l'estimation
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ==================== */}
          {/* COMPARATEUR DE DEVIS */}
          {/* ==================== */}
          <TabsContent value="compare">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSearch className="h-6 w-6 text-[#1E3A5F]" />
                    Comparateur de devis
                  </CardTitle>
                  <CardDescription>
                    Uploadez vos devis et comparez-les au prix du marché
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload zone */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#1E3A5F]/50 transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="font-medium mb-1">Glissez vos devis ici</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      PDF, JPG ou PNG • Max 10 Mo
                    </div>
                    <Button variant="outline">Parcourir les fichiers</Button>
                  </div>

                  {/* How it works */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      { step: "1", title: "Uploadez", desc: "Vos devis reçus" },
                      { step: "2", title: "Analysez", desc: "IA compare au marché" },
                      { step: "3", title: "Décidez", desc: "En toute confiance" },
                    ].map((item) => (
                      <div key={item.step} className="p-4">
                        <div className="h-10 w-10 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center mx-auto mb-2 font-bold">
                          {item.step}
                        </div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ==================== */}
          {/* ANNUAIRE ARTISANS */}
          {/* ==================== */}
          <TabsContent value="artisans">
            <div className="space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input placeholder="Type de travaux (ex: électricité, plomberie...)" />
                    </div>
                    <div className="w-full md:w-48">
                      <Input placeholder="Code postal" />
                    </div>
                    <Button className="bg-[#1E3A5F]">
                      Rechercher
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEMO_ARTISANS.map((artisan) => (
                  <motion.div
                    key={artisan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{artisan.name}</h3>
                            <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Score {artisan.trustScore}%
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{artisan.rating}</span>
                            <span className="text-muted-foreground">({artisan.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {artisan.location}
                          </div>
                        </div>

                        {/* Response time */}
                        <div className="flex items-center gap-2 mb-4 text-sm">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span>Répond en {artisan.responseTime}</span>
                        </div>

                        {/* Certifications */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {artisan.certifications.map((cert) => (
                            <Badge key={cert} variant="secondary" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>

                        {/* CTA */}
                        <Button className="w-full bg-[#1E3A5F]">
                          Demander un devis
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Paiement Séquestre CTA */}
        <Card className="mt-12 bg-gradient-to-r from-[#1E3A5F] to-[#0D1B2A] text-white">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-[#C9A962]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Paiement sécurisé par étapes</h3>
                <p className="text-white/80">
                  30% au début • 40% à mi-travaux • 30% à la fin
                </p>
              </div>
            </div>
            <Button size="lg" className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
              En savoir plus
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DealLogo size="sm" />
            <span>pour les particuliers</span>
          </div>
          <p>© 2024 DEAL. Conforme RGPD • Hébergé en Europe 🇪🇺</p>
        </div>
      </footer>
    </div>
  );
}
