"use client";

/**
 * Templates Marketplace Page
 * Marketplace de modèles de documents
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutTemplate,
  Search,
  Star,
  Download,
  Eye,
  ShoppingCart,
  Coins,
  CheckCircle,
  Lock,
  Filter,
  Plus,
  Upload,
  Heart,
  TrendingUp,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  preview_image_url?: string;
  is_premium: boolean;
  price: number;
  downloads_count: number;
  rating?: number;
  is_owned?: boolean;
}

const CATEGORIES = [
  { id: "all", label: "Tous" },
  { id: "construction", label: "Construction" },
  { id: "renovation", label: "Rénovation" },
  { id: "plumbing", label: "Plomberie" },
  { id: "electrical", label: "Électricité" },
  { id: "painting", label: "Peinture" },
  { id: "modern", label: "Moderne" },
  { id: "classic", label: "Classique" },
  { id: "minimal", label: "Minimal" },
];

const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Devis Rénovation Pro",
    description: "Template moderne pour les travaux de rénovation",
    type: "quote",
    category: "renovation",
    is_premium: false,
    price: 0,
    downloads_count: 1250,
    rating: 4.8,
    is_owned: true,
  },
  {
    id: "2",
    name: "Facture Élégante",
    description: "Design épuré et professionnel",
    type: "invoice",
    category: "modern",
    is_premium: true,
    price: 150,
    downloads_count: 890,
    rating: 4.9,
  },
  {
    id: "3",
    name: "Devis Plomberie Détaillé",
    description: "Avec sections sanitaires et chauffage",
    type: "quote",
    category: "plumbing",
    is_premium: true,
    price: 200,
    downloads_count: 654,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Template Électricité",
    description: "Conforme aux normes RGIE",
    type: "quote",
    category: "electrical",
    is_premium: false,
    price: 0,
    downloads_count: 2100,
    rating: 4.6,
  },
  {
    id: "5",
    name: "Devis Peinture Express",
    description: "Calcul automatique des surfaces",
    type: "quote",
    category: "painting",
    is_premium: true,
    price: 100,
    downloads_count: 432,
    rating: 4.5,
  },
  {
    id: "6",
    name: "Facture Minimaliste",
    description: "Design clean et moderne",
    type: "invoice",
    category: "minimal",
    is_premium: false,
    price: 0,
    downloads_count: 1800,
    rating: 4.4,
  },
];

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [userTokens, setUserTokens] = useState(500);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" ||
      template.category === selectedCategory;

    const matchesType = selectedType === "all" ||
      template.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const purchaseTemplate = async (template: Template) => {
    if (template.is_owned) {
      toast({
        title: "Déjà possédé",
        description: "Vous possédez déjà ce modèle",
      });
      return;
    }

    if (template.price > userTokens) {
      toast({
        title: "Solde insuffisant",
        description: `Il vous faut ${template.price} tokens pour acheter ce modèle`,
        variant: "destructive",
      });
      return;
    }

    // Simulate purchase
    setUserTokens(userTokens - template.price);
    setTemplates(templates.map(t =>
      t.id === template.id ? { ...t, is_owned: true, downloads_count: t.downloads_count + 1 } : t
    ));

    toast({
      title: "Modèle acheté !",
      description: `${template.name} a été ajouté à vos modèles`,
    });
    setShowPreviewDialog(false);
  };

  const stats = {
    owned: templates.filter(t => t.is_owned).length,
    free: templates.filter(t => !t.is_premium).length,
    premium: templates.filter(t => t.is_premium).length,
  };

  return (
    <>
      <div className="container max-w-6xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <LayoutTemplate className="h-8 w-8 text-[#C9A962]" />
                Marketplace
              </h1>
              <p className="text-muted-foreground mt-2">
                Découvrez des modèles professionnels pour vos devis et factures
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#1E3A5F]/10 px-4 py-2 rounded-lg">
                <Coins className="h-5 w-5 text-[#C9A962]" />
                <span className="font-bold">{userTokens}</span>
                <span className="text-sm text-muted-foreground">tokens</span>
              </div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Soumettre un modèle
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.owned}</p>
                  <p className="text-xs text-muted-foreground">Modèles possédés</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.free}</p>
                  <p className="text-xs text-muted-foreground">Modèles gratuits</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.premium}</p>
                  <p className="text-xs text-muted-foreground">Modèles premium</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedType} onValueChange={setSelectedType}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="quote">Devis</TabsTrigger>
                <TabsTrigger value="invoice">Factures</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  {/* Preview Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <LayoutTemplate className="h-16 w-16 text-gray-300" />
                    </div>
                    {template.is_premium && (
                      <Badge className="absolute top-2 right-2 bg-[#C9A962]">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {template.is_owned && (
                      <Badge className="absolute top-2 left-2 bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Possédé
                      </Badge>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowPreviewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Aperçu
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {template.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {template.rating}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {template.downloads_count}
                        </span>
                      </div>

                      {template.is_owned ? (
                        <Button size="sm" variant="outline">
                          Utiliser
                        </Button>
                      ) : template.is_premium ? (
                        <Button
                          size="sm"
                          className="bg-[#C9A962] hover:bg-[#B89952] gap-1"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowPreviewDialog(true);
                          }}
                        >
                          <Coins className="h-4 w-4" />
                          {template.price}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => purchaseTemplate(template)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Gratuit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <LayoutTemplate className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-lg mb-2">Aucun modèle trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos filtres de recherche
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <DialogDescription>
                {selectedTemplate?.description}
              </DialogDescription>
            </DialogHeader>

            {selectedTemplate && (
              <div className="space-y-4">
                {/* Preview */}
                <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                  <LayoutTemplate className="h-24 w-24 text-gray-300" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  {selectedTemplate.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {selectedTemplate.rating} / 5
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Download className="h-4 w-4" />
                    {selectedTemplate.downloads_count} téléchargements
                  </span>
                  <Badge variant="outline">
                    {selectedTemplate.type === "quote" ? "Devis" : "Facture"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPreviewDialog(false)}
                  >
                    Fermer
                  </Button>
                  {selectedTemplate.is_owned ? (
                    <Button className="flex-1 bg-[#1E3A5F]">
                      Utiliser ce modèle
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-[#C9A962] hover:bg-[#B89952]"
                      onClick={() => purchaseTemplate(selectedTemplate)}
                    >
                      {selectedTemplate.is_premium ? (
                        <>
                          <Coins className="h-4 w-4 mr-2" />
                          Acheter ({selectedTemplate.price} tokens)
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger (Gratuit)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
