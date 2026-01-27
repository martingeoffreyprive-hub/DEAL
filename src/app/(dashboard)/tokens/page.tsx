"use client";

/**
 * TokenDEAL Wallet Page
 * Portefeuille et historique des tokens
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Gift,
  ShoppingCart,
  Star,
  Users,
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Info,
} from "lucide-react";
import { TOKEN_PRICES, TOKEN_REWARDS } from "@/lib/pricing/pricing-strategy";

interface TokenTransaction {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  source: string;
  description?: string;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  earn: { label: "Gagné", icon: TrendingUp, color: "text-green-500" },
  spend: { label: "Dépensé", icon: TrendingDown, color: "text-red-500" },
  bonus: { label: "Bonus", icon: Gift, color: "text-purple-500" },
  refund: { label: "Remboursé", icon: ArrowUpRight, color: "text-blue-500" },
};

const SOURCE_LABELS: Record<string, string> = {
  referral: "Parrainage",
  review: "Avis client",
  purchase: "Achat",
  template: "Modèle premium",
  ai_credits: "Crédits IA",
  signup_bonus: "Bonus inscription",
  streak_bonus: "Bonus activité",
};

export default function TokensPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await fetch("/api/tokens");
      const data = await response.json();
      setBalance(data.balance || 0);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const earnedThisMonth = transactions
    .filter(t => {
      const txDate = new Date(t.created_at);
      const now = new Date();
      return (
        t.amount > 0 &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const spentThisMonth = transactions
    .filter(t => {
      const txDate = new Date(t.created_at);
      const now = new Date();
      return (
        t.amount < 0 &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <>
      <div className="container max-w-5xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Coins className="h-8 w-8 text-[#C9A962]" />
              TokenDEAL
            </h1>
            <p className="text-muted-foreground mt-2">
              Votre portefeuille de monnaie interne
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-[#1E3A5F] to-[#0D1B2A] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Coins className="h-10 w-10 text-[#C9A962]" />
                  <Badge className="bg-[#C9A962] text-[#0D1B2A]">Solde</Badge>
                </div>
                <p className="text-4xl font-bold">{balance.toLocaleString()}</p>
                <p className="text-white/70 text-sm mt-1">TokenDEAL disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gagnés ce mois</p>
                    <p className="text-2xl font-bold text-green-600">+{earnedThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dépensés ce mois</p>
                    <p className="text-2xl font-bold text-red-600">-{spentThisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Transactions */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-100 rounded" />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Coins className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Aucune transaction</p>
                      <p className="text-sm">Gagnez des tokens en parrainant ou en laissant des avis</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx, index) => {
                        const config = TYPE_CONFIG[tx.type] || TYPE_CONFIG.earn;
                        const Icon = config.icon;
                        const isPositive = tx.amount > 0;

                        return (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                isPositive ? "bg-green-100" : "bg-red-100"
                              }`}>
                                <Icon className={`h-5 w-5 ${config.color}`} />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {SOURCE_LABELS[tx.source] || tx.source}
                                </p>
                                {tx.description && (
                                  <p className="text-xs text-muted-foreground">{tx.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(tx.created_at).toLocaleDateString("fr-BE", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                {isPositive ? "+" : ""}{tx.amount}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Solde: {tx.balance_after}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* How to earn */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#C9A962]" />
                    Comment gagner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Parrainage B2B</span>
                    </div>
                    <Badge variant="secondary">+{TOKEN_REWARDS.referral_b2b}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Avis vérifié</span>
                    </div>
                    <Badge variant="secondary">+{TOKEN_REWARDS.review_verified}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">10 devis/mois</span>
                    </div>
                    <Badge variant="secondary">+{TOKEN_REWARDS.quote_milestone_10}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Bonus connexion</span>
                    </div>
                    <Badge variant="secondary">+{TOKEN_REWARDS.daily_login}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-[#C9A962]" />
                    Utiliser vos tokens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">Modèle premium</span>
                    <Badge variant="outline">{TOKEN_PRICES.premium_template} tokens</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">10 crédits IA</span>
                    <Badge variant="outline">{TOKEN_PRICES.ai_credits_10} tokens</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">Boost visibilité</span>
                    <Badge variant="outline">{TOKEN_PRICES.visibility_boost} tokens</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#C9A962]/30 bg-[#C9A962]/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-[#C9A962] mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-[#1E3A5F]">Bon à savoir</p>
                      <p className="text-muted-foreground">
                        Les TokenDEAL n'ont pas de valeur monétaire et ne peuvent pas être échangés contre de l'argent.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
