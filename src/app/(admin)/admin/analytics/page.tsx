"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
}

interface CohortData {
  period: string;
  users: number;
  retention: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    month2: number;
    month3: number;
  };
}

interface FunnelStep {
  name: string;
  users: number;
  conversion: number;
  dropoff: number;
}

interface ReportConfig {
  id: string;
  name: string;
  type: "kpi" | "funnel" | "cohort" | "custom";
  schedule: "daily" | "weekly" | "monthly" | "manual";
  lastRun: string;
  recipients: string[];
}

// Mock Data
const mockMetrics: MetricCard[] = [
  { label: "Utilisateurs Actifs", value: "3,456", change: 12.5, icon: Users, color: "text-blue-500" },
  { label: "Devis Créés", value: "12,890", change: 8.3, icon: FileText, color: "text-green-500" },
  { label: "Taux de Conversion", value: "34.2%", change: 2.1, icon: Target, color: "text-purple-500" },
  { label: "Revenu Mensuel", value: "45,230€", change: 15.7, icon: DollarSign, color: "text-amber-500" },
];

const mockCohorts: CohortData[] = [
  { period: "Jan 2024", users: 450, retention: { week1: 85, week2: 72, week3: 65, week4: 58, month2: 45, month3: 38 } },
  { period: "Fév 2024", users: 520, retention: { week1: 88, week2: 75, week3: 68, week4: 62, month2: 48, month3: 41 } },
  { period: "Mar 2024", users: 610, retention: { week1: 86, week2: 74, week3: 67, week4: 60, month2: 46, month3: 39 } },
  { period: "Avr 2024", users: 580, retention: { week1: 90, week2: 78, week3: 71, week4: 65, month2: 52, month3: 0 } },
  { period: "Mai 2024", users: 720, retention: { week1: 87, week2: 76, week3: 69, week4: 63, month2: 0, month3: 0 } },
  { period: "Jun 2024", users: 850, retention: { week1: 89, week2: 77, week3: 0, week4: 0, month2: 0, month3: 0 } },
];

const mockFunnel: FunnelStep[] = [
  { name: "Visite Landing", users: 10000, conversion: 100, dropoff: 0 },
  { name: "Inscription", users: 3500, conversion: 35, dropoff: 65 },
  { name: "Profil Complété", users: 2800, conversion: 80, dropoff: 20 },
  { name: "1er Devis Créé", users: 1960, conversion: 70, dropoff: 30 },
  { name: "1er Devis Envoyé", users: 1470, conversion: 75, dropoff: 25 },
  { name: "1er Devis Signé", users: 735, conversion: 50, dropoff: 50 },
  { name: "Abonnement Payant", users: 368, conversion: 50, dropoff: 50 },
];

const mockReports: ReportConfig[] = [
  { id: "1", name: "KPIs Hebdomadaires", type: "kpi", schedule: "weekly", lastRun: "2024-06-14", recipients: ["team@deal.com"] },
  { id: "2", name: "Funnel Acquisition", type: "funnel", schedule: "daily", lastRun: "2024-06-15", recipients: ["marketing@deal.com"] },
  { id: "3", name: "Cohortes Mensuelles", type: "cohort", schedule: "monthly", lastRun: "2024-06-01", recipients: ["product@deal.com"] },
  { id: "4", name: "Rapport Investisseurs", type: "custom", schedule: "monthly", lastRun: "2024-06-01", recipients: ["ceo@deal.com"] },
];

