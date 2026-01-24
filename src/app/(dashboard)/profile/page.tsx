"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Loader2, Save, Upload, Building2, CreditCard, FileText } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profil entreprise</h1>
          <p className="text-muted-foreground">
            Ces informations apparaîtront sur vos devis
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </Button>
      </div>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
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
              <Label htmlFor="siret">Numéro de TVA</Label>
              <Input
                id="siret"
                value={profile.siret || ""}
                onChange={(e) => updateProfile("siret", e.target.value)}
                placeholder="BE0123456789"
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
                placeholder="1000"
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

      {/* Banking Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informations bancaires
          </CardTitle>
          <CardDescription>
            Pour générer un QR code de paiement sur vos devis
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

      {/* Quote Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Paramètres des devis
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
            <Label htmlFor="legal_mentions">Mentions légales / CGV</Label>
            <Textarea
              id="legal_mentions"
              value={profile.legal_mentions || ""}
              onChange={(e) => updateProfile("legal_mentions", e.target.value)}
              placeholder="Conditions de paiement, pénalités de retard, etc."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Ces mentions apparaîtront en bas de vos devis PDF
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
