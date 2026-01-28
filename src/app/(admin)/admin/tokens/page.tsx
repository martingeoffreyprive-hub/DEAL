"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Users,
  Gift,
  Settings,
  Plus,
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  Target,
  Zap,
  RefreshCw,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface TokenStats {
  totalInCirculation: number;
  totalConsumed: number;
  totalBonusGiven: number;
  averagePerUser: number;
  trends: {
    circulation: number;
    consumed: number;
    bonus: number;
  };
}

interface BonusCampaign {
  id: string;
  name: string;
  type: "signup" | "referral" | "milestone" | "promo" | "loyalty";
  tokenAmount: number;
  startDate: string;
  endDate: string | null;
  status: "active" | "scheduled" | "ended" | "paused";
  usageCount: number;
  maxUsage: number | null;
  conditions: string;
}

interface TokenPrice {
  id: string;
  feature: string;
  tokenCost: number;
  category: "ai" | "export" | "premium" | "integration";
  description: string;
  isActive: boolean;
}

interface TokenTransaction {
  id: string;
  userId: string;
  userName: string;
  type: "purchase" | "consume" | "bonus" | "refund";
  amount: number;
  feature: string;
  createdAt: string;
}

// Mock Data
const mockStats: TokenStats = {
  totalInCirculation: 1250000,
  totalConsumed: 876543,
  totalBonusGiven: 125000,
  averagePerUser: 234,
  trends: {
    circulation: 12.5,
    consumed: 8.3,
    bonus: -5.2,
  },
};

const mockCampaigns: BonusCampaign[] = [
  {
    id: "1",
    name: "Bonus Inscription",
    type: "signup",
    tokenAmount: 50,
    startDate: "2024-01-01",
    endDate: null,
    status: "active",
    usageCount: 2340,
    maxUsage: null,
    conditions: "Inscription validée avec email confirmé",
  },
  {
    id: "2",
    name: "Parrainage Ami",
    type: "referral",
    tokenAmount: 100,
    startDate: "2024-01-01",
    endDate: null,
    status: "active",
    usageCount: 456,
    maxUsage: null,
    conditions: "Filleul doit créer son premier devis",
  },
  {
    id: "3",
    name: "10e Devis Signé",
    type: "milestone",
    tokenAmount: 200,
    startDate: "2024-01-01",
    endDate: null,
    status: "active",
    usageCount: 123,
    maxUsage: null,
    conditions: "Atteindre 10 devis signés",
  },
  {
    id: "4",
    name: "Promo Lancement V2",
    type: "promo",
    tokenAmount: 500,
    startDate: "2024-06-01",
    endDate: "2024-06-30",
    status: "ended",
    usageCount: 890,
    maxUsage: 1000,
    conditions: "Code promo DEALV2",
  },
  {
    id: "5",
    name: "Fidélité 1 An",
    type: "loyalty",
    tokenAmount: 1000,
    startDate: "2024-01-01",
    endDate: null,
    status: "active",
    usageCount: 45,
    maxUsage: null,
    conditions: "1 an d'abonnement actif continu",
  },
];

const mockPrices: TokenPrice[] = [
  { id: "1", feature: "Génération IA Standard", tokenCost: 5, category: "ai", description: "1 génération de devis par IA", isActive: true },
  { id: "2", feature: "Génération IA Avancée", tokenCost: 15, category: "ai", description: "Génération avec analyse contextuelle", isActive: true },
  { id: "3", feature: "Export PDF Pro", tokenCost: 2, category: "export", description: "Export avec personnalisation complète", isActive: true },
  { id: "4", feature: "Export Word", tokenCost: 3, category: "export", description: "Export format Word éditable", isActive: true },
  { id: "5", feature: "Signature Électronique", tokenCost: 10, category: "premium", description: "Signature avec valeur légale", isActive: true },
  { id: "6", feature: "OCR Scanner", tokenCost: 8, category: "premium", description: "Scan et reconnaissance de documents", isActive: true },
  { id: "7", feature: "Sync CRM", tokenCost: 5, category: "integration", description: "Synchronisation avec CRM externe", isActive: true },
  { id: "8", feature: "API Call", tokenCost: 1, category: "integration", description: "Appel API externe", isActive: true },
];

const mockTransactions: TokenTransaction[] = [
  { id: "1", userId: "u1", userName: "Jean Dupont", type: "purchase", amount: 500, feature: "Achat pack 500", createdAt: "2024-06-15T10:30:00Z" },
  { id: "2", userId: "u2", userName: "Marie Martin", type: "consume", amount: -15, feature: "Génération IA Avancée", createdAt: "2024-06-15T10:25:00Z" },
  { id: "3", userId: "u3", userName: "Pierre Durand", type: "bonus", amount: 100, feature: "Parrainage Ami", createdAt: "2024-06-15T10:20:00Z" },
  { id: "4", userId: "u4", userName: "Sophie Bernard", type: "consume", amount: -5, feature: "Génération IA Standard", createdAt: "2024-06-15T10:15:00Z" },
  { id: "5", userId: "u1", userName: "Jean Dupont", type: "refund", amount: 50, feature: "Remboursement erreur", createdAt: "2024-06-15T10:10:00Z" },
];

