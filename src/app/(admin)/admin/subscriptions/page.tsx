"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  plan_name: string;
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
    email: string | null;
  } | null;
}

interface SubscriptionStats {
  totalMRR: number;
  activeSubscriptions: number;
}

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  pro: 29,
  business: 99,
  corporate: 299,
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
  corporate: "Corporate",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  pro: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  business: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  corporate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
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

const ALL_PLANS = ["free", "pro", "business", "corporate"];

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
  const [actionDialog, setActionDialog] = useState<"cancel" | "change-plan" | "remind" | null>(null);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const pageSize = 20;

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (planFilter !== "all") params.set("plan", planFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/admin/subscriptions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setSubscriptions(data.subscriptions || []);
      setTotal(data.total || 0);
      setStats(data.stats || null);
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
  }, [planFilter, statusFilter, page, toast]);

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

  const getPlanName = (sub: Subscription) => sub.plan_name || sub.plan_type || "free";

  const handleChangePlan = async () => {
    if (!selectedSub || !selectedNewPlan) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedSub.user_id,
          planName: selectedNewPlan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      toast({
        title: "Plan modifié",
        description: `Plan changé vers ${PLAN_LABELS[selectedNewPlan] || selectedNewPlan}`,
      });
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le plan",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setActionDialog(null);
      setSelectedSub(null);
      setSelectedNewPlan("");
    }
  };

  const handleCancel = async () => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      // Set plan to free = cancel
      const res = await fetch("/api/admin/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedSub.user_id,
          planName: "free",
        }),
      });
      if (!res.ok) throw new Error("Failed");

      toast({
        title: "Abonnement annulé",
        description: "L'utilisateur est maintenant sur le plan Free.",
      });
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'abonnement",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
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
            Suivi et gestion des abonnements
          </p>
        </div>
        <Button onClick={fetchSubscriptions} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
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
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
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
                    const plan = getPlanName(sub);
                    const StatusIcon = STATUS_ICONS[sub.status] || CheckCircle;
                    return (
                      <tr key={sub.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">
                              {sub.profile?.full_name || "Sans nom"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sub.profile?.company_name || sub.profile?.email || sub.user_id.slice(0, 8)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={PLAN_COLORS[plan] || PLAN_COLORS.free}
                          >
                            {PLAN_LABELS[plan] || plan}
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
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(sub.current_period_start)} - {formatDate(sub.current_period_end)}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(PLAN_PRICES[plan] || 0)}/mois
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
                                  setSelectedNewPlan("");
                                  setActionDialog("change-plan");
                                }}
                              >
                                <ArrowUp className="h-4 w-4 mr-2" />
                                Changer de plan
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
                                Annuler (passer en Free)
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

      {/* Change Plan Dialog */}
      <AlertDialog open={actionDialog === "change-plan"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le plan</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedSub && (
                <>
                  Utilisateur : <strong>{selectedSub.profile?.full_name || selectedSub.profile?.email || selectedSub.user_id.slice(0, 8)}</strong>
                  <br />
                  Plan actuel : <strong>{PLAN_LABELS[getPlanName(selectedSub)] || getPlanName(selectedSub)}</strong>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {ALL_PLANS.map((plan) => (
              <Button
                key={plan}
                variant={selectedNewPlan === plan ? "default" : "outline"}
                className="justify-start"
                disabled={selectedSub ? getPlanName(selectedSub) === plan : false}
                onClick={() => setSelectedNewPlan(plan)}
              >
                <span className="font-semibold">{PLAN_LABELS[plan]}</span>
                <span className="ml-auto text-xs opacity-70">
                  {PLAN_PRICES[plan]}€/mois
                </span>
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangePlan}
              disabled={!selectedNewPlan || actionLoading}
            >
              {actionLoading ? "Modification..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={actionDialog === "cancel"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cet abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'utilisateur sera rétrogradé au plan Free immédiatement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Conserver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Annulation..." : "Annuler l'abonnement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remind Dialog */}
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
            <AlertDialogAction onClick={() => {
              toast({ title: "Rappel envoyé", description: "Email de rappel envoyé." });
              setActionDialog(null);
              setSelectedSub(null);
            }}>
              Envoyer le rappel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
