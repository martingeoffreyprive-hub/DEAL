"use client";

/**
 * Invoices Management Page
 * Gestion des factures
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Receipt,
  Plus,
  Search,
  Download,
  Send,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  Euro,
  Calendar,
  QrCode,
} from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  status: string;
  client_name: string;
  client_email?: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;
  issue_date: string;
  due_date: string;
  structured_reference?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Brouillon", color: "bg-gray-500", icon: FileText },
  sent: { label: "Envoyée", color: "bg-blue-500", icon: Send },
  paid: { label: "Payée", color: "bg-green-500", icon: CheckCircle },
  overdue: { label: "En retard", color: "bg-red-500", icon: AlertCircle },
  cancelled: { label: "Annulée", color: "bg-gray-400", icon: XCircle },
};

const TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  deposit: "Acompte",
  balance: "Solde",
};

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const url = statusFilter === "all"
        ? "/api/invoices"
        : `/api/invoices?status=${statusFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async (id: string) => {
    toast({
      title: "Téléchargement...",
      description: "Le PDF est en cours de génération",
    });
    // TODO: Implement PDF download
  };

  const exportPeppol = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}/peppol`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Download XML
      const blob = new Blob([data.xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.invoice_number}.xml`;
      a.click();

      toast({
        title: "Export Peppol",
        description: "Fichier XML téléchargé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'exporter en Peppol",
        variant: "destructive",
      });
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.client_name.toLowerCase().includes(query) ||
      invoice.client_email?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === "draft").length,
    sent: invoices.filter(i => i.status === "sent").length,
    paid: invoices.filter(i => i.status === "paid").length,
    overdue: invoices.filter(i => i.status === "overdue").length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    totalPaid: invoices.reduce((sum, i) => sum + i.amount_paid, 0),
    totalDue: invoices.reduce((sum, i) => sum + i.amount_due, 0),
  };

  return (
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
                <Receipt className="h-8 w-8 text-[#C9A962]" />
                Factures
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos factures et suivez vos paiements
              </p>
            </div>
            <Button className="gap-2 bg-[#1E3A5F]">
              <Plus className="h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total factures</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Euro className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalPaid.toLocaleString()}€</p>
                    <p className="text-xs text-muted-foreground">Encaissé</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalDue.toLocaleString()}€</p>
                    <p className="text-xs text-muted-foreground">En attente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.overdue}</p>
                    <p className="text-xs text-muted-foreground">En retard</p>
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
                placeholder="Rechercher par numéro, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">Toutes</TabsTrigger>
                <TabsTrigger value="draft">Brouillons</TabsTrigger>
                <TabsTrigger value="sent">Envoyées</TabsTrigger>
                <TabsTrigger value="paid">Payées</TabsTrigger>
                <TabsTrigger value="overdue">En retard</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Invoices List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-24" />
                </Card>
              ))}
            </div>
          ) : filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Aucune facture</h3>
                <p className="text-muted-foreground mb-4">
                  Créez des factures à partir de vos devis acceptés
                </p>
                <Button className="bg-[#1E3A5F]">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une facture
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((invoice, index) => {
                const statusConfig = STATUS_CONFIG[invoice.status];
                const StatusIcon = statusConfig?.icon || FileText;
                const isOverdue = invoice.status === "sent" && new Date(invoice.due_date) < new Date();

                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Icon */}
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            invoice.status === "paid" ? "bg-green-100" :
                            isOverdue ? "bg-red-100" :
                            "bg-gray-100"
                          }`}>
                            <Receipt className={`h-6 w-6 ${
                              invoice.status === "paid" ? "text-green-600" :
                              isOverdue ? "text-red-600" :
                              "text-gray-600"
                            }`} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{invoice.invoice_number}</h3>
                              <Badge className={`${statusConfig?.color} text-white`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {isOverdue ? "En retard" : statusConfig?.label}
                              </Badge>
                              <Badge variant="outline">
                                {TYPE_LABELS[invoice.invoice_type]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {invoice.client_name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Émise le {new Date(invoice.issue_date).toLocaleDateString("fr-BE")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Échéance: {new Date(invoice.due_date).toLocaleDateString("fr-BE")}
                              </span>
                              {invoice.structured_reference && (
                                <span className="flex items-center gap-1 font-mono">
                                  <QrCode className="h-3 w-3" />
                                  {invoice.structured_reference}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <p className="text-xl font-bold">{invoice.total.toLocaleString()}€</p>
                            {invoice.amount_paid > 0 && invoice.amount_paid < invoice.total && (
                              <p className="text-sm text-muted-foreground">
                                Payé: {invoice.amount_paid.toLocaleString()}€
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadPDF(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportPeppol(invoice.id)}
                              title="Export Peppol"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            {invoice.status === "draft" && (
                              <Button size="sm" className="bg-[#1E3A5F] gap-1">
                                <Send className="h-4 w-4" />
                                Envoyer
                              </Button>
                            )}
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
      </div>
  );
}
