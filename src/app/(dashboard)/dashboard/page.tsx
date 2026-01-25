"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocaleContext } from "@/contexts/locale-context";
import { QUOTE_STATUSES, type QuoteStatus } from "@/types/database";
import { UsageCard } from "@/components/subscription/usage-card";
import {
  Mic,
  MicOff,
  Sparkles,
  FileText,
  ArrowRight,
  TrendingUp,
  Keyboard,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { formatCurrency, formatDate } = useLocaleContext();

  const [user, setUser] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: quotesData } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setQuotes(quotesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate stats
  const thisMonthQuotes = quotes.filter((q) => {
    const quoteDate = new Date(q.created_at);
    const now = new Date();
    return (
      quoteDate.getMonth() === now.getMonth() &&
      quoteDate.getFullYear() === now.getFullYear()
    );
  });
  const totalAmount = thisMonthQuotes.reduce((sum, q) => sum + Number(q.total), 0);

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "draft": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "sent": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "accepted": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section - Big Mic Button */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-8 md:p-12">
        {/* Background decoration - subtil */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="stat-huge">{formatCurrency(totalAmount)}</div>
              <p className="text-muted-foreground mt-1">Ce mois</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">{thisMonthQuotes.length}</div>
              <p className="text-muted-foreground mt-1">Devis créés</p>
            </div>
          </div>

          {/* Main CTA - Mic Button */}
          <div className="flex flex-col items-center">
            <Link href="/quotes/new">
              <button
                className="mic-button w-32 h-32 md:w-40 md:h-40 flex items-center justify-center glow-primary hover:glow-primary-lg group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Mic className={`w-12 h-12 md:w-16 md:h-16 text-white transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`} />
              </button>
            </Link>

            <div className="mt-6 text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                Décrivez votre devis
              </h2>
              <p className="text-muted-foreground max-w-md">
                Collez votre transcription vocale et laissez l'IA générer un devis professionnel en quelques secondes
              </p>
            </div>

            {/* Secondary action */}
            <div className="flex items-center gap-4 mt-6">
              <Link href="/quotes/new">
                <Button size="lg" className="gap-2 transition-qv">
                  <Sparkles className="w-4 h-4" />
                  Nouveau devis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Keyboard className="w-3 h-3" />
              <span>Bientôt: Cmd+K pour tout contrôler</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes - Simplified */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Devis récents</h3>
          <Link href="/quotes">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground transition-qv">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {quotes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">
                Aucun devis pour l'instant
              </p>
              <Link href="/quotes/new">
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Créer mon premier devis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {quotes.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`}>
                <Card className="card-interactive">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{quote.client_name}</span>
                            <Badge variant="outline" className={getStatusColor(quote.status as QuoteStatus)}>
                              {QUOTE_STATUSES[quote.status as QuoteStatus]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {quote.quote_number} • {formatDate(quote.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatCurrency(Number(quote.total))}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Usage Card & Quick tip */}
      <div className="grid md:grid-cols-2 gap-4">
        <UsageCard />

        <Card className="bg-accent/5 border-accent/20">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent">Astuce IA</p>
              <p className="text-sm text-muted-foreground">
                Plus votre transcription est détaillée, plus le devis généré sera précis et professionnel.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
