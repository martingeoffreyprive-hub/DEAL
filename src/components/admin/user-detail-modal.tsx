"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Activity,
  Shield,
  Key,
  Ban,
  UserX,
  LogIn,
  ExternalLink,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  vat_number: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  onboarding_completed: boolean;
}

interface UserSubscription {
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface UserStats {
  totalQuotes: number;
  quotesThisMonth: number;
  acceptedQuotes: number;
  totalRevenue: number;
}

interface UserActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onImpersonate?: (userId: string) => void;
  onSuspend?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
}

export function UserDetailModal({
  userId,
  isOpen,
  onClose,
  onImpersonate,
  onSuspend,
  onResetPassword,
}: UserDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    if (userId && isOpen) {
      loadUserData();
    }
  }, [userId, isOpen]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));

      setProfile({
        id: userId!,
        email: "user@example.com",
        full_name: "Jean Dupont",
        company_name: "Dupont SARL",
        phone: "+33 6 12 34 56 78",
        address: "15 rue des Lilas",
        city: "Paris",
        postal_code: "75001",
        vat_number: "FR12345678901",
        role: "user",
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        onboarding_completed: true,
      });

      setSubscription({
        plan_type: "pro",
        status: "active",
        current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false,
      });

      setStats({
        totalQuotes: 47,
        quotesThisMonth: 12,
        acceptedQuotes: 18,
        totalRevenue: 45600,
      });

      setActivities([
        { id: "1", action: "Devis créé", details: "Devis #D-2026-047", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: "2", action: "Devis accepté", details: "Devis #D-2026-045", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { id: "3", action: "Connexion", details: "Depuis Paris, France", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
        { id: "4", action: "Profil mis à jour", details: "Numéro de TVA ajouté", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      ]);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "business": return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "enterprise": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Détail utilisateur</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner" />
          </div>
        ) : profile ? (
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl bg-[#E85A5A] text-white">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold">{profile.full_name || "Sans nom"}</h2>
                  {profile.role === "admin" && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{profile.company_name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </span>
                  {profile.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {subscription && (
                  <Badge variant="outline" className={getPlanColor(subscription.plan_type)}>
                    Plan {subscription.plan_type}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onImpersonate?.(profile.id)}
                className="gap-2"
              >
                <LogIn className="w-4 h-4" />
                Se connecter en tant que
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResetPassword?.(profile.id)}
                className="gap-2"
              >
                <Key className="w-4 h-4" />
                Reset mot de passe
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuspend?.(profile.id)}
                className="gap-2 text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
              >
                <Ban className="w-4 h-4" />
                Suspendre
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="subscription">Abonnement</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="info">Informations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={FileText}
                    label="Devis total"
                    value={stats?.totalQuotes || 0}
                    color="coral"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Ce mois"
                    value={stats?.quotesThisMonth || 0}
                    color="blue"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Acceptés"
                    value={stats?.acceptedQuotes || 0}
                    color="green"
                  />
                  <StatCard
                    icon={CreditCard}
                    label="CA généré"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    color="purple"
                  />
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Activité récente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activities.slice(0, 4).map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-2 h-2 rounded-full bg-[#E85A5A]" />
                          <div className="flex-1">
                            <span className="font-medium">{activity.action}</span>
                            <span className="text-muted-foreground ml-2">{activity.details}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(activity.timestamp)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="mt-4 space-y-4">
                {subscription && (
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Plan actuel</p>
                          <p className="text-2xl font-bold capitalize">{subscription.plan_type}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={subscription.status === "active"
                            ? "bg-green-500/10 text-green-500 border-green-500/30"
                            : "bg-red-500/10 text-red-500 border-red-500/30"
                          }
                        >
                          {subscription.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Début période</p>
                          <p className="font-medium">{formatDate(subscription.current_period_start)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fin période</p>
                          <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                        </div>
                      </div>

                      {subscription.cancel_at_period_end && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Annulation prévue à la fin de la période</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {activities.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-4 pb-4 border-b last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#E85A5A]/10 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-4 h-4 text-[#E85A5A]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(activity.timestamp)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="mt-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <InfoRow icon={User} label="Nom complet" value={profile.full_name} />
                    <InfoRow icon={Building} label="Entreprise" value={profile.company_name} />
                    <InfoRow icon={Mail} label="Email" value={profile.email} />
                    <InfoRow icon={Phone} label="Téléphone" value={profile.phone} />
                    <InfoRow icon={MapPin} label="Adresse" value={profile.address ? `${profile.address}, ${profile.postal_code} ${profile.city}` : null} />
                    <InfoRow icon={CreditCard} label="N° TVA" value={profile.vat_number} />
                    <InfoRow icon={Calendar} label="Inscription" value={formatDate(profile.created_at)} />
                    <InfoRow icon={Clock} label="Dernière connexion" value={profile.last_sign_in_at ? formatDateTime(profile.last_sign_in_at) : "Jamais"} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Utilisateur non trouvé
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "coral" | "blue" | "green" | "purple";
}) {
  const colorStyles = {
    coral: "bg-[#E85A5A]/10 text-[#E85A5A]",
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorStyles[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-4 py-2 border-b last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-muted-foreground w-32">{label}</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}
