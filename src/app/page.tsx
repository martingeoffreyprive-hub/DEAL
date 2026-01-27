"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, Download, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E2144] via-[#151833] to-[#1E2144]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logos/deal-icon-d.svg"
              alt="DEAL"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-2xl font-black text-white tracking-wide">DEAL</span>
            <span className="w-2 h-2 rounded-full bg-[#E85A5A]"></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#E85A5A] text-white hover:bg-[#E85A5A]/90">
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
            className="inline-flex items-center gap-2 rounded-full bg-[#E85A5A]/20 px-4 py-2 text-sm text-[#E85A5A] mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>Propulsé par l'Intelligence Artificielle</span>
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Votre voix a de la valeur,{" "}
            <span className="text-[#E85A5A]">Deal lui donne un prix</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            DEAL transforme vos descriptions vocales en devis professionnels en 60 secondes.
            Conçu pour les artisans et indépendants wallons.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 bg-[#E85A5A] text-white hover:bg-[#E85A5A]/90 px-8">
                <Mic className="h-5 w-5" />
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
            {["Plan gratuit disponible", "Sans carte bancaire", "Made in Belgium"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#E85A5A]" />
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#E85A5A]/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E85A5A]/20">
                <Mic className="h-6 w-6 text-[#E85A5A]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Parlez naturellement</h3>
              <p className="text-gray-400">
                Décrivez le travail à faire comme vous le feriez à un client. L'IA comprend tout.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#E85A5A]/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E85A5A]/20">
                <Sparkles className="h-6 w-6 text-[#E85A5A]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">IA spécialisée</h3>
              <p className="text-gray-400">
                26 secteurs d'activité avec vocabulaire et tarification adaptés à votre métier.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-[#E85A5A]/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E85A5A]/20">
                <Download className="h-6 w-6 text-[#E85A5A]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">PDF professionnel</h3>
              <p className="text-gray-400">
                Export PDF avec TVA belge, mentions légales et QR code de paiement inclus.
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
              "Électricité",
              "Plomberie",
              "Menuiserie",
              "Peinture",
              "Carrelage",
              "Toiture",
              "HVAC",
              "+19 autres",
            ].map((sector) => (
              <span
                key={sector}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-[#E85A5A]/20 hover:text-[#E85A5A] transition-colors cursor-default"
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
          <div className="rounded-3xl border border-[#E85A5A]/30 bg-gradient-to-br from-[#E85A5A]/10 to-transparent p-12 backdrop-blur-sm">
            <Image
              src="/logos/deal-icon-d.svg"
              alt="DEAL"
              width={80}
              height={80}
              className="mx-auto mb-6 rounded-2xl"
            />
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à gagner du temps ?
            </h2>
            <p className="text-gray-400 mb-8">
              Rejoignez les artisans wallons qui créent leurs devis en 60 secondes.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-[#E85A5A] text-white hover:bg-[#E85A5A]/90 px-8">
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
            <div className="flex items-center gap-2">
              <Image
                src="/logos/deal-icon-d.svg"
                alt="DEAL"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-white font-bold">DEAL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E85A5A]"></span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} DEAL - dealofficialapp.com | Made in Wallonia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
