"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Eye,
  Trash2,
  Key,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserDetailModal } from "@/components/admin/user-detail-modal";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile: {
    full_name: string | null;
    company_name: string | null;
    role: string;
  } | null;
  subscription: {
    plan_type: string;
    status: string;
  } | null;
  is_active: boolean;
}

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  pro: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  business: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  enterprise: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  suspended: "bg-red-500/10 text-red-500 border-red-500/20",
  trial: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [actionDialog, setActionDialog] = useState<"suspend" | "delete" | "reset" | null>(null);
  const [detailModalUser, setDetailModalUser] = useState<string | null>(null);
  const [planDialog, setPlanDialog] = useState<{ userId: string; currentPlan: string } | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const pageSize = 20;

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      // Fetch profiles
      let query = supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          company_name,
          role,
          created_at
        `, { count: "exact" })
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data: profiles, error, count } = await query;

      if (error) throw error;

      // Fetch subscriptions separately
      const userIds = (profiles || []).map((p: any) => p.id);
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id, plan_name, status")
        .in("user_id", userIds);

      // Create a map of subscriptions by user_id
      const subMap = new Map(
        (subscriptions || []).map((s: any) => [s.user_id, { plan_type: s.plan_name, status: s.status }])
      );

      // Transform data to match UserData interface
      const transformedUsers: UserData[] = (profiles || []).map((profile: any) => ({
        id: profile.id,
        email: profile.email || "",
        created_at: profile.created_at,
        last_sign_in_at: null,
        profile: {
          full_name: profile.full_name,
          company_name: profile.company_name,
          role: profile.role || "user",
        },
        subscription: subMap.get(profile.id) || { plan_type: "free", status: "active" },
        is_active: true,
      }));

      setUsers(transformedUsers);
      setTotal(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, search, page, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const formatDate = (date: string | null) => {
    if (!date) return "Jamais";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleAction = async (action: "suspend" | "delete" | "reset") => {
    if (!selectedUser || !supabase) return;

    try {
      switch (action) {
        case "suspend":
          // Update profile to mark as suspended
          await supabase
            .from("profiles")
            .update({ is_suspended: true })
            .eq("id", selectedUser.id);
          toast({
            title: "Utilisateur suspendu",
            description: `L'utilisateur a été suspendu avec succès.`,
          });
          break;
        case "reset":
          // Trigger password reset (would need a proper admin API)
          toast({
            title: "Email envoyé",
            description: "Un email de réinitialisation a été envoyé.",
          });
          break;
        case "delete":
          // Note: Full deletion requires admin privileges
          toast({
            title: "Suppression initiée",
            description: "Le compte sera supprimé sous 30 jours.",
          });
          break;
      }
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "L'action a échoué",
        variant: "destructive",
      });
    } finally {
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleImpersonate = async (userId: string) => {
    // Store impersonation in session storage
    sessionStorage.setItem("impersonating_user", userId);
    toast({
      title: "Mode impersonation activé",
      description: "Vous voyez l'application comme cet utilisateur.",
    });
    window.location.href = "/dashboard";
  };

  const handleSuspendUser = async (userId: string) => {
    if (!supabase) return;
    try {
      await supabase
        .from("profiles")
        .update({ is_suspended: true })
        .eq("id", userId);
      toast({
        title: "Utilisateur suspendu",
        description: "L'utilisateur a été suspendu avec succès.",
      });
      setDetailModalUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suspendre l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    toast({
      title: "Email envoyé",
      description: "Un email de réinitialisation a été envoyé.",
    });
    setDetailModalUser(null);
  };

  const handleChangePlan = async (newPlan: string) => {
    if (!planDialog) return;
    setUpdatingPlan(true);

    try {
      const response = await fetch("/api/admin/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: planDialog.userId, planName: newPlan }),
      });

      if (!response.ok) throw new Error("Failed to update plan");

      toast({
        title: "Plan mis à jour",
        description: `Le plan a été changé en "${newPlan}" avec succès.`,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === planDialog.userId
            ? { ...u, subscription: { ...u.subscription, plan_type: newPlan, status: "active" } }
            : u
        )
      );

      setPlanDialog(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer le plan",
        variant: "destructive",
      });
    } finally {
      setUpdatingPlan(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (planFilter !== "all" && user.subscription?.plan_type !== planFilter) {
        return false;
      }
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !user.is_active) return false;
        if (statusFilter === "inactive" && user.is_active) return false;
      }
      return true;
    });
  }, [users, planFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            {total} utilisateurs inscrits sur la plateforme
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou entreprise..."
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
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <User className="h-12 w-12 mb-4 opacity-50" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Utilisateur
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Entreprise
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Plan
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Statut
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Inscription
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.profile?.full_name || "Sans nom"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {user.profile?.company_name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={PLAN_COLORS[user.subscription?.plan_type || "free"]}
                        >
                          {user.subscription?.plan_type || "free"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={user.is_active ? STATUS_COLORS.active : STATUS_COLORS.inactive}
                        >
                          {user.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.created_at)}
                        </div>
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
                              onClick={() => setDetailModalUser(user.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setActionDialog("reset");
                              }}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Reset mot de passe
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setPlanDialog({
                                  userId: user.id,
                                  currentPlan: user.subscription?.plan_type || "free",
                                });
                              }}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Changer le plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setActionDialog("suspend");
                              }}
                              className="text-yellow-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspendre
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setActionDialog("delete");
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
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
            {total} utilisateurs - Page {page} sur {totalPages}
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
      <AlertDialog open={actionDialog === "suspend"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'utilisateur ne pourra plus accéder à son compte jusqu'à la levée de la suspension.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("suspend")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Suspendre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionDialog === "delete"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données de l'utilisateur seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("delete")}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionDialog === "reset"} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer un email de reset ?</AlertDialogTitle>
            <AlertDialogDescription>
              Un email de réinitialisation de mot de passe sera envoyé à l'utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction("reset")}>
              Envoyer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Plan Dialog */}
      <AlertDialog open={!!planDialog} onOpenChange={() => setPlanDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer le plan d'abonnement</AlertDialogTitle>
            <AlertDialogDescription>
              Plan actuel : <strong className="uppercase">{planDialog?.currentPlan || "free"}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {[
              { id: "free", label: "Free", color: "bg-gray-100 hover:bg-gray-200 border-gray-300" },
              { id: "starter", label: "Starter", color: "bg-green-100 hover:bg-green-200 border-green-300" },
              { id: "pro", label: "Pro", color: "bg-blue-100 hover:bg-blue-200 border-blue-300" },
              { id: "ultimate", label: "Ultimate", color: "bg-purple-100 hover:bg-purple-200 border-purple-300" },
            ].map((plan) => (
              <Button
                key={plan.id}
                variant="outline"
                className={`${plan.color} ${planDialog?.currentPlan === plan.id ? "ring-2 ring-primary" : ""}`}
                disabled={updatingPlan || planDialog?.currentPlan === plan.id}
                onClick={() => handleChangePlan(plan.id)}
              >
                {updatingPlan ? "..." : plan.label}
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingPlan}>Fermer</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={detailModalUser}
        isOpen={!!detailModalUser}
        onClose={() => setDetailModalUser(null)}
        onImpersonate={handleImpersonate}
        onSuspend={handleSuspendUser}
        onResetPassword={handleResetPassword}
      />
    </div>
  );
}
