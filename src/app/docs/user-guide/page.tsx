"use client";

/**
 * Mode d'emploi complet - Documentation utilisateur
 * Ludique et pédagogique
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DealLogo } from "@/components/brand/DealLogo";
import {
  Search,
  BookOpen,
  Video,
  FileText,
  Lightbulb,
  HelpCircle,
  ChevronRight,
  Play,
  Clock,
  Star,
  Zap,
  Shield,
  Palette,
  Mic,
  FileOutput,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  Workflow,
  Globe,
} from "lucide-react";

// Catégories de documentation
const CATEGORIES = [
  {
    id: "getting-started",
    title: "Démarrage",
    icon: Zap,
    color: "text-green-500",
    articles: [
      { id: "first-steps", title: "Premiers pas avec DEAL", duration: "5 min", difficulty: "débutant" },
      { id: "onboarding", title: "Configuration initiale", duration: "10 min", difficulty: "débutant" },
      { id: "interface", title: "Découvrir l'interface", duration: "8 min", difficulty: "débutant" },
      { id: "first-quote", title: "Créer votre premier devis", duration: "7 min", difficulty: "débutant" },
    ],
  },
  {
    id: "quotes",
    title: "Devis",
    icon: FileText,
    color: "text-blue-500",
    articles: [
      { id: "create-quote", title: "Créer un devis", duration: "5 min", difficulty: "débutant" },
      { id: "ai-transcription", title: "Transcription vocale IA", duration: "6 min", difficulty: "intermédiaire" },
      { id: "templates", title: "Utiliser les templates", duration: "8 min", difficulty: "débutant" },
      { id: "pdf-export", title: "Exporter en PDF", duration: "4 min", difficulty: "débutant" },
      { id: "watermark", title: "Ajouter un filigrane", duration: "3 min", difficulty: "intermédiaire" },
      { id: "signature", title: "Signature électronique", duration: "5 min", difficulty: "intermédiaire" },
    ],
  },
  {
    id: "invoices",
    title: "Facturation",
    icon: CreditCard,
    color: "text-purple-500",
    articles: [
      { id: "quote-to-invoice", title: "Convertir un devis en facture", duration: "4 min", difficulty: "débutant" },
      { id: "deposits", title: "Factures d'acompte", duration: "6 min", difficulty: "intermédiaire" },
      { id: "peppol", title: "Facturation Peppol", duration: "8 min", difficulty: "avancé" },
      { id: "belgium-vat", title: "TVA belge (21%, 6%)", duration: "7 min", difficulty: "intermédiaire" },
    ],
  },
  {
    id: "workflows",
    title: "Automatisation",
    icon: Workflow,
    color: "text-orange-500",
    articles: [
      { id: "workflow-intro", title: "Introduction aux workflows", duration: "10 min", difficulty: "intermédiaire" },
      { id: "email-trigger", title: "Devis automatique par email", duration: "8 min", difficulty: "avancé" },
      { id: "human-loop", title: "Contrôle humain (HITL)", duration: "6 min", difficulty: "intermédiaire" },
      { id: "mcp-integration", title: "Intégration MCP", duration: "15 min", difficulty: "avancé" },
    ],
  },
  {
    id: "team",
    title: "Équipe",
    icon: Users,
    color: "text-cyan-500",
    articles: [
      { id: "invite-members", title: "Inviter des membres", duration: "4 min", difficulty: "débutant" },
      { id: "roles", title: "Gérer les rôles", duration: "5 min", difficulty: "intermédiaire" },
      { id: "permissions", title: "Permissions avancées", duration: "8 min", difficulty: "avancé" },
    ],
  },
  {
    id: "integrations",
    title: "Intégrations",
    icon: Globe,
    color: "text-pink-500",
    articles: [
      { id: "widget-website", title: "Widget pour votre site", duration: "10 min", difficulty: "intermédiaire" },
      { id: "api-basics", title: "Introduction à l'API", duration: "12 min", difficulty: "avancé" },
      { id: "crm-sync", title: "Synchronisation CRM", duration: "15 min", difficulty: "avancé" },
      { id: "zapier", title: "Intégration Zapier/Make", duration: "8 min", difficulty: "intermédiaire" },
    ],
  },
  {
    id: "customization",
    title: "Personnalisation",
    icon: Palette,
    color: "text-amber-500",
    articles: [
      { id: "themes", title: "Changer de thème", duration: "3 min", difficulty: "débutant" },
      { id: "chantier-mode", title: "Mode Chantier", duration: "4 min", difficulty: "débutant" },
      { id: "template-editor", title: "Éditeur de templates", duration: "12 min", difficulty: "intermédiaire" },
      { id: "branding", title: "Personnaliser votre marque", duration: "8 min", difficulty: "intermédiaire" },
    ],
  },
  {
    id: "security",
    title: "Sécurité & RGPD",
    icon: Shield,
    color: "text-red-500",
    articles: [
      { id: "rgpd-overview", title: "Conformité RGPD", duration: "8 min", difficulty: "intermédiaire" },
      { id: "data-export", title: "Exporter vos données", duration: "5 min", difficulty: "débutant" },
      { id: "consents", title: "Gérer vos consentements", duration: "4 min", difficulty: "débutant" },
      { id: "2fa", title: "Authentification 2FA", duration: "6 min", difficulty: "intermédiaire" },
    ],
  },
];

// Glossaire
const GLOSSARY = [
  { term: "Devis", definition: "Document commercial détaillant les prestations et leurs prix avant acceptation du client." },
  { term: "Facture", definition: "Document comptable obligatoire émis après la réalisation d'une prestation ou vente." },
  { term: "TVA", definition: "Taxe sur la Valeur Ajoutée. En Belgique: 21% standard, 6% pour rénovation (+10 ans)." },
  { term: "Peppol", definition: "Réseau européen de facturation électronique permettant l'échange de documents standardisés." },
  { term: "Communication structurée", definition: "Format belge de référence de paiement: +++XXX/XXXX/XXXXX+++" },
  { term: "RGPD", definition: "Règlement Général sur la Protection des Données. Loi européenne sur la vie privée." },
  { term: "HITL", definition: "Human-in-the-Loop. Contrôle humain requis avant certaines actions automatisées." },
  { term: "Workflow", definition: "Flux de travail automatisé déclenchant des actions selon des règles définies." },
  { term: "MCP", definition: "Model Context Protocol. Protocole d'intégration avec des systèmes IA externes." },
  { term: "TokenDEAL", definition: "Monnaie virtuelle interne utilisable pour acheter des fonctionnalités." },
  { term: "Template", definition: "Modèle de document réutilisable avec mise en page prédéfinie." },
  { term: "Filigrane", definition: "Image ou texte semi-transparent ajouté en arrière-plan d'un document." },
  { term: "Mode Chantier", definition: "Interface adaptée aux conditions de terrain avec gros boutons." },
  { term: "Transcription IA", definition: "Conversion de la voix en texte par intelligence artificielle." },
];

// Tutoriels vidéo populaires
const POPULAR_TUTORIALS = [
  { id: "quick-start", title: "Démarrage rapide", duration: "3:45", views: 12500, thumbnail: "/tutorials/quick-start.jpg" },
  { id: "voice-quote", title: "Créer un devis en dictant", duration: "5:20", views: 8300, thumbnail: "/tutorials/voice.jpg" },
  { id: "pdf-pro", title: "PDF professionnels", duration: "7:15", views: 6100, thumbnail: "/tutorials/pdf.jpg" },
];

export default function UserGuidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const filteredCategories = searchQuery
    ? CATEGORIES.map(cat => ({
        ...cat,
        articles: cat.articles.filter(a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.articles.length > 0)
    : CATEGORIES;

  const filteredGlossary = searchQuery
    ? GLOSSARY.filter(g =>
        g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.definition.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : GLOSSARY;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <DealLogo variant="white" size="md" />
            <div>
              <h1 className="text-3xl font-bold">Mode d'emploi DEAL</h1>
              <p className="text-white/80">Documentation complète et tutoriels</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <Input
              placeholder="Rechercher dans la documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <Tabs defaultValue="guides" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="guides" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="h-4 w-4" />
              Vidéos
            </TabsTrigger>
            <TabsTrigger value="glossary" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Glossaire
            </TabsTrigger>
          </TabsList>

          {/* Guides */}
          <TabsContent value="guides" className="space-y-8">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Sidebar catégories */}
              <div className="md:col-span-1">
                <nav className="space-y-1 sticky top-4">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeCategory === cat.id
                          ? "bg-[#1E3A5F] text-white"
                          : "hover:bg-muted"
                      }`}
                    >
                      <cat.icon className={`h-5 w-5 ${activeCategory === cat.id ? "text-[#C9A962]" : cat.color}`} />
                      <span className="font-medium">{cat.title}</span>
                      <Badge variant="outline" className="ml-auto">
                        {cat.articles.length}
                      </Badge>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Articles */}
              <div className="md:col-span-3">
                <AnimatePresence mode="wait">
                  {filteredCategories.map((cat) => (
                    cat.id === activeCategory && (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <cat.icon className={`h-8 w-8 ${cat.color}`} />
                          <h2 className="text-2xl font-bold">{cat.title}</h2>
                        </div>

                        <div className="grid gap-4">
                          {cat.articles.map((article, index) => (
                            <motion.div
                              key={article.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                                <CardContent className="p-4 flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center group-hover:bg-[#1E3A5F] transition-colors">
                                    <BookOpen className="h-5 w-5 text-[#1E3A5F] group-hover:text-white transition-colors" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium group-hover:text-[#1E3A5F] transition-colors">
                                      {article.title}
                                    </h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {article.duration}
                                      </span>
                                      <Badge variant={
                                        article.difficulty === "débutant" ? "default" :
                                        article.difficulty === "intermédiaire" ? "secondary" :
                                        "outline"
                                      } className="text-xs">
                                        {article.difficulty}
                                      </Badge>
                                    </div>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#1E3A5F] transition-colors" />
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Vidéos */}
          <TabsContent value="videos" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-[#C9A962]" />
                Tutoriels populaires
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {POPULAR_TUTORIALS.map((video) => (
                  <Card key={video.id} className="overflow-hidden group cursor-pointer">
                    <div className="relative aspect-video bg-[#1E3A5F]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#C9A962] transition-colors">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium group-hover:text-[#1E3A5F] transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {video.views.toLocaleString()} vues
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Liste par catégorie */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Tous les tutoriels</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => (
                  <Card key={cat.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <cat.icon className={`h-5 w-5 ${cat.color}`} />
                        {cat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {cat.articles.slice(0, 3).map((article) => (
                          <li key={article.id} className="flex items-center gap-2 text-sm">
                            <Play className="h-3 w-3 text-muted-foreground" />
                            <span className="hover:text-[#1E3A5F] cursor-pointer">{article.title}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Glossaire */}
          <TabsContent value="glossary" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Glossaire DEAL
                </CardTitle>
                <CardDescription>
                  Définitions des termes utilisés dans l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {filteredGlossary.map((item, index) => (
                    <motion.div
                      key={item.term}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="py-4"
                    >
                      <dt className="font-semibold text-[#1E3A5F]">{item.term}</dt>
                      <dd className="text-muted-foreground mt-1">{item.definition}</dd>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Help CTA */}
        <Card className="mt-12 bg-gradient-to-r from-[#1E3A5F] to-[#0D1B2A] text-white">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Besoin d'aide supplémentaire ?</h3>
              <p className="text-white/80">
                Notre équipe support est disponible pour répondre à vos questions.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                FAQ
              </Button>
              <Button className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#C9A962]/90">
                Contacter le support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
