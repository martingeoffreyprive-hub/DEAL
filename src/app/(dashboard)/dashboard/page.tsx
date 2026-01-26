"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocaleContext } from "@/contexts/locale-context";
import { QUOTE_STATUSES, type QuoteStatus } from "@/types/database";
import { UsageCard } from "@/components/subscription/usage-card";
import { DealIconD, DealLogo } from "@/components/brand";
import {
  Mic,
  Sparkles,
  FileText,
  ArrowRight,
  Keyboard,
  TrendingUp,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";
import {
  staggerContainer,
  staggerItem,
  cardHover,
} from "@/components/animations/page-transition";

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
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
  const pendingQuotes = quotes.filter(q => q.status === 'sent').length;

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "draft": return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "sent": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "accepted": return "bg-green-500/20 text-green-600 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-600 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: QuoteStatus) => {
    switch (status) {
      case "draft": return Clock;
      case "sent": return Send;
      case "accepted": return CheckCircle;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <DealIconD size="xl" variant="primary" />
          </motion.div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero Section - DEAL Branded */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A] p-8 md:p-12"
        variants={staggerItem}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #C9A962 1px, transparent 1px),
                                radial-gradient(circle at 75% 75%, #C9A962 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#C9A962]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#1E3A5F]/40 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl md:text-5xl font-bold text-[#C9A962]">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-white/70 mt-1">Ce mois</p>
            </motion.div>
            <div className="hidden md:block w-px h-12 bg-white/20" />
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-white">{thisMonthQuotes.length}</div>
              <p className="text-white/70 mt-1">Devis créés</p>
            </motion.div>
            <div className="hidden md:block w-px h-12 bg-white/20" />
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-3xl font-bold text-green-400">{acceptedQuotes}</div>
              <p className="text-white/70 mt-1">Acceptés</p>
            </motion.div>
          </div>

          {/* Main CTA - DEAL Branded Button */}
          <div className="flex flex-col items-center">
            <Link href="/quotes/new">
              <motion.button
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#C9A962] to-[#B89952] flex items-center justify-center shadow-lg shadow-[#C9A962]/30 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Pulse ring */}
                <div className="absolute inset-0 rounded-full bg-[#C9A962]/30 animate-ping" />

                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#C9A962] to-[#B89952] opacity-50 blur-sm" />

                {/* Icon */}
                <Mic className={`relative w-12 h-12 md:w-16 md:h-16 text-[#0D1B2A] transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`} />
              </motion.button>
            </Link>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
                Créez votre devis en un clic
              </h2>
              <p className="text-white/70 max-w-md">
                Collez votre transcription vocale et laissez l'IA générer un devis professionnel
              </p>
            </motion.div>

            {/* Secondary action */}
            <motion.div
              className="flex items-center gap-4 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/quotes/new">
                <Button size="lg" className="gap-2 bg-white text-[#0D1B2A] hover:bg-white/90">
                  <Sparkles className="w-4 h-4" />
                  Nouveau devis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Keyboard hint */}
            <motion.div
              className="flex items-center gap-2 mt-4 text-xs text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Keyboard className="w-3 h-3" />
              <span>Appuyez sur <kbd className="mx-1 px-1.5 py-0.5 bg-white/10 rounded">⌘K</kbd> pour la recherche rapide</span>
            </motion.div>
          </div>
        </div>

        {/* DEAL Logo Watermark */}
        <div className="absolute bottom-4 right-4 opacity-20">
          <DealIconD size="xl" variant="white" />
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={staggerItem}>
        <Card className="bg-gradient-to-br from-[#1E3A5F]/10 to-transparent border-[#1E3A5F]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1E3A5F]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#1E3A5F]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{quotes.length}</p>
                <p className="text-xs text-muted-foreground">Total devis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#C9A962]/10 to-transparent border-[#C9A962]/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-[#C9A962]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C9A962]">{pendingQuotes}</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{acceptedQuotes}</p>
                <p className="text-xs text-muted-foreground">Acceptés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{thisMonthQuotes.length}</p>
                <p className="text-xs text-muted-foreground">Ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Quotes */}
      <motion.div className="space-y-4" variants={staggerItem}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DealIconD size="xs" variant="primary" />
            Devis récents
          </h3>
          <Link href="/quotes">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {quotes.length === 0 ? (
          <Card className="border-dashed border-[#C9A962]/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center mb-4">
                <DealIconD size="lg" variant="primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Bienvenue sur DEAL</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Créez votre premier devis professionnel en quelques secondes grâce à l'IA
              </p>
              <Link href="/quotes/new">
                <Button className="gap-2 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
                  <Sparkles className="w-4 h-4" />
                  Créer mon premier devis
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {quotes.map((quote, index) => {
              const StatusIcon = getStatusIcon(quote.status as QuoteStatus);
              return (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  {...cardHover}
                >
                  <Link href={`/quotes/${quote.id}`}>
                    <Card className="hover:border-[#C9A962]/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center">
                              <StatusIcon className="w-5 h-5 text-[#1E3A5F]" />
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
                            <p className="font-semibold text-lg text-[#1E3A5F]">
                              {formatCurrency(Number(quote.total))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Usage Card & Quick tip */}
      <motion.div className="grid md:grid-cols-2 gap-4" variants={staggerItem}>
        <UsageCard />

        <Card className="bg-gradient-to-br from-[#C9A962]/10 to-transparent border-[#C9A962]/20">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="w-10 h-10 rounded-full bg-[#C9A962]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#C9A962]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#C9A962]">Astuce DEAL</p>
              <p className="text-sm text-muted-foreground">
                Plus votre transcription est détaillée, plus le devis généré sera précis et professionnel.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
