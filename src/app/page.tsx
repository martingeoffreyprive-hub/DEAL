"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, Download, ArrowRight, Check } from "lucide-react";
import { DealLogo, DealIconD } from "@/components/brand";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1B2A] via-[#1E3A5F] to-[#0D1B2A]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <DealLogo type="combined" size="sm" variant="white" animated />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
                Commencer
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#C9A962]/20 px-4 py-2 text-sm text-[#C9A962] mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>Propulsé par l'Intelligence Artificielle</span>
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Devis Enterprise{" "}
            <span className="text-[#C9A962]">Automatisés</span>{" "}
            en Ligne
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            DEAL transforme vos notes vocales en devis professionnels grâce à l'IA.
            Gagnez du temps, impressionnez vos clients.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90 px-8">
                <Sparkles className="h-5 w-5" />
                Essayer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Se connecter
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {["Essai gratuit 14 jours", "Sans carte bancaire", "Annulation facile"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#C9A962]" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto mt-24 max-w-5xl"
        >
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#C9A962]/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A962]/20">
                <Mic className="h-6 w-6 text-[#C9A962]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Import simple</h3>
              <p className="text-gray-400">
                Collez directement votre transcription depuis Plaud Note Pro ou tout autre outil.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#C9A962]/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A962]/20">
                <Sparkles className="h-6 w-6 text-[#C9A962]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Analyse IA</h3>
              <p className="text-gray-400">
                Notre IA détecte automatiquement le secteur et génère un devis avec le bon vocabulaire.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#C9A962]/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A962]/20">
                <Download className="h-6 w-6 text-[#C9A962]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Export PDF Premium</h3>
              <p className="text-gray-400">
                Téléchargez un PDF professionnel avec votre logo et vos mentions légales.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sectors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mx-auto mt-24 max-w-3xl text-center"
        >
          <h2 className="text-2xl font-bold text-white">Adapté à votre métier</h2>
          <p className="mt-4 text-gray-400">
            DEAL s'adapte automatiquement à votre secteur d'activité
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "BTP / Construction",
              "Services IT",
              "Conseil",
              "Artisanat",
              "Services à la personne",
            ].map((sector) => (
              <span
                key={sector}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-[#C9A962]/20 hover:text-[#C9A962] transition-colors cursor-default"
              >
                {sector}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mx-auto mt-24 max-w-2xl text-center"
        >
          <div className="rounded-3xl border border-[#C9A962]/30 bg-gradient-to-br from-[#C9A962]/10 to-transparent p-12 backdrop-blur-sm">
            <DealIconD size="xl" variant="gold" className="mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à transformer vos devis ?
            </h2>
            <p className="text-gray-400 mb-8">
              Rejoignez des milliers de professionnels qui gagnent du temps avec DEAL.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90 px-8">
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <DealLogo type="icon" size="sm" variant="white" />
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} DEAL - Devis Enterprise Automatisés en Ligne. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
