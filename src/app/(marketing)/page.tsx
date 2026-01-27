"use client";

/**
 * Landing Page AIDA - Framework Cognitif Intégré
 * Attention → Intérêt → Désir → Action
 */
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DealLogo } from "@/components/brand/DealLogo";
import {
  Play,
  ArrowRight,
  Check,
  Star,
  Clock,
  Zap,
  Shield,
  Mic,
  FileText,
  Calculator,
  Users,
  TrendingUp,
  ChevronDown,
  Quote,
  Building2,
  Sparkles,
} from "lucide-react";

// Statistiques animées
function AnimatedCounter({ end, suffix = "", duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Témoignages
const TESTIMONIALS = [
  {
    name: "Marc Dubois",
    role: "Électricien indépendant",
    location: "Bruxelles",
    avatar: "/avatars/marc.jpg",
    quote: "Je gagne 4 heures par semaine depuis que j'utilise DEAL. Plus besoin de taper mes devis le soir!",
    rating: 5,
  },
  {
    name: "Sophie Janssen",
    role: "Gérante PME Rénovation",
    location: "Liège",
    avatar: "/avatars/sophie.jpg",
    quote: "La transcription vocale a changé ma vie. Je dicte mes devis sur le chantier, c'est magique.",
    rating: 5,
  },
  {
    name: "Pierre Maes",
    role: "Plombier-Chauffagiste",
    location: "Anvers",
    avatar: "/avatars/pierre.jpg",
    quote: "Enfin un logiciel pensé pour les artisans. Les gros boutons en mode chantier, c'est parfait.",
    rating: 5,
  },
];

// Fonctionnalités principales
const FEATURES = [
  {
    icon: Mic,
    title: "Transcription Vocale IA",
    description: "Dictez, l'IA transcrit. Créez vos devis en parlant, même avec du bruit de chantier.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calculator,
    title: "TVA Belge Automatique",
    description: "21% ou 6% ? DEAL calcule automatiquement selon le type de travaux et l'âge du bâtiment.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "PDF Professionnels",
    description: "Templates élégants, filigrane personnalisé, signature électronique. Impressionnez vos clients.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Mode Chantier",
    description: "Interface adaptée aux conditions terrain: gros boutons, haute visibilité, compatible gants.",
    color: "from-orange-500 to-red-500",
  },
];

// Douleurs / Solutions
const PAIN_POINTS = [
  {
    pain: "Finies les soirées à taper des devis",
    solution: "Transcription vocale IA",
    icon: Clock,
  },
  {
    pain: "Fini les calculs TVA à la main",
    solution: "Calcul automatique conforme",
    icon: Calculator,
  },
  {
    pain: "Fini les devis non signés",
    solution: "Signature électronique intégrée",
    icon: FileText,
  },
  {
    pain: "Fini les erreurs de facturation",
    solution: "Conversion devis → facture en 1 clic",
    icon: TrendingUp,
  },
];

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [remainingSpots, setRemainingSpots] = useState(247);

  // Simuler le décompte des places
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setRemainingSpots(prev => Math.max(prev - 1, 50));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== */}
      {/* ATTENTION - Hero */}
      {/* ==================== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] via-[#0D1B2A] to-[#1E3A5F]" />

        {/* Animated shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#C9A962]/5 rounded-full"
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="mb-6 bg-[#C9A962]/20 text-[#C9A962] border-[#C9A962]/30 px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Lancement exclusif Belgique 🇧🇪
                </Badge>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Vos devis en{" "}
                <span className="text-[#C9A962]">2 minutes</span>.
                <br />
                Votre temps sur le{" "}
                <span className="relative">
                  chantier
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-0 left-0 h-1 bg-[#C9A962]"
                  />
                </span>
                .
              </h1>

              {/* Social proof */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/80 mb-8"
              >
                <span className="text-[#C9A962] font-semibold">
                  <AnimatedCounter end={1247} />
                </span>{" "}
                artisans belges gagnent déjà{" "}
                <span className="text-[#C9A962] font-semibold">4h/semaine</span>
              </motion.p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90 text-lg h-14 px-8 font-semibold"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-14 px-8"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Voir la démo (90s)
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-8 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  Sans carte bancaire
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  Conforme RGPD
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇧🇪</span>
                  Made in Belgium
                </div>
              </div>
            </motion.div>

            {/* Right - Video/Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative"
            >
              <div className="relative bg-white/10 backdrop-blur rounded-2xl p-2 shadow-2xl">
                <div className="aspect-video rounded-xl bg-[#0D1B2A] flex items-center justify-center overflow-hidden">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-20 w-20 rounded-full bg-[#C9A962] flex items-center justify-center shadow-lg"
                  >
                    <Play className="h-10 w-10 text-[#0D1B2A] ml-1" />
                  </motion.button>
                </div>
                <p className="text-center text-white/60 text-sm mt-3">
                  Regardez un artisan créer un devis en 90 secondes
                </p>
              </div>

              {/* Floating stats card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#1E3A5F]">+73%</div>
                    <div className="text-sm text-gray-500">Productivité</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white/50"
          >
            <ChevronDown className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== */}
      {/* INTÉRÊT - Pain/Solution */}
      {/* ==================== */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Shocking stat */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 text-red-600 border-red-200 bg-red-50">
              Le saviez-vous ?
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
              <span className="text-red-500">73%</span> des artisans passent{" "}
              <span className="text-red-500">+5h/semaine</span>
              <br />
              sur l'administratif
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              C'est du temps que vous pourriez passer sur vos chantiers, avec vos clients,
              ou en famille.
            </p>
          </motion.div>

          {/* Pain points grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {PAIN_POINTS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="h-14 w-14 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-7 w-7 text-[#1E3A5F]" />
                    </div>
                    <p className="text-gray-400 line-through text-sm mb-2">{item.pain}</p>
                    <p className="font-semibold text-[#1E3A5F]">{item.solution}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== */}
      {/* DÉSIR - Features + Social Proof */}
      {/* ==================== */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#1E3A5F] mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Une solution complète pensée par et pour les artisans belges
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all group">
                  <CardContent className="p-6">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-[#1E3A5F]">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="bg-[#1E3A5F] rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-white text-center mb-10">
              Ils ont transformé leur quotidien
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur rounded-xl p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#C9A962] text-[#C9A962]" />
                    ))}
                  </div>
                  <p className="text-white/90 mb-4 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#C9A962]/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#C9A962]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-white/60">
                        {testimonial.role} • {testimonial.location}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== */}
      {/* ACTION - CTA Final */}
      {/* ==================== */}
      <section className="py-24 bg-gradient-to-br from-[#1E3A5F] to-[#0D1B2A]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Urgency badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Badge className="mb-6 bg-red-500/20 text-red-300 border-red-500/30 px-4 py-2 text-lg">
                🔥 Plus que {remainingSpots} places disponibles
              </Badge>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Rejoignez les{" "}
              <span className="text-[#C9A962]">500 pionniers</span>
            </h2>

            <p className="text-xl text-white/80 mb-8">
              Accès prioritaire, tarif de lancement exclusif, et votre avis compte
              pour façonner l'avenir de DEAL.
            </p>

            {/* Email capture */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
              <Input
                type="email"
                placeholder="Votre email professionnel"
                className="h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button
                size="lg"
                className="h-14 px-8 bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90 font-semibold whitespace-nowrap"
              >
                Rejoindre la liste
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Guarantees */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                30 jours gratuits
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Sans engagement
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                Sans carte bancaire
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D1B2A] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <DealLogo variant="white" size="md" />
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <Link href="/privacy" className="hover:text-white">Confidentialité</Link>
              <Link href="/terms" className="hover:text-white">CGU</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>🇧🇪</span>
              <span>Conforme RGPD • Hébergé en Europe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
