"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Sparkles, Download, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-deal-gradient relative overflow-hidden">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-deal-gradient-radial pointer-events-none" />

      {/* Header - Logo DEAL texte seul (guidelines branding B) */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-0.5">
            <span className="text-2xl font-extrabold tracking-[0.15em] bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              DEAL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-deal-coral mb-1"></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-deal">
                Commencer
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 relative z-10">
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
            className="badge-deal mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>Propulse par l'Intelligence Artificielle</span>
          </motion.div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Votre voix a de la valeur,{" "}
            <span className="text-deal-coral">Deal lui donne un prix</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            DEAL transforme vos descriptions vocales en devis professionnels en 60 secondes.
            Concu pour les artisans et independants wallons.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 btn-deal px-8">
                <Mic className="h-5 w-5" />
                Essayer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="btn-deal-outline">
                Se connecter
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            {["Plan gratuit disponible", "Sans carte bancaire", "Made in Belgium"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-deal-coral" />
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
            <div className="card-deal p-6 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-deal-coral/20">
                <Mic className="h-6 w-6 text-deal-coral" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Parlez naturellement</h3>
              <p className="text-gray-400">
                Decrivez le travail a faire comme vous le feriez a un client. L'IA comprend tout.
              </p>
            </div>

            <div className="card-deal p-6 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-deal-coral/20">
                <Sparkles className="h-6 w-6 text-deal-coral" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">IA specialisee</h3>
              <p className="text-gray-400">
                26 secteurs d'activite avec vocabulaire et tarification adaptes a votre metier.
              </p>
            </div>

            <div className="card-deal p-6 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-deal-coral/20">
                <Download className="h-6 w-6 text-deal-coral" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">PDF professionnel</h3>
              <p className="text-gray-400">
                Export PDF avec TVA belge, mentions legales et QR code de paiement inclus.
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
          <h2 className="text-2xl font-bold text-white">Adapte a votre metier</h2>
          <p className="mt-4 text-gray-400">
            DEAL s'adapte automatiquement a votre secteur d'activite
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "Electricite",
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
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-deal-coral/20 hover:text-deal-coral transition-colors cursor-default"
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
          <div className="rounded-3xl border border-deal-coral/30 bg-gradient-to-br from-deal-coral/10 to-transparent p-12 backdrop-blur-sm">
            <div className="mx-auto mb-6 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-extrabold tracking-[0.15em] bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                DEAL
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-deal-coral mb-2"></span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Pret a gagner du temps ?
            </h2>
            <p className="text-gray-400 mb-8">
              Rejoignez les artisans wallons qui creent leurs devis en 60 secondes.
            </p>
            <Link href="/register">
              <Button size="lg" className="btn-deal px-8">
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer - Logo + Slogan (guidelines branding C) */}
      <footer className="border-t border-white/10 py-12 mt-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Logo */}
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-extrabold tracking-[0.15em] bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                DEAL
              </span>
              <span className="w-2 h-2 rounded-full bg-deal-coral mb-1"></span>
            </div>
            {/* Slogan */}
            <p className="text-gray-400 text-center">
              Votre voix a de la valeur, Deal lui donne un prix
            </p>
            <p className="text-sm text-gray-500 text-center mt-4">
              &copy; {new Date().getFullYear()} DEAL - dealofficialapp.com | Made in Wallonia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
