"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DealLogo } from "@/components/brand";

export default function MFAVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  useEffect(() => {
    initializeMFAChallenge();
  }, []);

  const initializeMFAChallenge = async () => {
    try {
      // Get the user's MFA factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) throw factorsError;

      const totpFactor = factorsData?.totp?.find(f => f.status === "verified");

      if (!totpFactor) {
        // No MFA factor, redirect to dashboard
        router.push(redirectTo);
        return;
      }

      setFactorId(totpFactor.id);

      // Create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) throw challengeError;

      setChallengeId(challengeData.id);
    } catch (error: any) {
      console.error("MFA challenge error:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la vérification MFA",
        variant: "destructive",
      });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!factorId || !challengeId || code.length !== 6) return;

    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) throw error;

      toast({
        title: "Vérification réussie",
        description: "Bienvenue !",
      });

      router.push(redirectTo);
    } catch (error: any) {
      toast({
        title: "Code invalide",
        description: "Le code de vérification est incorrect. Réessayez.",
        variant: "destructive",
      });

      // Create a new challenge for retry
      if (factorId) {
        const { data: newChallenge } = await supabase.auth.mfa.challenge({
          factorId,
        });
        if (newChallenge) {
          setChallengeId(newChallenge.id);
        }
      }
    } finally {
      setVerifying(false);
      setCode("");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <DealLogo type="combined" size="md" variant="primary" />
          </div>
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl">Vérification à deux facteurs</CardTitle>
            <CardDescription>
              Entrez le code de votre application d'authentification
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-[0.5em] h-14"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Ouvrez votre application d'authentification (Google Authenticator, Authy, etc.)
                et entrez le code à 6 chiffres.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={code.length !== 6 || verifying || !challengeId}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier"
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                className="text-sm text-muted-foreground"
                onClick={handleSignOut}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Utiliser un autre compte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