const mockDailyStats = [
  { day: "Lun", users: 234, quotes: 456, revenue: 1230 },
  { day: "Mar", users: 256, quotes: 489, revenue: 1450 },
  { day: "Mer", users: 278, quotes: 512, revenue: 1670 },
  { day: "Jeu", users: 245, quotes: 478, revenue: 1340 },
  { day: "Ven", users: 289, quotes: 534, revenue: 1780 },
  { day: "Sam", users: 156, quotes: 234, revenue: 890 },
  { day: "Dim", users: 123, quotes: 189, revenue: 670 },
];

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  const getRetentionColor = (value: number) => {
    if (value >= 70) return "bg-green-500/80";
    if (value >= 50) return "bg-yellow-500/80";
    if (value >= 30) return "bg-orange-500/80";
    if (value > 0) return "bg-red-500/80";
    return "bg-gray-300/30";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Analytics & Rapports
          </h1>
          <p className="text-muted-foreground">
            Analysez les performances et le comportement utilisateur
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="12m">12 mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="cohorts">Cohortes</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className={cn("text-2xl font-bold", metric.color)}>
                            {metric.value}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Icon className={cn("h-5 w-5", metric.color)} />
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            metric.change > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {metric.change > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {Math.abs(metric.change)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Weekly Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Activité de la Semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDailyStats.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-4">
                    <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.users / 300) * 100}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm w-12">{day.users}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.quotes / 600) * 100}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm w-12">{day.quotes}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-amber-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.revenue / 2000) * 100}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm w-16">{day.revenue}€</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <span className="w-8"></span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-muted-foreground">Utilisateurs</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-muted-foreground">Devis</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-muted-foreground">Revenu</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-sm text-muted-foreground">Taux d'activation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.2 min</p>
                    <p className="text-sm text-muted-foreground">Temps moyen création devis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">92%</p>
                    <p className="text-sm text-muted-foreground">Satisfaction utilisateur</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analyse de Rétention par Cohorte</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    &gt;70% Excellent
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    50-70% Bon
                  </Badge>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    &lt;50% À améliorer
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cohorte</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Users</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">S1</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">S2</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">S3</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">S4</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">M2</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">M3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCohorts.map((cohort) => (
                      <tr key={cohort.period} className="border-b hover:bg-muted/30">
                        <td className="py-3 px-2 font-medium">{cohort.period}</td>
                        <td className="py-3 px-2 text-center text-sm">{formatNumber(cohort.users)}</td>
                        {Object.values(cohort.retention).map((value, idx) => (
                          <td key={idx} className="py-3 px-2">
                            <div
                              className={cn(
                                "mx-auto w-12 h-8 rounded flex items-center justify-center text-sm font-medium text-white",
                                getRetentionColor(value)
                              )}
                            >
                              {value > 0 ? `${value}%` : "-"}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cohort Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tendances Clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Rétention S1 en hausse</p>
                    <p className="text-sm text-muted-foreground">
                      +3% vs trimestre précédent
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Drop significatif S4 → M2</p>
                    <p className="text-sm text-muted-foreground">
                      ~15% de perte, optimiser l'engagement mois 2
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Cohortes récentes performantes</p>
                    <p className="text-sm text-muted-foreground">
                      Mai et Juin surpassent les objectifs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions Recommandées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Email réengagement M2</span>
                    <Badge variant="outline">Priorité haute</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cibler les utilisateurs inactifs après 4 semaines
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Onboarding amélioré</span>
                    <Badge variant="outline">En cours</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nouveaux tutoriels interactifs pour S1
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Funnel de Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockFunnel.map((step, index) => {
                  const width = (step.users / mockFunnel[0].users) * 100;
                  const isLast = index === mockFunnel.length - 1;
                  return (
                    <motion.div
                      key={step.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-40 text-sm font-medium">{step.name}</div>
                        <div className="flex-1 relative">
                          <div className="h-10 bg-muted rounded-lg overflow-hidden">
                            <motion.div
                              className={cn(
                                "h-full rounded-lg flex items-center justify-end pr-3",
                                index === 0 ? "bg-blue-500" :
                                index === mockFunnel.length - 1 ? "bg-green-500" :
                                "bg-blue-400"
                              )}
                              initial={{ width: 0 }}
                              animate={{ width: `${width}%` }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                              <span className="text-sm font-bold text-white">
                                {formatNumber(step.users)}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                        <div className="w-20 text-right">
                          <span className={cn(
                            "text-sm font-medium",
                            step.conversion >= 70 ? "text-green-500" :
                            step.conversion >= 50 ? "text-yellow-500" : "text-red-500"
                          )}>
                            {step.conversion}%
                          </span>
                        </div>
                        {!isLast && (
                          <div className="w-20 text-right text-sm text-muted-foreground">
                            -{step.dropoff}%
                          </div>
                        )}
                      </div>
                      {!isLast && (
                        <div className="flex items-center gap-4 ml-40 py-1">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Funnel Summary */}
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-500">35%</p>
                    <p className="text-sm text-muted-foreground">Visite → Inscription</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500">21%</p>
                    <p className="text-sm text-muted-foreground">Inscription → 1er Devis Signé</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">3.7%</p>
                    <p className="text-sm text-muted-foreground">Visite → Abonnement</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funnel Optimization */}
          <Card>
            <CardHeader>
              <CardTitle>Points de Friction Identifiés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Visite → Inscription (65% drop)</p>
                      <p className="text-sm text-muted-foreground">
                        Landing page à optimiser, CTA peu visible
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir détails
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">1er Devis Signé → Abonnement (50% drop)</p>
                      <p className="text-sm text-muted-foreground">
                        Proposition de valeur premium à clarifier
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir détails
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Rapports Configurés</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau rapport
            </Button>
          </div>

          <div className="grid gap-4">
            {mockReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        report.type === "kpi" ? "bg-blue-500/10 text-blue-500" :
                        report.type === "funnel" ? "bg-purple-500/10 text-purple-500" :
                        report.type === "cohort" ? "bg-green-500/10 text-green-500" :
                        "bg-amber-500/10 text-amber-500"
                      )}>
                        <BarChart3 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{report.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="capitalize">
                            {report.schedule === "daily" ? "Quotidien" :
                             report.schedule === "weekly" ? "Hebdomadaire" :
                             report.schedule === "monthly" ? "Mensuel" : "Manuel"}
                          </Badge>
                          <span>•</span>
                          <span>Dernier envoi: {new Date(report.lastRun).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Aperçu
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
