import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QUOTE_STATUSES, SECTORS, type QuoteStatus, type SectorType } from "@/types/database";
import { Plus, FileText, Search } from "lucide-react";

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allQuotes = quotes || [];

  const getStatusVariant = (status: QuoteStatus) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "finalized":
        return "default";
      case "exported":
        return "default";
      case "archived":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes devis</h1>
          <p className="text-muted-foreground">
            Gérez et consultez tous vos devis
          </p>
        </div>
        <Link href="/quotes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des devis</CardTitle>
          <CardDescription>
            {allQuotes.length} devis au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun devis</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Vous n'avez pas encore créé de devis. Commencez par coller une transcription pour générer votre premier devis.
              </p>
              <Link href="/quotes/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer mon premier devis
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Secteur</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>
                        <Link
                          href={`/quotes/${quote.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {quote.quote_number}
                        </Link>
                      </TableCell>
                      <TableCell>{quote.client_name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {SECTORS[quote.sector as SectorType]}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDate(quote.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(Number(quote.total))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(quote.status as QuoteStatus)}>
                          {QUOTE_STATUSES[quote.status as QuoteStatus]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
