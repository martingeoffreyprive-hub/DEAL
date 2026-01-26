"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SECTORS, type Profile, type SectorType } from "@/types/database";
import { Save, Upload, Building2, CreditCard, FileText, Sparkles, Globe, User, Loader2 } from "lucide-react";
import { useLocaleContext } from "@/contexts/locale-context";
import { generateLegalMentions, detectLocale, getLocalePack } from "@/lib/locale-packs";
import { Badge } from "@/components/ui/badge";
import { DealIconD, DealLoadingSpinner } from "@/components/brand";
import { staggerContainer, staggerItem, cardHover } from "@/components/animations/page-transition";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const { locale, localePack, setLocale } = useLocaleContext();
  const [detectedLocale, setDetectedLocale] = useState<string | null>(null);

  // Detect locale from VAT number or postal code
  const handleDetectLocale = (vatNumber?: string, postalCode?: string) => {
    const detected = detectLocale({
      vatNumber: vatNumber || profile.siret || undefined,
      postalCode: postalCode || profile.postal_code || undefined,
    });

    if (detected !== locale) {
      setDetectedLocale(detected);
      const detectedPack = getLocalePack(detected);
      toast({
        title: `${detectedPack.flag} Locale détectée`,
        description: `Vos informations correspondent à ${detectedPack.country}. Cliquez pour appliquer.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLocale(detected);
              setDetectedLocale(null);
              toast({
                title: "Locale mise à jour",
                description: `Locale changée vers ${detectedPack.name}`,
              });
            }}
          >
            Appliquer
          </Button>
        ),
      });
    } else {
      setDetectedLocale(null);
    }
  };

  // Generate legal mentions based on current locale
  const handleGenerateLegalMentions = () => {
    const mentions = generateLegalMentions(locale, {
      includeDataProtection: true,
      includeInsurance: true,
    });
    updateProfile("legal_mentions", mentions);
    toast({
      title: "Mentions générées",
      description: `Mentions légales ${localePack.country} ajoutées`,
    });
  };

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setProfile(data || { id: user.id });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          company_name: profile.company_name || "",
          siret: profile.siret,
          address: profile.address,
          city: profile.city,
          postal_code: profile.postal_code,
          phone: profile.phone,
          email: profile.email,
          website: profile.website,
          logo_url: profile.logo_url,
          legal_mentions: profile.legal_mentions,
          default_sector: profile.default_sector || "AUTRE",
          quote_prefix: profile.quote_prefix || "DEV",
          iban: profile.iban,
          bic: profile.bic,
          bank_name: profile.bank_name,
        });

      if (error) throw error;

      toast({
        title: "Profil sauvegardé",
        description: "Vos informations ont été mises à jour",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 2 Mo",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      setProfile({ ...profile, logo_url: publicUrl });

      toast({
        title: "Logo uploadé",
        description: "N'oubliez pas de sauvegarder le profil",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = (field: keyof Profile, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  // Format IBAN with spaces
  const formatIBAN = (value: string) => {
    const cleaned = value.replace(/\s/g, "").toUpperCase();
    return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <DealLoadingSpinner size="lg" text="Chargement du profil..." />
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero Header */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#2D4A6F] to-[#0D1B2A] p-6 md:p-8"
        variants={staggerItem}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A962]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A962]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
              <User className="h-6 w-6 text-[#C9A962]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Profil entreprise
              </h1>
              <p className="text-white/70">
                Ces informations apparaitront sur vos devis
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872] font-semibold"
            >
              {saving ? <DealLoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
              Sauvegarder
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Company Info */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1E3A5F] to-[#2D4A6F]" />
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <CardTitle className="flex items-center gap-3 text-[#1E3A5F]">
              <div className="p-2 rounded-lg bg-[#1E3A5F]/10">
                <Building2 className="h-5 w-5 text-[#1E3A5F]" />
              </div>
              Informations entreprise
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>Changer le logo</span>
                  </div>
                </Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG ou PNG, max 2 Mo
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nom de l'entreprise *</Label>
              <Input
                id="company_name"
                value={profile.company_name || ""}
                onChange={(e) => updateProfile("company_name", e.target.value)}
                placeholder="Mon Entreprise SPRL"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="siret">Numéro de TVA</Label>
                {detectedLocale && detectedLocale !== locale && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {getLocalePack(detectedLocale as any).flag} Détecté: {getLocalePack(detectedLocale as any).country}
                  </Badge>
                )}
              </div>
              <Input
                id="siret"
                value={profile.siret || ""}
                onChange={(e) => updateProfile("siret", e.target.value)}
                onBlur={(e) => handleDetectLocale(e.target.value, undefined)}
                placeholder="BE0123456789, FR12345678901, CHE-123.456.789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={profile.address || ""}
              onChange={(e) => updateProfile("address", e.target.value)}
              placeholder="123 Rue de l'Exemple"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={profile.postal_code || ""}
                onChange={(e) => updateProfile("postal_code", e.target.value)}
                onBlur={(e) => handleDetectLocale(undefined, e.target.value)}
                placeholder="1000 (BE), 75001 (FR), 1200 (CH)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={profile.city || ""}
                onChange={(e) => updateProfile("city", e.target.value)}
                placeholder="Bruxelles"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => updateProfile("phone", e.target.value)}
                placeholder="+32 2 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                onChange={(e) => updateProfile("email", e.target.value)}
                placeholder="contact@entreprise.be"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              value={profile.website || ""}
              onChange={(e) => updateProfile("website", e.target.value)}
              placeholder="https://www.entreprise.be"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>

      {/* Banking Info */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#C9A962] to-[#D4B872]" />
          <CardHeader className="bg-gradient-to-r from-[#C9A962]/5 to-transparent">
            <CardTitle className="flex items-center gap-3 text-[#1E3A5F]">
              <div className="p-2 rounded-lg bg-[#C9A962]/10">
                <CreditCard className="h-5 w-5 text-[#C9A962]" />
              </div>
              Informations bancaires
            </CardTitle>
            <CardDescription>
              Pour generer un QR code de paiement sur vos devis
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={formatIBAN(profile.iban || "")}
              onChange={(e) => updateProfile("iban", e.target.value.replace(/\s/g, ""))}
              placeholder="BE68 5390 0754 7034"
              maxLength={34}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bic">BIC / SWIFT</Label>
              <Input
                id="bic"
                value={profile.bic || ""}
                onChange={(e) => updateProfile("bic", e.target.value.toUpperCase())}
                placeholder="GKCCBEBB"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Nom de la banque</Label>
              <Input
                id="bank_name"
                value={profile.bank_name || ""}
                onChange={(e) => updateProfile("bank_name", e.target.value)}
                placeholder="Belfius, ING, BNP Paribas..."
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Ces informations permettent de générer un QR code EPC sur vos devis pour faciliter le paiement par vos clients.
          </p>
        </CardContent>
      </Card>
    </motion.div>

      {/* Quote Settings */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1E3A5F] via-[#C9A962] to-[#1E3A5F]" />
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <CardTitle className="flex items-center gap-3 text-[#1E3A5F]">
              <DealIconD size="xs" variant="primary" />
              Parametres des devis
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default_sector">Secteur par défaut</Label>
              <Select
                value={profile.default_sector || "AUTRE"}
                onValueChange={(value) => updateProfile("default_sector", value as SectorType)}
              >
                <SelectTrigger id="default_sector">
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
            <div className="space-y-2">
              <Label htmlFor="quote_prefix">Préfixe des devis</Label>
              <Input
                id="quote_prefix"
                value={profile.quote_prefix || "DEV"}
                onChange={(e) => updateProfile("quote_prefix", e.target.value.toUpperCase())}
                placeholder="DEV"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Ex: DEV-2024-01-0001
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="legal_mentions">Mentions légales / CGV</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateLegalMentions}
                className="gap-2"
              >
                <Sparkles className="h-3 w-3" />
                Générer ({localePack.flag} {localePack.country})
              </Button>
            </div>
            <Textarea
              id="legal_mentions"
              value={profile.legal_mentions || ""}
              onChange={(e) => updateProfile("legal_mentions", e.target.value)}
              placeholder="Conditions de paiement, pénalités de retard, etc."
              rows={8}
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Ces mentions apparaîtront en bas de vos devis PDF. Cliquez sur "Générer" pour obtenir les mentions légales standard de votre pays.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </motion.div>
  );
}
