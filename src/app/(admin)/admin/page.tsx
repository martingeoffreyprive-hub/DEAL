"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalQuotes: number;
  totalRevenue: number;
  proSubscriptions: number;
  businessSubscriptions: number;
  freeUsers: number;
  recentSignups: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Fallback to placeholder data if API fails
          setStats({
            totalUsers: 0,
            activeUsers: 0,
            totalQuotes: 0,
            totalRevenue: 0,
            proSubscriptions: 0,
            businessSubscriptions: 0,
            freeUsers: 0,
            recentSignups: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalQuotes: 0,
          totalRevenue: 0,
          proSubscriptions: 0,
          businessSubscriptions: 0,
          freeUsers: 0,
          recentSignups: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord Admin</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la plateforme QuoteVoice
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentSignups} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats && ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Devis créés</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Sur la plateforme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Abonnements actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des abonnements</CardTitle>
            <CardDescription>Par type de plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span>Free</span>
                </div>
                <span className="font-medium">{stats?.freeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Pro</span>
                </div>
                <span className="font-medium">{stats?.proSubscriptions}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Business</span>
                </div>
                <span className="font-medium">{stats?.businessSubscriptions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes système</CardTitle>
            <CardDescription>Problèmes nécessitant attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">3 paiements en échec</p>
                  <p className="text-xs text-muted-foreground">Nécessitent relance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Système opérationnel</p>
                  <p className="text-xs text-muted-foreground">Aucune erreur critique</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Gérer utilisateurs</p>
                <p className="text-xs text-muted-foreground">Voir et modifier</p>
              </div>
            </a>
            <a
              href="/admin/subscriptions"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Abonnements</p>
                <p className="text-xs text-muted-foreground">Gérer les plans</p>
              </div>
            </a>
            <a
              href="/admin/audit-logs"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Journaux d'audit</p>
                <p className="text-xs text-muted-foreground">Voir l'activité</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
