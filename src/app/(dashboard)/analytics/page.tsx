"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Euro,
  CheckCircle,
  Clock,
  Users,
  Target,
} from "lucide-react";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  cardHover,
} from "@/components/animations/page-transition";
import { createBrowserClient } from "@supabase/ssr";
import { SECTORS, type SectorType } from "@/types/database";
import { DealIconD, DealLoadingSpinner } from "@/components/brand";

// DEAL Brand Chart Colors
const COLORS = {
  primary: "#1E3A5F",    // DEAL Navy
  secondary: "#2D4A6F",  // DEAL Navy Light
  gold: "#C9A962",       // DEAL Gold
  goldLight: "#D4B872",  // DEAL Gold Light
  success: "#10B981",    // Emerald
  warning: "#F59E0B",    // Amber
  danger: "#EF4444",     // Red
  info: "#0EA5E9",       // Sky
  muted: "#64748B",      // Slate
};

const PIE_COLORS = [
  COLORS.gold,
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.info,
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

type Period = "week" | "month" | "quarter" | "year";

interface Quote {
  id: string;
  status: string;
  sector: string;
  total: number;
  created_at: string;
}

interface Analytics {
  totalRevenue: number;
  totalQuotes: number;
  acceptedQuotes: number;
  pendingQuotes: number;
  conversionRate: number;
  avgQuoteValue: number;
  revenueChange: number;
  quotesChange: number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch quotes data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "quarter":
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const { data, error } = await supabase
        .from("quotes")
        .select("id, status, sector, total, created_at")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (!error && data) {
        setQuotes(data);
      }

      setLoading(false);
    }

    fetchData();
  }, [period, supabase]);

  // Calculate analytics
  const analytics = useMemo<Analytics>(() => {
    const accepted = quotes.filter((q) => q.status === "accepted" || q.status === "finalized");
    const pending = quotes.filter((q) => q.status === "sent" || q.status === "draft");

    const totalRevenue = accepted.reduce((sum, q) => sum + (q.total || 0), 0);
    const totalQuotes = quotes.length;
    const acceptedQuotes = accepted.length;
    const pendingQuotes = pending.length;
    const conversionRate = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;
    const avgQuoteValue = totalQuotes > 0 ? totalRevenue / acceptedQuotes || 0 : 0;

    return {
      totalRevenue,
      totalQuotes,
      acceptedQuotes,
      pendingQuotes,
      conversionRate,
      avgQuoteValue,
      revenueChange: 12.5, // Placeholder - would calculate from previous period
      quotesChange: 8.2,
    };
  }, [quotes]);

  // Revenue by day/week chart data
  const revenueChartData = useMemo(() => {
    const grouped: Record<string, number> = {};

    quotes
      .filter((q) => q.status === "accepted" || q.status === "finalized")
      .forEach((q) => {
        const date = new Date(q.created_at);
        let key: string;

        if (period === "week") {
          key = date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
        } else if (period === "month") {
          key = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        } else {
          key = date.toLocaleDateString("fr-FR", { month: "short" });
        }

        grouped[key] = (grouped[key] || 0) + (q.total || 0);
      });

    return Object.entries(grouped).map(([name, revenue]) => ({ name, revenue }));
  }, [quotes, period]);

  // Quotes by status chart data
  const statusChartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};

    quotes.forEach((q) => {
      statusCounts[q.status] = (statusCounts[q.status] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      draft: "Brouillon",
      sent: "Envoyé",
      accepted: "Accepté",
      rejected: "Refusé",
      finalized: "Finalisé",
      exported: "Exporté",
      archived: "Archivé",
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));
  }, [quotes]);

  // Sector breakdown chart data
  const sectorChartData = useMemo(() => {
    const sectorRevenue: Record<string, number> = {};

    quotes
      .filter((q) => q.status === "accepted" || q.status === "finalized")
      .forEach((q) => {
        const label = SECTORS[q.sector as SectorType] || q.sector;
        sectorRevenue[label] = (sectorRevenue[label] || 0) + (q.total || 0);
      });

    return Object.entries(sectorRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [quotes]);

  // Conversion funnel data
  const funnelData = useMemo(() => {
    const total = quotes.length;
    const sent = quotes.filter((q) => ["sent", "accepted", "rejected", "finalized"].includes(q.status)).length;
    const accepted = quotes.filter((q) => ["accepted", "finalized"].includes(q.status)).length;
    const finalized = quotes.filter((q) => q.status === "finalized").length;

    return [
      { name: "Devis créés", value: total, fill: COLORS.primary },
      { name: "Devis envoyés", value: sent, fill: COLORS.secondary },
      { name: "Devis acceptés", value: accepted, fill: COLORS.gold },
      { name: "Devis finalisés", value: finalized, fill: COLORS.goldLight },
    ];
  }, [quotes]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero Header with DEAL Branding */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#2D4A6F] to-[#0D1B2A] p-6 md:p-8"
        variants={staggerItem}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A962]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A962]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#C9A962]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Analytique
              </h1>
              <p className="text-white/70">
                Suivez vos performances et identifiez les opportunités
              </p>
            </div>
          </div>
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white hover:bg-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={staggerItem} {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#C9A962] to-[#D4B872]" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#1E3A5F]">Chiffre d'affaires</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#C9A962]/10 flex items-center justify-center">
                <Euro className="h-4 w-4 text-[#C9A962]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0D1B2A]">{formatCurrency(analytics.totalRevenue)}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {analytics.revenueChange > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">+{analytics.revenueChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{analytics.revenueChange}%</span>
                  </>
                )}
                <span>vs période précédente</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#1E3A5F] to-[#2D4A6F]" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#1E3A5F]">Devis créés</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-[#1E3A5F]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0D1B2A]">{analytics.totalQuotes}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {analytics.quotesChange > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">+{analytics.quotesChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">{analytics.quotesChange}%</span>
                  </>
                )}
                <span>vs période précédente</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#1E3A5F]">Taux de conversion</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0D1B2A]">{analytics.conversionRate.toFixed(1)}%</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{analytics.acceptedQuotes} acceptés sur {analytics.totalQuotes}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#C9A962] via-[#D4B872] to-[#C9A962]" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#1E3A5F]">Valeur moyenne</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-[#C9A962]/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-[#C9A962]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0D1B2A]">{formatCurrency(analytics.avgQuoteValue)}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>par devis accepté</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <motion.div className="grid gap-4 lg:grid-cols-2" variants={staggerItem}>
        {/* Revenue Chart */}
        <motion.div {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent border-b border-[#C9A962]/10">
              <div className="flex items-center gap-3">
                <DealIconD size="xs" variant="primary" />
                <div>
                  <CardTitle className="text-[#1E3A5F]">Évolution du chiffre d'affaires</CardTitle>
                  <CardDescription>Revenus des devis acceptés</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <DealLoadingSpinner size="md" />
                  </div>
                ) : revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `${value / 1000}k€`}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Revenus"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: `1px solid ${COLORS.gold}40`,
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.gold}
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Pas de données pour cette période
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent border-b border-[#C9A962]/10">
              <div className="flex items-center gap-3">
                <DealIconD size="xs" variant="primary" />
                <div>
                  <CardTitle className="text-[#1E3A5F]">Répartition par statut</CardTitle>
                  <CardDescription>Distribution des devis</CardDescription>
                </div>
              </div>
            </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <DealLoadingSpinner size="md" />
                </div>
              ) : statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    >
                      {statusChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, "Devis"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: `1px solid ${COLORS.gold}40`,
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Pas de données pour cette période
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div className="grid gap-4 lg:grid-cols-2" variants={staggerItem}>
        {/* Conversion Funnel */}
        <motion.div {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent border-b border-[#C9A962]/10">
              <div className="flex items-center gap-3">
                <DealIconD size="xs" variant="primary" />
                <div>
                  <CardTitle className="text-[#1E3A5F]">Entonnoir de conversion</CardTitle>
                  <CardDescription>Progression des devis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <DealLoadingSpinner size="md" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        formatter={(value: number) => [value, "Devis"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: `1px solid ${COLORS.gold}40`,
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sector Breakdown */}
        <motion.div {...cardHover}>
          <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent border-b border-[#C9A962]/10">
              <div className="flex items-center gap-3">
                <DealIconD size="xs" variant="primary" />
                <div>
                  <CardTitle className="text-[#1E3A5F]">Top secteurs</CardTitle>
                  <CardDescription>Revenus par secteur d'activité</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <DealLoadingSpinner size="md" />
                  </div>
                ) : sectorChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `${value / 1000}k€`}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), "Revenus"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: `1px solid ${COLORS.gold}40`,
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="revenue" fill={COLORS.gold} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Pas de données pour cette période
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1E3A5F] via-[#C9A962] to-[#1E3A5F]" />
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent border-b border-[#C9A962]/10">
            <div className="flex items-center gap-3">
              <DealIconD size="xs" variant="primary" />
              <CardTitle className="text-[#1E3A5F]">Résumé rapide</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#C9A962]/5 border border-[#C9A962]/20">
                <div className="p-3 rounded-xl bg-[#C9A962]/20">
                  <CheckCircle className="h-5 w-5 text-[#C9A962]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E3A5F]">Devis acceptés</p>
                  <p className="text-2xl font-bold text-[#0D1B2A]">{analytics.acceptedQuotes}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1E3A5F]/5 border border-[#1E3A5F]/20">
                <div className="p-3 rounded-xl bg-[#1E3A5F]/20">
                  <Clock className="h-5 w-5 text-[#1E3A5F]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E3A5F]">En attente</p>
                  <p className="text-2xl font-bold text-[#0D1B2A]">{analytics.pendingQuotes}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-[#C9A962]/10 to-[#1E3A5F]/10 border border-[#C9A962]/20">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#C9A962]/20 to-[#1E3A5F]/20">
                  <Euro className="h-5 w-5 text-[#C9A962]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1E3A5F]">Potentiel en attente</p>
                  <p className="text-2xl font-bold text-[#0D1B2A]">
                    {formatCurrency(
                      quotes
                        .filter((q) => q.status === "sent")
                        .reduce((sum, q) => sum + (q.total || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
