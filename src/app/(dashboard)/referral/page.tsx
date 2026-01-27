"use client";

/**
 * Referral Program Page
 * Programme de parrainage multi-niveaux
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Gift,
  Users,
  Copy,
  QrCode,
  Mail,
  Share2,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { AMBASSADOR_LEVELS, REFERRAL_REWARDS } from "@/lib/referral/constants";

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalEarnings: number;
  ambassadorLevel: "bronze" | "silver" | "gold" | "platinum";
  referralCode: string;
}

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  created_at: string;
  converted_at?: string;
  reward_type?: string;
  reward_amount?: number;
}

export default function ReferralPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, referralsRes] = await Promise.all([
        fetch("/api/referral/stats"),
        fetch("/api/referral"),
      ]);

      const statsData = await statsRes.json();
      const referralsData = await referralsRes.json();

      setStats(statsData);
      setReferrals(referralsData.referrals || []);
    } catch (error) {
      console.error("Failed to fetch referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `https://deal.be/join/${stats?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Lien copié !",
      description: "Partagez ce lien avec vos contacts",
    });
  };

  const sendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await fetch("/api/referral/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Invitation envoyée !",
        description: `Un email a été envoyé à ${inviteEmail}`,
      });
      setInviteEmail("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'invitation",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const currentLevel = stats?.ambassadorLevel || "bronze";
  const currentLevelConfig = AMBASSADOR_LEVELS[currentLevel];
  const nextLevel =
    currentLevel === "bronze" ? "silver" :
    currentLevel === "silver" ? "gold" :
    currentLevel === "gold" ? "platinum" :
    null;
  const nextLevelConfig = nextLevel ? AMBASSADOR_LEVELS[nextLevel] : null;

  const progressToNext = nextLevelConfig
    ? Math.min(100, (stats?.convertedReferrals || 0) / nextLevelConfig.min_referrals * 100)
    : 100;

  return (
    <>
      <div className="container max-w-5xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Gift className="h-8 w-8 text-[#C9A962]" />
              Programme de Parrainage
            </h1>
            <p className="text-muted-foreground mt-2">
              Parrainez des artisans et gagnez des récompenses
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                    <p className="text-xs text-muted-foreground">Parrainages total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.pendingReferrals || 0}</p>
                    <p className="text-xs text-muted-foreground">En attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.convertedReferrals || 0}</p>
                    <p className="text-xs text-muted-foreground">Convertis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalEarnings || 0}€</p>
                    <p className="text-xs text-muted-foreground">Gains totaux</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Share section */}
            <div className="md:col-span-2 space-y-6">
              {/* Referral Link */}
              <Card>
                <CardHeader>
                  <CardTitle>Votre lien de parrainage</CardTitle>
                  <CardDescription>
                    Partagez ce lien pour inviter de nouveaux artisans
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={`deal.be/join/${stats?.referralCode || "..."}`}
                      readOnly
                      className="font-mono"
                    />
                    <Button onClick={copyReferralLink} className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copier
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      <QrCode className="h-4 w-4" />
                      QR Code
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      Partager
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Send Invite */}
              <Card>
                <CardHeader>
                  <CardTitle>Inviter par email</CardTitle>
                  <CardDescription>
                    Envoyez une invitation directement par email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="email@exemple.be"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={sendInvite}
                      disabled={isSendingInvite}
                      className="gap-2 bg-[#1E3A5F]"
                    >
                      <Mail className="h-4 w-4" />
                      Inviter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Referrals List */}
              <Card>
                <CardHeader>
                  <CardTitle>Vos parrainages</CardTitle>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Vous n'avez pas encore de parrainages
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {referrals.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{referral.referred_email}</p>
                            <p className="text-xs text-muted-foreground">
                              Invité le {new Date(referral.created_at).toLocaleDateString("fr-BE")}
                            </p>
                          </div>
                          <Badge
                            variant={
                              referral.status === "rewarded" ? "default" :
                              referral.status === "converted" ? "default" :
                              "secondary"
                            }
                            className={
                              referral.status === "rewarded" || referral.status === "converted"
                                ? "bg-green-500"
                                : ""
                            }
                          >
                            {referral.status === "pending" && "En attente"}
                            {referral.status === "signed_up" && "Inscrit"}
                            {referral.status === "converted" && "Converti"}
                            {referral.status === "rewarded" && "Récompensé"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ambassador Level */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-[#1E3A5F] to-[#0D1B2A] text-white">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-[#C9A962]/20 flex items-center justify-center mx-auto mb-3">
                      <Award className="h-8 w-8 text-[#C9A962]" />
                    </div>
                    <Badge className="bg-[#C9A962] text-[#0D1B2A] mb-2">
                      Niveau {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
                    </Badge>
                    <p className="text-sm text-white/80">
                      {stats?.convertedReferrals || 0} parrainages convertis
                    </p>
                  </div>

                  {nextLevelConfig && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-white/60">
                        <span>Prochain niveau: {nextLevel}</span>
                        <span>{nextLevelConfig.min_referrals} parrainages</span>
                      </div>
                      <Progress value={progressToNext} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Rewards Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#C9A962]" />
                    Récompenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-700">Artisan → Artisan</p>
                    <p className="text-sm text-green-600">
                      Vous: 1 mois offert
                    </p>
                    <p className="text-sm text-green-600">
                      Filleul: 30 jours gratuits
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-700">Artisan → Particulier</p>
                    <p className="text-sm text-blue-600">
                      Vous: 100 TokenDEAL
                    </p>
                    <p className="text-sm text-blue-600">
                      Filleul: 10% sur 1er paiement
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-700">Non-membre</p>
                    <p className="text-sm text-purple-600">
                      Vous: 30€ en bon d'achat
                    </p>
                    <p className="text-sm text-purple-600">
                      Filleul: 30 jours gratuits
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Ambassador Perks */}
              <Card>
                <CardHeader>
                  <CardTitle>Avantages Ambassadeur</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {currentLevelConfig.perks.map((perk, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {perk}
                      </li>
                    ))}
                    {currentLevelConfig.commission > 0 && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Commission {currentLevelConfig.commission}% récurrente
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
