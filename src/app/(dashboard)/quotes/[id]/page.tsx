"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  QUOTE_STATUSES,
  type Quote,
  type QuoteItem,
  type QuoteStatus,
} from "@/types/database";
import {
  Loader2,
  Trash2,
  ArrowLeft,
  Eye,
  Edit3,
  FileCheck,
  FileClock,
  FileX,
  Send,
  CheckCircle2,
  Download,
  Archive,
  Zap,
} from "lucide-react";

// Dynamic imports
const QuotePDFPreview = dynamic(
  () => import("@/components/quotes/quote-pdf-preview").then((mod) => mod.QuotePDFPreview),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

const AdvancedQuoteEditor = dynamic(
  () => import("@/components/quotes/advanced-editor").then((mod) => mod.AdvancedQuoteEditor),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

const QuickApproveEditor = dynamic(
  () => import("@/components/quotes/quick-approve-editor").then((mod) => mod.QuickApproveEditor),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div> }
);

interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}

const STATUS_ICONS: Record<QuoteStatus, any> = {
  draft: FileClock,
  sent: Send,
  accepted: FileCheck,
  rejected: FileX,
  finalized: CheckCircle2,
  exported: Download,
  archived: Archive,
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  sent: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  accepted: "bg-green-100 text-green-800 hover:bg-green-200",
  rejected: "bg-red-100 text-red-800 hover:bg-red-200",
  finalized: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  exported: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  archived: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export default function QuoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [quote, setQuote] = useState<QuoteWithItems | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("quick");

  const quoteId = params.id as string;

  const loadQuote = useCallback(async () => {
    try {
      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quoteId)
        .single();

      if (quoteError) throw quoteError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quoteId)
        .order("order_index");

      if (itemsError) throw itemsError;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }

      setQuote({ ...quoteData, items: itemsData || [] });
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error loading quote:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le devis",
        variant: "destructive",
      });
      router.push("/quotes");
    } finally {
      setLoading(false);
    }
  }, [quoteId, supabase, toast, router]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  const handleSave = async (updatedQuote: Quote, updatedItems: QuoteItem[]) => {
    setSaving(true);

    try {
      // Update quote
      const { error: quoteError } = await supabase
        .from("quotes")
        .update({
          client_name: updatedQuote.client_name,
          client_email: updatedQuote.client_email,
          client_phone: updatedQuote.client_phone,
          client_address: updatedQuote.client_address,
          client_city: updatedQuote.client_city,
          client_postal_code: updatedQuote.client_postal_code,
          sector: updatedQuote.sector,
          title: updatedQuote.title,
          notes: updatedQuote.notes,
          valid_until: updatedQuote.valid_until,
          tax_rate: updatedQuote.tax_rate,
          subtotal: updatedQuote.subtotal,
          tax_amount: updatedQuote.tax_amount,
          total: updatedQuote.total,
          status: updatedQuote.status,
        })
        .eq("id", quoteId);

      if (quoteError) throw quoteError;

      // Delete existing items and re-insert
      await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", quoteId);

      if (updatedItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(
            updatedItems.map((item, index) => ({
              quote_id: quoteId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              order_index: index,
            }))
          );

        if (itemsError) throw itemsError;
      }

      // Update local state
      setQuote({ ...updatedQuote, items: updatedItems } as QuoteWithItems);
      setItems(updatedItems);

      toast({
        title: "Sauvegardé",
        description: "Le devis a été mis à jour",
      });
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le devis",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .delete()
        .eq("id", quoteId);

      if (error) throw error;

      toast({
        title: "Supprimé",
        description: "Le devis a été supprimé",
      });
      router.push("/quotes");
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le devis",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: QuoteStatus) => {
    if (!quote) return;

    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: newStatus })
        .eq("id", quoteId);

      if (error) throw error;

      setQuote({ ...quote, status: newStatus });
      toast({
        title: "Statut mis à jour",
        description: `Le devis est maintenant "${QUOTE_STATUSES[newStatus]}"`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement du devis...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <p>Devis introuvable</p>
        <Button variant="link" onClick={() => router.push("/quotes")}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[quote.status as QuoteStatus] || FileClock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/quotes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{quote.quote_number}</h1>
              <Select
                value={quote.status}
                onValueChange={(value) => handleStatusChange(value as QuoteStatus)}
              >
                <SelectTrigger className={`w-auto gap-2 ${STATUS_COLORS[quote.status as QuoteStatus]}`}>
                  <StatusIcon className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(QUOTE_STATUSES) as [QuoteStatus, string][]).map(([key, label]) => {
                    const Icon = STATUS_ICONS[key];
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <p className="text-muted-foreground">{quote.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" disabled={deleting}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce devis ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le devis {quote.quote_number} sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick" className="gap-2">
            <Zap className="h-4 w-4" />
            Validation rapide
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Édition avancée
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Aperçu PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <QuickApproveEditor
            quote={quote}
            items={items}
            profile={profile}
            onSave={handleSave}
            saving={saving}
            onApprove={async () => {
              await handleStatusChange("accepted");
            }}
            onDownloadPDF={() => setActiveTab("preview")}
          />
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <AdvancedQuoteEditor
            quote={quote}
            items={items}
            profile={profile}
            onSave={handleSave}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu du PDF
              </CardTitle>
              <CardDescription>
                Prévisualisation adaptative avec sélection de locale et densité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuotePDFPreview
                quote={quote}
                items={items}
                profile={profile}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
