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
import { createBrowserClient } from "@supabase/ssr";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  Settings,
  Key,
  Building2,
} from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-500/10 text-green-500 border-green-500/20",
  READ: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  UPDATE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
  LOGIN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  LOGOUT: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  EXPORT: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  API_CALL: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

const RESOURCE_ICONS: Record<string, any> = {
  quote: FileText,
  profile: User,
  settings: Settings,
  api_key: Key,
  organization: Building2,
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Create Supabase client lazily to avoid SSR issues
  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (actionFilter !== "all") {
      query = query.eq("action", actionFilter);
    }

    if (resourceFilter !== "all") {
      query = query.eq("resource_type", resourceFilter);
    }

    if (search) {
      query = query.or(`user_email.ilike.%${search}%,ip_address.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data, error, count } = await query;

    if (!error) {
      setLogs(data || []);
      setTotal(count || 0);
    }

    setLoading(false);
  }, [supabase, actionFilter, resourceFilter, search, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journaux d'audit</h1>
          <p className="text-muted-foreground">
            Historique de toutes les actions sur la plateforme
          </p>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="sm">
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
                  placeholder="Rechercher par email ou IP..."
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
              value={actionFilter}
              onValueChange={(v) => {
                setActionFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes actions</SelectItem>
                <SelectItem value="CREATE">Création</SelectItem>
                <SelectItem value="READ">Lecture</SelectItem>
                <SelectItem value="UPDATE">Mise à jour</SelectItem>
                <SelectItem value="DELETE">Suppression</SelectItem>
                <SelectItem value="LOGIN">Connexion</SelectItem>
                <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                <SelectItem value="API_CALL">Appel API</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={resourceFilter}
              onValueChange={(v) => {
                setResourceFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Ressource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes ressources</SelectItem>
                <SelectItem value="quote">Devis</SelectItem>
                <SelectItem value="profile">Profil</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
                <SelectItem value="api_key">Clé API</SelectItem>
                <SelectItem value="organization">Organisation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="spinner" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>Aucun log trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Utilisateur
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Action
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Ressource
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      IP
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Détails
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const ResourceIcon = RESOURCE_ICONS[log.resource_type] || FileText;
                    return (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{log.user_email || "Système"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={ACTION_COLORS[log.action] || ""}
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ResourceIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{log.resource_type}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                          {log.ip_address || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {JSON.stringify(log.details).slice(0, 50)}
                              {JSON.stringify(log.details).length > 50 && "..."}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
            {total} résultats - Page {page} sur {totalPages}
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
    </div>
  );
}
