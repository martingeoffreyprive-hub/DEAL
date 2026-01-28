"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DealIconD } from "@/components/brand";
import { useLocaleContext } from "@/contexts/locale-context";
import {
  Sparkles,
  ArrowRight,
  Keyboard,
  TrendingUp,
  FileText,
  AlertCircle,
  PartyPopper,
  Coffee,
  Sun,
  Moon,
  Sunset,
} from "lucide-react";

interface HeroSectionProps {
  userName?: string;
  companyName?: string;
  stats: {
    totalAmount: number;
    quotesThisMonth: number;
    acceptedQuotes: number;
    pendingQuotes: number;
  };
}

export function HeroSection({ userName, companyName, stats }: HeroSectionProps) {
  const { formatCurrency } = useLocaleContext();

  // Get time-based greeting
  const { greeting, icon: GreetingIcon, message } = useMemo(() => {
    const hour = new Date().getHours();
    const name = userName || companyName || "vous";

    if (hour >= 5 && hour < 12) {
      return {
        greeting: `Bonjour${name ? `, ${name}` : ""} !`,
        icon: Coffee,
        message: "Prêt pour une journée productive ?",
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        greeting: `Bon après-midi${name ? `, ${name}` : ""} !`,
        icon: Sun,
        message: "Comment avancent vos devis ?",
      };
    } else if (hour >= 18 && hour < 22) {
      return {
        greeting: `Bonsoir${name ? `, ${name}` : ""} !`,
        icon: Sunset,
        message: "Encore quelques devis à finaliser ?",
      };
    } else {
      return {
        greeting: `Bonne nuit${name ? `, ${name}` : ""} !`,
        icon: Moon,
        message: "N'oubliez pas de vous reposer !",
      };
    }
  }, [userName, companyName]);

  // Context-aware CTA message
  const ctaMessage = useMemo(() => {
    if (stats.pendingQuotes > 0) {
      return {
        text: `${stats.pendingQuotes} devis en attente de réponse`,
        icon: AlertCircle,
        link: "/quotes?status=sent",
        variant: "warning" as const,
      };
    }
    if (stats.acceptedQuotes > 0 && stats.acceptedQuotes >= stats.quotesThisMonth / 2) {
      return {
        text: "Excellent taux d'acceptation ce mois !",
        icon: PartyPopper,
        link: "/analytics",
        variant: "success" as const,
      };
    }
    if (stats.quotesThisMonth === 0) {
      return {
        text: "Créez votre premier devis du mois",
        icon: Sparkles,
        link: "/quotes/new",
        variant: "default" as const,
      };
    }
    return {
      text: "Continuez sur votre lancée !",
      icon: TrendingUp,
      link: "/quotes/new",
      variant: "default" as const,
    };
  }, [stats]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#252B4A] via-[#1E3A5F] to-[#252B4A] p-4 sm:p-6 md:p-8 max-w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #E85A5A 1px, transparent 1px),
                              radial-gradient(circle at 75% 75%, #E85A5A 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Glow Effects - responsive sizes to prevent overflow */}
      <div className="absolute -top-16 -right-16 w-32 h-32 sm:-top-24 sm:-right-24 sm:w-48 sm:h-48 md:-top-32 md:-right-32 md:w-64 md:h-64 bg-[#E85A5A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 sm:-bottom-24 sm:-left-24 sm:w-48 sm:h-48 md:-bottom-32 md:-left-32 md:w-64 md:h-64 bg-[#252B4A]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Greeting */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#E85A5A]/20 flex items-center justify-center">
            <GreetingIcon className="w-6 h-6 text-[#E85A5A]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {greeting}
            </h1>
            <p className="text-white/70">{message}</p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-xl sm:text-3xl md:text-4xl font-bold text-[#E85A5A]">
              {formatCurrency(stats.totalAmount)}
            </div>
            <p className="text-white/60 text-xs sm:text-sm mt-1">Ce mois</p>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/20" />

          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white">
              {stats.quotesThisMonth}
            </div>
            <p className="text-white/60 text-sm mt-1">Devis créés</p>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/20" />

          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400">
              {stats.acceptedQuotes}
            </div>
            <p className="text-white/60 text-sm mt-1">Acceptés</p>
          </div>

          {stats.pendingQuotes > 0 && (
            <>
              <div className="hidden md:block w-px h-12 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-amber-400">
                  {stats.pendingQuotes}
                </div>
                <p className="text-white/60 text-sm mt-1">En attente</p>
              </div>
            </>
          )}
        </motion.div>

        {/* Context-aware CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link href={ctaMessage.link}>
            <div
              className={`flex items-center justify-center gap-3 p-3 rounded-xl mb-6 ${
                ctaMessage.variant === "warning"
                  ? "bg-amber-500/20 text-amber-300"
                  : ctaMessage.variant === "success"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-white/10 text-white/80"
              }`}
            >
              <ctaMessage.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{ctaMessage.text}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </motion.div>

        {/* Main CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/quotes/new">
            <Button
              size="lg"
              className="gap-2 bg-[#E85A5A] hover:bg-[#D64545] text-white font-semibold shadow-lg shadow-[#E85A5A]/30"
            >
              <Sparkles className="w-5 h-5" />
              Nouveau devis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/quotes">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/30 text-white hover:bg-white/10"
            >
              <FileText className="w-4 h-4" />
              Voir mes devis
            </Button>
          </Link>
        </motion.div>

        {/* Keyboard hint */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6 text-xs text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Keyboard className="w-3 h-3" />
          <span>
            Appuyez sur{" "}
            <kbd className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-white/60">
              ⌘K
            </kbd>{" "}
            pour la recherche rapide
          </span>
        </motion.div>
      </div>

      {/* DEAL Logo Watermark */}
      <div className="absolute bottom-4 right-4 opacity-10">
        <DealIconD size="xl" variant="white" />
      </div>
    </motion.div>
  );
}
