"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleContext } from "@/contexts/locale-context";
import { type QuoteStatus } from "@/types/database";
import { UsageCard } from "@/components/subscription/usage-card";
import { HeroSection } from "@/components/dashboard/hero-section";
import { QuoteCarousel } from "@/components/dashboard/quote-carousel";
import { DealIconD, DealLoadingSpinner } from "@/components/brand";
import {
  Sparkles,
  TrendingUp,
  CheckCircle,
  Clock,
  Send,
  FileText,
  Lightbulb,
  Zap,
} from "lucide-react";
import {
  staggerContainer,
  staggerItem,
  cardHover,
} from "@/components/animations/page-transition";

interface DashboardStats {
  totalAmount: number;
  quotesThisMonth: number;
  acceptedQuotes: number;
  pendingQuotes: number;
  totalQuotes: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { formatCurrency } = useLocaleContext();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAmount: 0,
    quotesThisMonth: 0,
    acceptedQuotes: 0,
    pendingQuotes: 0,
    totalQuotes: 0,
  });

  // Load data
  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Load profile (use maybeSingle to handle missing profiles gracefully)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profileData);

      // Load quotes
      const { data: quotesData } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const allQuotes = quotesData || [];
      setQuotes(allQuotes);

      // Calculate stats
      const now = new Date();
      const thisMonthQuotes = allQuotes.filter((q) => {
        const quoteDate = new Date(q.created_at);
        return (
          quoteDate.getMonth() === now.getMonth() &&
          quoteDate.getFullYear() === now.getFullYear()
        );
      });

      setStats({
        totalAmount: thisMonthQuotes.reduce((sum, q) => sum + Number(q.total), 0),
        quotesThisMonth: thisMonthQuotes.length,
        acceptedQuotes: allQuotes.filter(q => q.status === 'accepted').length,
        pendingQuotes: allQuotes.filter(q => q.status === 'sent').length,
        totalQuotes: allQuotes.length,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <DealLoadingSpinner size="lg" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 sm:space-y-8 max-w-full overflow-hidden"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero Section with Personalized Greeting */}
      <motion.div variants={staggerItem}>
        <HeroSection
          userName={profile?.company_name?.split(' ')[0]}
          companyName={profile?.company_name}
          stats={stats}
        />
      </motion.div>

      {/* Quick Stats Cards - MOBILE OPTIMIZED */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={staggerItem}>
        <Card className="bg-gradient-to-br from-[#252B4A]/10 to-transparent border-[#252B4A]/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#252B4A]/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-[#252B4A] dark:text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-[#252B4A] dark:text-white">{stats.totalQuotes}</p>
                <p className="text-sm text-muted-foreground">Total devis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#E85A5A]/10 to-transparent border-[#E85A5A]/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#E85A5A]/20 flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 text-[#E85A5A]" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-[#E85A5A]">{stats.pendingQuotes}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.acceptedQuotes}</p>
                <p className="text-sm text-muted-foreground">Acceptés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stats.quotesThisMonth}</p>
                <p className="text-sm text-muted-foreground">Ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Quotes Carousel (Netflix-style) */}
      <motion.div variants={staggerItem}>
        {quotes.length > 0 ? (
          <QuoteCarousel quotes={quotes} title="Devis récents" />
        ) : (
          <Card className="border-dashed border-[#E85A5A]/30">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-[#252B4A]/10 flex items-center justify-center mb-4">
                <DealIconD size="lg" variant="primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Bienvenue sur DEAL</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Créez votre premier devis professionnel en quelques secondes grâce à l'IA
              </p>
              <Link href="/quotes/new">
                <Button className="gap-2 bg-[#E85A5A] text-white hover:bg-[#D64545]">
                  <Sparkles className="w-4 h-4" />
                  Créer mon premier devis
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Usage Card & Quick Actions */}
      <motion.div className="grid md:grid-cols-2 gap-4" variants={staggerItem}>
        <UsageCard />

        {/* Quick Tips - LARGER text for mobile */}
        <Card className="bg-gradient-to-br from-[#E85A5A]/5 to-transparent border-[#E85A5A]/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="w-6 h-6 text-[#E85A5A]" />
              <h4 className="font-semibold text-lg text-[#E85A5A]">Astuce DEAL</h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#E85A5A] mt-0.5 flex-shrink-0" />
                <p className="text-base text-muted-foreground">
                  Plus votre transcription est détaillée, plus le devis sera précis et professionnel.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-[#E85A5A] mt-0.5 flex-shrink-0" />
                <p className="text-base text-muted-foreground">
                  Utilisez <kbd className="px-2 py-1 bg-muted rounded text-sm font-medium">⌘K</kbd> pour accéder rapidement à toutes les fonctionnalités.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions - Mobile Optimized with LARGER touch targets */}
      <motion.div className="grid grid-cols-2 gap-4 lg:hidden" variants={staggerItem}>
        <Link href="/quotes/new">
          <Card className="hover:border-[#E85A5A]/50 transition-colors active:scale-95">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#E85A5A]/10 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7 text-[#E85A5A]" />
              </div>
              <span className="text-base font-semibold">Nouveau</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/quotes">
          <Card className="hover:border-primary/50 transition-colors active:scale-95">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <span className="text-base font-semibold">Mes devis</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="hover:border-green-500/50 transition-colors active:scale-95">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <span className="text-base font-semibold">Stats</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile">
          <Card className="hover:border-[#252B4A]/50 transition-colors active:scale-95">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#252B4A]/10 flex items-center justify-center mb-3">
                <DealIconD size="md" variant="primary" />
              </div>
              <span className="text-base font-semibold">Profil</span>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
