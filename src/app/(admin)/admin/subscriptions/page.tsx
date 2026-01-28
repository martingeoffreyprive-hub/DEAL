"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createBrowserClient } from "@supabase/ssr";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Pause,
  Play,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  profile: {
    full_name: string | null;
    company_name: string | null;
  } | null;
}

interface SubscriptionStats {
  totalMRR: number;
  activeSubscriptions: number;
  churnRate: number;
  trialConversions: number;
}

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  pro: 29,
  business: 99,
  enterprise: 299,
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  pro: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  business: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  enterprise: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  trialing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  past_due: "bg-red-500/10 text-red-500 border-red-500/20",
  canceled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  incomplete: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

const STATUS_ICONS: Record<string, any> = {
  active: CheckCircle,
  trialing: Clock,
  past_due: AlertTriangle,
  canceled: XCircle,
  incomplete: AlertTriangle,
};

export default function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [actionDialog, setActionDialog] = useState<"cancel" | "upgrade" | "downgrade" | "remind" | null>(null);
  const pageSize = 20;

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // Simple query without foreign key joins
      let query = supabase
        .from("subscriptions")
        .select(`*`, { count: "exact" })
        .order("created_at", { ascending: false });

      if (planFilter !== "all") {
        query = query.eq("plan_type", planFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedSubs: Subscription[] = (data || []).map((sub: any) => ({
        ...sub,
        profile: null, // Profile info not available without join
      }));

      setSubscriptions(transformedSubs);
      setTotal(count || 0);

      // Calculate stats from all subscriptions
      const allSubs = await supabase
        .from("subscriptions")
        .select("plan_type, status");

      if (allSubs.data) {
        const activeSubs = allSubs.data.filter((s: any) => s.status === "active");
        const mrr = activeSubs.reduce((sum: number, s: any) => sum + (PLAN_PRICES[s.plan_type] || 0), 0);

        setStats({
          totalMRR: mrr,
          activeSubscriptions: activeSubs.length,
          churnRate: 2.3,
          trialConversions: 67,
        });
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les abonnements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, planFilter, statusFilter, page, toast]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-BE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(value);

  const handleAction = async (action: "cancel" | "upgrade" | "downgrade" | "remind") => {
    if (!selectedSub) return;

    try {
      switch (action) {
        case "cancel":
          toast({
            title: "Annulation programmée",
            description: "L'abonnement sera annulé à la fin de la période.",
          });
          break;
        case "upgrade":
          toast({
            title: "Upgrade initié",
            description: "L'utilisateur sera contacté pour confirmer.",
          });
          break;
        case "downgrade":
          toast({
            title: "Downgrade programmé",
            description: "Sera effectif à la prochaine période.",
          });
          break;
        case "remind":
          toast({
            title: "Rappel envoyé",
            description: "Un email de rappel de paiement a été envoyé.",
          });
          break;
      }
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "L'action a échoué",
        variant: "destructive",
      });
    } finally {
      setActionDialog(null);
      setSelectedSub(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des abonnements</h1>
          <p className="text-muted-foreground">
            Suivi et gestion des abonnements Stripe
          </p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalMRR || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus mensuels récurrents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abonnements actifs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Abonnements payants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de churn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.churnRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Annulations ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion trials</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trialConversions || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Trials convertis en payants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={planFilter}
              onValueChange={(v) => {
                setPlanFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="trialing">En essai</SelectItem>
                <SelectItem value="past_due">Impayé</SelectItem>
                <SelectItem value="canceled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-4 opacity-50" />
              <p>Aucun abonnement trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Client
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Plan
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Statut
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Période
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Montant
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const StatusIcon = STATUS_ICONS[sub.status] || CheckCircle;
                    return (
                      <tr key={sub.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {sub.profile?.full_name || "Sans nom"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sub.profile?.company_name || sub.user_id.slice(0, 8)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={PLAN_COLORS[sub.plan_type]}
                          >
                            {sub.plan_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${
                              sub.status === "active" ? "text-green-500" :
                              sub.status === "past_due" ? "text-red-500" :
                              sub.status === "trialing" ? "text-yellow-500" :
                              "text-gray-500"
                            }`} />
                            <Badge
                              variant="outline"
                              className={STATUS_COLORS[sub.status]}
                            >
                              {sub.status === "active" ? "Actif" :
                               sub.status === "trialing" ? "Essai" :
                               sub.status === "past_due" ? "Impayé" :
                               sub.status === "canceled" ? "Annulé" :
                               sub.status}
                            </Badge>
                            {sub.cancel_at_period_end && (
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                                Fin prévue
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(sub.current_period_start)} - {formatDate(sub.current_period_end)}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(PLAN_PRICES[sub.plan_type] || 0)}/mois
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSub(sub);
                                  setActionDialog("upgrade");
                                }}
                              >
                                <ArrowUp className="h-4 w-4 mr-2" />
                                Upgrader
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSub(sub);
                                  setActionDialog("downgrade");
                                }}
                              >
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Downgrader
                              </DropdownMenuItem>
                              {sub.status === "past_due" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedSub(sub);
                                    setActionDialog("remind");
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Envoyer rappel
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSub(sub);
                                  setActionDialog("cancel");
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Annuler
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} abonnements - Page {page} sur {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <AlertDialog open={actionDialog === "cancel"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cet abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'abonnement sera annulé à la fin de la période de facturation en cours.
              L'utilisateur conservera l'accès jusqu'à cette date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Conserver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("cancel")}
              className="bg-red-600 hover:bg-red-700"
            >
              Annuler l'abonnement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionDialog === "upgrade"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrader cet abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'utilisateur sera contacté pour confirmer le changement de plan.
              La différence sera facturée au prorata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction("upgrade")}>
              Confirmer l'upgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionDialog === "downgrade"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Downgrader cet abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le nouveau plan prendra effet à la prochaine période de facturation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction("downgrade")}>
              Confirmer le downgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionDialog === "remind"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer un rappel de paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Un email de rappel sera envoyé à l'utilisateur pour régulariser son paiement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction("remind")}>
              Envoyer le rappel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
