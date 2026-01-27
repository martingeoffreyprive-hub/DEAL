"use client";

/**
 * Leads Management Page
 * Gestion des prospects et demandes
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  MoreVertical,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  work_type?: string;
  description?: string;
  source: string;
  status: string;
  notes?: string;
  created_at: string;
  contacted_at?: string;
  converted_at?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: "Nouveau", color: "bg-blue-500", icon: AlertCircle },
  contacted: { label: "Contacté", color: "bg-yellow-500", icon: Phone },
  qualified: { label: "Qualifié", color: "bg-purple-500", icon: CheckCircle },
  converted: { label: "Converti", color: "bg-green-500", icon: FileText },
  lost: { label: "Perdu", color: "bg-gray-500", icon: XCircle },
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manuel",
  widget: "Widget",
  email: "Email",
  form: "Formulaire",
  chatbot: "Chatbot",
};

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/leads"
        : `/api/leads?status=${statusFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));

      toast({
        title: "Statut mis à jour",
        description: `Lead marqué comme "${STATUS_CONFIG[newStatus].label}"`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const createQuoteFromLead = async (lead: Lead) => {
    // TODO: Implement quote creation from lead
    toast({
      title: "Création du devis...",
      description: `Devis pour ${lead.name} en cours de création`,
    });
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.includes(query) ||
      lead.description?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length,
  };

  return (
    <>
      <div className="container max-w-6xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-[#C9A962]" />
                Leads & Prospects
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos demandes et prospects
              </p>
            </div>
            <Button className="gap-2 bg-[#1E3A5F]">
              <Plus className="h-4 w-4" />
              Nouveau lead
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.new}</p>
                    <p className="text-xs text-muted-foreground">Nouveaux</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.contacted}</p>
                    <p className="text-xs text-muted-foreground">Contactés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.converted}</p>
                    <p className="text-xs text-muted-foreground">Convertis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="new">Nouveaux</TabsTrigger>
                <TabsTrigger value="contacted">Contactés</TabsTrigger>
                <TabsTrigger value="qualified">Qualifiés</TabsTrigger>
                <TabsTrigger value="converted">Convertis</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Leads List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Aucun lead</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Aucun résultat pour cette recherche"
                    : "Les demandes de votre widget apparaîtront ici"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead, index) => {
                const statusConfig = STATUS_CONFIG[lead.status];
                const StatusIcon = statusConfig?.icon || AlertCircle;

                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="h-12 w-12 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center">
                            <span className="text-lg font-semibold text-[#1E3A5F]">
                              {lead.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{lead.name}</h3>
                              <Badge
                                className={`${statusConfig?.color} text-white`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig?.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {SOURCE_LABELS[lead.source] || lead.source}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {lead.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </span>
                              )}
                              {lead.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </span>
                              )}
                              {lead.work_type && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {lead.work_type}
                                </span>
                              )}
                            </div>
                            {lead.description && (
                              <p className="text-sm text-muted-foreground mt-1 truncate">
                                {lead.description}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(lead.created_at).toLocaleDateString("fr-BE")}
                            </p>
                            {lead.status === "new" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLeadStatus(lead.id, "contacted")}
                              >
                                Marquer contacté
                              </Button>
                            )}
                            {(lead.status === "contacted" || lead.status === "qualified") && (
                              <Button
                                size="sm"
                                className="bg-[#1E3A5F] gap-1"
                                onClick={() => createQuoteFromLead(lead)}
                              >
                                <FileText className="h-4 w-4" />
                                Créer devis
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedLead(lead);
                                setShowDetailDialog(true);
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Lead Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedLead?.name}</DialogTitle>
              <DialogDescription>
                Lead #{selectedLead?.id.slice(0, 8)}
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {selectedLead.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedLead.email}</p>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{selectedLead.phone}</p>
                    </div>
                  )}
                  {selectedLead.address && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Adresse</p>
                      <p className="font-medium">{selectedLead.address}</p>
                    </div>
                  )}
                  {selectedLead.work_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Type de travaux</p>
                      <p className="font-medium">{selectedLead.work_type}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p className="font-medium">{SOURCE_LABELS[selectedLead.source]}</p>
                  </div>
                </div>

                {selectedLead.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedLead.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateLeadStatus(selectedLead.id, "lost")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Marquer perdu
                  </Button>
                  <Button
                    className="flex-1 bg-[#1E3A5F]"
                    onClick={() => {
                      createQuoteFromLead(selectedLead);
                      setShowDetailDialog(false);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Créer un devis
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
