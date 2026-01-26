"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  Smartphone,
  Key,
  Loader2,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Lock,
  Unlock,
} from "lucide-react";
import { staggerContainer, staggerItem, cardHover } from "@/components/animations/page-transition";
import { DealLoadingSpinner } from "@/components/brand";
import QRCode from "qrcode";

interface MFAFactor {
  id: string;
  friendly_name: string;
  factor_type: string;
  status: string;
  created_at: string;
}

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);

  // Enrollment state
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // Password change state
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Sessions state
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get MFA factors
      const { data: factorsData, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        console.error("Error loading MFA factors:", error);
      } else {
        const verifiedFactors = factorsData?.totp?.filter(f => f.status === "verified") || [];
        setFactors(verifiedFactors as MFAFactor[]);
        setMfaEnabled(verifiedFactors.length > 0);
      }
    } catch (error) {
      console.error("Error loading MFA status:", error);
    } finally {
      setLoading(false);
    }
  };

  const startMFAEnrollment = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App",
      });

      if (error) throw error;

      if (data) {
        setFactorId(data.id);
        setSecret(data.totp.secret);

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(data.totp.uri);
        setQrCode(qrCodeUrl);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer l'inscription MFA",
        variant: "destructive",
      });
      setEnrolling(false);
    }
  };

  const verifyMFAEnrollment = async () => {
    if (!factorId || verificationCode.length !== 6) return;

    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode,
      });

      if (error) throw error;

      toast({
        title: "MFA activé",
        description: "L'authentification à deux facteurs est maintenant active.",
      });

      // Reset state
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerificationCode("");
      setEnrolling(false);

      // Reload status
      loadMFAStatus();
    } catch (error: any) {
      toast({
        title: "Code invalide",
        description: "Le code de vérification est incorrect. Réessayez.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const disableMFA = async (factorIdToRemove: string) => {
    setDisabling(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorIdToRemove,
      });

      if (error) throw error;

      toast({
        title: "MFA désactivé",
        description: "L'authentification à deux facteurs a été désactivée.",
      });

      loadMFAStatus();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de désactiver MFA",
        variant: "destructive",
      });
    } finally {
      setDisabling(false);
    }
  };

  const cancelEnrollment = async () => {
    if (factorId) {
      try {
        await supabase.auth.mfa.unenroll({ factorId });
      } catch (e) {
        // Ignore errors
      }
    }
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerificationCode("");
    setEnrolling(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le mot de passe.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Clé secrète copiée dans le presse-papier.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DealLoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-6"
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

        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
            <Shield className="h-7 w-7 text-[#C9A962]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Sécurité du compte
            </h1>
            <p className="text-white/70">
              Protégez votre compte avec l'authentification à deux facteurs
            </p>
          </div>
        </div>
      </motion.div>

      {/* MFA Status */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#C9A962] to-[#D4B872]" />
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${mfaEnabled ? "bg-green-500/10" : "bg-[#C9A962]/10"}`}>
                  {mfaEnabled ? (
                    <Shield className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[#C9A962]" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-[#1E3A5F]">Authentification à deux facteurs (2FA)</CardTitle>
                  <CardDescription>
                    Ajoutez une couche de sécurité supplémentaire
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={mfaEnabled ? "default" : "secondary"}
                className={mfaEnabled ? "bg-green-500" : "bg-[#C9A962]/20 text-[#B89952]"}
              >
                {mfaEnabled ? "Activé" : "Désactivé"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!enrolling ? (
              <>
                {mfaEnabled ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Votre compte est protégé par l'authentification à deux facteurs.
                      Un code sera demandé lors de chaque connexion.
                    </p>
                    <div className="space-y-2">
                      {factors.map((factor) => (
                        <div
                          key={factor.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{factor.friendly_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Ajouté le {new Date(factor.created_at).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive">
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Désactiver 2FA ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Votre compte sera moins sécurisé sans l'authentification à deux facteurs.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => disableMFA(factor.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                  disabled={disabling}
                                >
                                  {disabling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Désactiver"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire
                      en demandant un code depuis votre application d'authentification lors de la connexion.
                    </p>
                    <Button onClick={startMFAEnrollment} className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Activer 2FA
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Scannez ce QR code avec votre application d'authentification
                    (Google Authenticator, Authy, 1Password, etc.)
                  </p>

                  {qrCode && (
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-lg">
                        <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
                      </div>
                    </div>
                  )}

                  {secret && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Ou entrez cette clé manuellement :
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="px-3 py-2 bg-muted rounded text-sm font-mono">
                          {showSecret ? secret : "••••••••••••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(secret)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification-code">Code de vérification</Label>
                  <div className="flex gap-2">
                    <Input
                      id="verification-code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                    />
                    <Button
                      onClick={verifyMFAEnrollment}
                      disabled={verificationCode.length !== 6 || verifying}
                    >
                      {verifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entrez le code à 6 chiffres affiché dans votre application
                  </p>
                </div>

                <Button variant="outline" className="w-full" onClick={cancelEnrollment}>
                  Annuler
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Change */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C9A962]/10">
                <Key className="h-5 w-5 text-[#C9A962]" />
              </div>
              <div>
                <CardTitle className="text-[#1E3A5F]">Mot de passe</CardTitle>
                <CardDescription>
                  Modifiez votre mot de passe de connexion
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez le mot de passe"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Modifier le mot de passe
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Tips */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C9A962]/10">
                <Lock className="h-5 w-5 text-[#C9A962]" />
              </div>
              <div>
                <CardTitle className="text-[#1E3A5F]">Conseils de sécurité</CardTitle>
                <CardDescription>
                  Bonnes pratiques pour protéger votre compte
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <span>Utilisez un mot de passe unique d'au moins 12 caractères</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <span>Activez l'authentification à deux facteurs (2FA)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <span>Ne partagez jamais vos identifiants de connexion</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <span>Vérifiez régulièrement les sessions actives</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <span>Déconnectez-vous des appareils non utilisés</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
