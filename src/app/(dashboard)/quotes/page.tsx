"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
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
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileText, Sparkles } from "lucide-react";
import { QuoteFilters, filterQuotes, type QuoteFilters as QuoteFiltersType } from "@/components/quotes/quote-filters";
import { staggerContainer, staggerItem, cardHover } from "@/components/animations/page-transition";
import { DealIconD, DealEmptyState, DealLoadingSpinner } from "@/components/brand";

type SortField = "quote_number" | "client_name" | "sector" | "created_at" | "total" | "status";
type SortOrder = "asc" | "desc";

interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  sector: string;
  created_at: string;
  total: number;
  status: string;
}

const ITEMS_PER_PAGE = 10;

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<QuoteFiltersType>({
    status: "all",
    sector: "all",
    dateRange: "all",
  });

  const supabase = createClient();

  // Fetch quotes
  useEffect(() => {
    async function fetchQuotes() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("quotes")
        .select("id, quote_number, client_name, sector, created_at, total, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setQuotes(data);
      }
      setLoading(false);
    }

    fetchQuotes();
  }, [supabase]);

  // Filter, search, and sort quotes
  const processedQuotes = useMemo(() => {
    let result = [...quotes];

    // Apply filters
    result = filterQuotes(result, filters);

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.quote_number?.toLowerCase().includes(searchLower) ||
          q.client_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: string | number = a[sortField] || "";
      let bVal: string | number = b[sortField] || "";

      if (sortField === "total") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else if (sortField === "created_at") {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [quotes, filters, search, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedQuotes.length / ITEMS_PER_PAGE);
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedQuotes.slice(start, start + ITEMS_PER_PAGE);
  }, [processedQuotes, currentPage]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const getStatusVariant = (status: QuoteStatus) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "sent":
        return "default";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
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

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "accepted":
      case "finalized":
        return "bg-[#C9A962]/10 text-[#B89952] border-[#C9A962]/30";
      case "sent":
        return "bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "exported":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default:
        return "";
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero Header with DEAL Branding */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#2D4A6F] to-[#0D1B2A] p-6 md:p-8"
        variants={staggerItem}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A962]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A962]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#C9A962]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Mes devis
              </h1>
              <p className="text-white/70">
                Gérez et consultez tous vos devis professionnels
              </p>
            </div>
          </div>
          <Link href="/quotes/new">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="gap-2 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872] font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Nouveau devis
                <Sparkles className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#C9A962]/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 focus-visible:ring-[#C9A962]/50"
                />
              </div>

              {/* Filters */}
              <QuoteFilters filters={filters} onChange={setFilters} />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#C9A962]/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C9A962]" />
                <span className="text-sm font-medium text-[#1E3A5F]">
                  {processedQuotes.length} devis trouvés
                </span>
              </div>
              {processedQuotes.length !== quotes.length && (
                <span className="text-sm text-muted-foreground">
                  sur {quotes.length} au total
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent border-b border-[#C9A962]/10">
            <div className="flex items-center gap-3">
              <DealIconD size="xs" variant="primary" />
              <div>
                <CardTitle className="text-[#1E3A5F]">Liste des devis</CardTitle>
                <CardDescription>
                  Page {currentPage} sur {totalPages || 1}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <DealLoadingSpinner size="lg" text="Chargement des devis..." />
              </div>
            ) : paginatedQuotes.length === 0 ? (
              quotes.length === 0 ? (
                <DealEmptyState
                  title="Aucun devis"
                  description="Vous n'avez pas encore créé de devis. Commencez par coller une transcription pour générer votre premier devis professionnel."
                  action={
                    <Link href="/quotes/new">
                      <Button className="gap-2 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]">
                        <Plus className="h-4 w-4" />
                        Créer mon premier devis
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <DealEmptyState
                  title="Aucun résultat"
                  description="Aucun devis ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                  icon={<Search className="h-10 w-10 text-[#C9A962]" />}
                />
              )
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <button
                            onClick={() => handleSort("quote_number")}
                            className="sort-header"
                          >
                            Numéro
                            <SortIcon field="quote_number" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort("client_name")}
                            className="sort-header"
                          >
                            Client
                            <SortIcon field="client_name" />
                          </button>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <button
                            onClick={() => handleSort("sector")}
                            className="sort-header"
                          >
                            Secteur
                            <SortIcon field="sector" />
                          </button>
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          <button
                            onClick={() => handleSort("created_at")}
                            className="sort-header"
                          >
                            Date
                            <SortIcon field="created_at" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort("total")}
                            className="sort-header"
                          >
                            Montant
                            <SortIcon field="total" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            onClick={() => handleSort("status")}
                            className="sort-header"
                          >
                            Statut
                            <SortIcon field="status" />
                          </button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedQuotes.map((quote) => (
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
                            <Badge
                              variant={getStatusVariant(quote.status as QuoteStatus)}
                              className={getStatusColor(quote.status as QuoteStatus)}
                            >
                              {QUOTE_STATUSES[quote.status as QuoteStatus]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-[#C9A962]/10 mt-4">
                    <div className="text-sm text-muted-foreground">
                      Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, processedQuotes.length)} sur{" "}
                      {processedQuotes.length} devis
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-[#1E3A5F]/20 hover:bg-[#1E3A5F]/5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page: number;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${
                                currentPage === page
                                  ? "bg-[#1E3A5F] hover:bg-[#1E3A5F]/90"
                                  : "border-[#1E3A5F]/20 hover:bg-[#1E3A5F]/5"
                              }`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-[#1E3A5F]/20 hover:bg-[#1E3A5F]/5"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
