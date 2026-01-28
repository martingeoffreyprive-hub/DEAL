"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Download,
  Trash2,
  Shield,
  FileJson,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { staggerContainer, staggerItem, cardHover } from "@/components/animations/page-transition";
import { DealIconD } from "@/components/brand";

export default function PrivacySettingsPage() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/user/data-export");

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || "deal-export.json";

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export réussi",
        description: "Vos données ont été téléchargées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter vos données.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "SUPPRIMER") {
      toast({
        title: "Confirmation incorrecte",
        description: "Veuillez taper SUPPRIMER pour confirmer.",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation: "DELETE_MY_ACCOUNT",
          password: deletePassword || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Deletion failed");
      }

      toast({
        title: "Compte supprimé",
        description: "Votre compte et toutes vos données ont été supprimés.",
      });

      // Redirect to homepage after deletion
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmation("");
      setDeletePassword("");
    }
  };

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
              Confidentialité & Données
            </h1>
            <p className="text-white/70">
              Gérez vos données personnelles conformément au RGPD
            </p>
          </div>
        </div>
      </motion.div>

      {/* Data Protection Info */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#C9A962] to-[#D4B872]" />
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C9A962]/10">
                <Shield className="h-5 w-5 text-[#C9A962]" />
              </div>
              <div>
                <CardTitle className="text-[#1E3A5F]">Protection des données</CardTitle>
                <CardDescription>
                  Vos droits en vertu du RGPD
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1E3A5F]">Droit d'accès</p>
                  <p className="text-muted-foreground">
                    Vous pouvez demander une copie de toutes vos données personnelles.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1E3A5F]">Droit à l'effacement</p>
                  <p className="text-muted-foreground">
                    Vous pouvez demander la suppression de toutes vos données.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-[#C9A962] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1E3A5F]">Droit à la portabilité</p>
                  <p className="text-muted-foreground">
                    Vos données sont exportables dans un format structuré (JSON).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Data */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#C9A962]/10">
                <FileJson className="h-5 w-5 text-[#C9A962]" />
              </div>
              <div>
                <CardTitle className="text-[#1E3A5F]">Exporter mes données</CardTitle>
                <CardDescription>
                  Téléchargez une copie de toutes vos données
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              L'export inclut : profil, devis, factures, statistiques d'utilisation et journaux d'activité.
              Le fichier est au format JSON, lisible par n'importe quel éditeur de texte.
            </p>
            <Button
              onClick={handleExportData}
              disabled={exporting}
              className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger mes données
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Account */}
      <motion.div variants={staggerItem}>
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">Zone de danger</CardTitle>
                <CardDescription>
                  Actions irréversibles sur votre compte
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La suppression de votre compte est <strong>définitive et irréversible</strong>.
              Toutes vos données seront supprimées : devis, factures, profil, statistiques.
            </p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées
                    de nos serveurs. Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmation">
                      Tapez <span className="font-mono font-bold">SUPPRIMER</span> pour confirmer
                    </Label>
                    <Input
                      id="confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="SUPPRIMER"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Mot de passe (optionnel, pour plus de sécurité)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Votre mot de passe"
                    />
                  </div>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmation !== "SUPPRIMER"}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      "Supprimer définitivement"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
