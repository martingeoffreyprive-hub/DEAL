import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Bell,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Stats card component
function StatsCard({
  title,
  value,
  subValue,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  color: string;
}) {
  const colorStyles: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-500",
    coral: "bg-[#E85A5A]/10 text-[#E85A5A]",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorStyles[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  // Pour l'instant, données statiques - à remplacer par API
  const stats = {
    totalUsers: 156,
    activeUsers: 89,
    totalQuotes: 1247,
    totalRevenue: 4850,
    proSubscriptions: 23,
    businessSubscriptions: 8,
    freeUsers: 125,
    recentSignups: 12,
  };

  const alerts = [
    {
      id: "1",
      type: "warning" as const,
      title: "Paiements en échec",
      message: "3 utilisateurs ont des paiements en attente",
    },
    {
      id: "2",
      type: "info" as const,
      title: "Mise à jour système",
      message: "Maintenance prévue ce soir à 23h",
    },
    {
      id: "3",
      type: "success" as const,
      title: "Backup réussi",
      message: "Sauvegarde automatique effectuée",
    },
  ];

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "warning": return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "info": return "bg-blue-500/10 border-blue-500/20 text-blue-600";
      case "success": return "bg-green-500/10 border-green-500/20 text-green-600";
      default: return "bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la plateforme DEAL
        </p>
      </div>

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers}
          subValue={`${stats.activeUsers} actifs`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Devis créés"
          value={stats.totalQuotes}
          subValue="Ce mois"
          icon={FileText}
          color="coral"
        />
        <StatsCard
          title="Revenus MRR"
          value={`${stats.totalRevenue}€`}
          subValue="Abonnements actifs"
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Inscriptions récentes"
          value={stats.recentSignups}
          subValue="7 derniers jours"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Abonnements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm">Free</span>
              </div>
              <span className="font-bold">{stats.freeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">Pro</span>
              </div>
              <span className="font-bold">{stats.proSubscriptions}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm">Business</span>
              </div>
              <span className="font-bold">{stats.businessSubscriptions}</span>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertes système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertStyles(alert.type)}`}
              >
                {alert.type === "success" ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs opacity-80">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