const CAMPAIGN_TYPE_INFO = {
  signup: { label: "Inscription", icon: Users, color: "bg-blue-500" },
  referral: { label: "Parrainage", icon: Gift, color: "bg-purple-500" },
  milestone: { label: "Milestone", icon: Target, color: "bg-green-500" },
  promo: { label: "Promo", icon: Sparkles, color: "bg-orange-500" },
  loyalty: { label: "Fidélité", icon: Crown, color: "bg-amber-500" },
};

const STATUS_COLORS = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ended: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

const CATEGORY_INFO = {
  ai: { label: "IA", color: "bg-purple-500/10 text-purple-500" },
  export: { label: "Export", color: "bg-blue-500/10 text-blue-500" },
  premium: { label: "Premium", color: "bg-amber-500/10 text-amber-500" },
  integration: { label: "Intégration", color: "bg-green-500/10 text-green-500" },
};

export default function AdminTokensPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignDialog, setCampaignDialog] = useState<"create" | "edit" | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<BonusCampaign | null>(null);
  const [priceDialog, setPriceDialog] = useState<"create" | "edit" | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<TokenPrice | null>(null);

  // New campaign form state
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "signup" as BonusCampaign["type"],
    tokenAmount: 50,
    startDate: "",
    endDate: "",
    maxUsage: "",
    conditions: "",
  });

  // New price form state
  const [newPrice, setNewPrice] = useState({
    feature: "",
    tokenCost: 5,
    category: "ai" as TokenPrice["category"],
    description: "",
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleCreateCampaign = () => {
    console.log("Creating campaign:", newCampaign);
    setCampaignDialog(null);
    setNewCampaign({
      name: "",
      type: "signup",
      tokenAmount: 50,
      startDate: "",
      endDate: "",
      maxUsage: "",
      conditions: "",
    });
  };

  const handleUpdatePrice = () => {
    console.log("Updating price:", selectedPrice, newPrice);
    setPriceDialog(null);
    setSelectedPrice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-500" />
            TokenDEAL Economy
          </h1>
          <p className="text-muted-foreground">
            Gérez l'économie des tokens de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="bonus">Bonus & Campagnes</TabsTrigger>
          <TabsTrigger value="pricing">Tarification</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">En circulation</p>
                      <p className="text-2xl font-bold text-amber-500">
                        {formatNumber(mockStats.totalInCirculation)}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      mockStats.trends.circulation > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {mockStats.trends.circulation > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(mockStats.trends.circulation)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Consommés</p>
                      <p className="text-2xl font-bold text-blue-500">
                        {formatNumber(mockStats.totalConsumed)}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      mockStats.trends.consumed > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {mockStats.trends.consumed > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(mockStats.trends.consumed)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Bonus distribués</p>
                      <p className="text-2xl font-bold text-green-500">
                        {formatNumber(mockStats.totalBonusGiven)}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      mockStats.trends.bonus > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {mockStats.trends.bonus > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(mockStats.trends.bonus)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Moyenne/utilisateur</p>
                      <p className="text-2xl font-bold text-purple-500">
                        {formatNumber(mockStats.averagePerUser)}
                      </p>
                    </div>
                    <Zap className="h-5 w-5 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        tx.type === "purchase" ? "bg-green-500/10 text-green-500" :
                        tx.type === "consume" ? "bg-red-500/10 text-red-500" :
                        tx.type === "bonus" ? "bg-purple-500/10 text-purple-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {tx.type === "purchase" ? <ArrowUpRight className="h-5 w-5" /> :
                         tx.type === "consume" ? <ArrowDownRight className="h-5 w-5" /> :
                         tx.type === "bonus" ? <Gift className="h-5 w-5" /> :
                         <RefreshCw className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.userName}</p>
                        <p className="text-sm text-muted-foreground">{tx.feature}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-bold",
                        tx.amount > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {tx.amount > 0 ? "+" : ""}{formatNumber(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonus Tab */}
        <TabsContent value="bonus" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une campagne..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setCampaignDialog("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle campagne
            </Button>
          </div>

          <div className="grid gap-4">
            {mockCampaigns.map((campaign) => {
              const typeInfo = CAMPAIGN_TYPE_INFO[campaign.type];
              const TypeIcon = typeInfo.icon;
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center text-white",
                            typeInfo.color
                          )}>
                            <TypeIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{campaign.name}</h3>
                              <Badge variant="outline" className={STATUS_COLORS[campaign.status]}>
                                {campaign.status === "active" ? "Actif" :
                                 campaign.status === "scheduled" ? "Programmé" :
                                 campaign.status === "ended" ? "Terminé" : "En pause"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {campaign.conditions}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(campaign.startDate)}
                                {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                              </span>
                              <span>
                                {formatNumber(campaign.usageCount)} utilisations
                                {campaign.maxUsage && ` / ${formatNumber(campaign.maxUsage)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-500">
                            +{formatNumber(campaign.tokenAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">tokens</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setCampaignDialog("edit");
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tarification des fonctionnalités</h2>
            <Button onClick={() => setPriceDialog("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tarification
            </Button>
          </div>

          <div className="grid gap-4">
            {Object.entries(
              mockPrices.reduce((acc, price) => {
                if (!acc[price.category]) acc[price.category] = [];
                acc[price.category].push(price);
                return acc;
              }, {} as Record<string, TokenPrice[]>)
            ).map(([category, prices]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={CATEGORY_INFO[category as keyof typeof CATEGORY_INFO].color}>
                      {CATEGORY_INFO[category as keyof typeof CATEGORY_INFO].label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prices.map((price) => (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{price.feature}</p>
                          <p className="text-sm text-muted-foreground">{price.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-500">
                              {price.tokenCost}
                            </p>
                            <p className="text-xs text-muted-foreground">tokens</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPrice(price);
                              setNewPrice({
                                feature: price.feature,
                                tokenCost: price.tokenCost,
                                category: price.category,
                                description: price.description,
                              });
                              setPriceDialog("edit");
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="purchase">Achats</SelectItem>
                <SelectItem value="consume">Consommation</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
                <SelectItem value="refund">Remboursement</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Utilisateur
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Type
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Fonctionnalité
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Montant
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{tx.userName}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn(
                          tx.type === "purchase" ? "bg-green-500/10 text-green-500" :
                          tx.type === "consume" ? "bg-red-500/10 text-red-500" :
                          tx.type === "bonus" ? "bg-purple-500/10 text-purple-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          {tx.type === "purchase" ? "Achat" :
                           tx.type === "consume" ? "Consommation" :
                           tx.type === "bonus" ? "Bonus" : "Remboursement"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{tx.feature}</td>
                      <td className={cn(
                        "px-4 py-3 text-right font-bold",
                        tx.amount > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {tx.amount > 0 ? "+" : ""}{formatNumber(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Campaign Dialog */}
      <Dialog open={!!campaignDialog} onOpenChange={() => setCampaignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {campaignDialog === "create" ? "Nouvelle campagne bonus" : "Modifier la campagne"}
            </DialogTitle>
            <DialogDescription>
              Configurez les paramètres de la campagne de bonus tokens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom de la campagne</Label>
              <Input
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="Ex: Bonus Inscription"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={newCampaign.type}
                  onValueChange={(v) => setNewCampaign({ ...newCampaign, type: v as BonusCampaign["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signup">Inscription</SelectItem>
                    <SelectItem value="referral">Parrainage</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                    <SelectItem value="loyalty">Fidélité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tokens offerts</Label>
                <Input
                  type="number"
                  value={newCampaign.tokenAmount}
                  onChange={(e) => setNewCampaign({ ...newCampaign, tokenAmount: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={newCampaign.startDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Date de fin (optionnel)</Label>
                <Input
                  type="date"
                  value={newCampaign.endDate}
                  onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Conditions</Label>
              <Input
                value={newCampaign.conditions}
                onChange={(e) => setNewCampaign({ ...newCampaign, conditions: e.target.value })}
                placeholder="Conditions d'éligibilité"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignDialog(null)}>
              Annuler
            </Button>
            <Button onClick={handleCreateCampaign}>
              {campaignDialog === "create" ? "Créer" : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={!!priceDialog} onOpenChange={() => setPriceDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {priceDialog === "create" ? "Nouvelle tarification" : "Modifier la tarification"}
            </DialogTitle>
            <DialogDescription>
              Définissez le coût en tokens pour cette fonctionnalité.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fonctionnalité</Label>
              <Input
                value={newPrice.feature}
                onChange={(e) => setNewPrice({ ...newPrice, feature: e.target.value })}
                placeholder="Nom de la fonctionnalité"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={newPrice.category}
                  onValueChange={(v) => setNewPrice({ ...newPrice, category: v as TokenPrice["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">IA</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="integration">Intégration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Coût (tokens)</Label>
                <Input
                  type="number"
                  value={newPrice.tokenCost}
                  onChange={(e) => setNewPrice({ ...newPrice, tokenCost: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newPrice.description}
                onChange={(e) => setNewPrice({ ...newPrice, description: e.target.value })}
                placeholder="Description de la fonctionnalité"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPriceDialog(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdatePrice}>
              {priceDialog === "create" ? "Créer" : "Sauvegarder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
