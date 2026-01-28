"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  RefreshCw,
  LayoutTemplate,
  Star,
  Download,
  Eye,
  Pencil,
  Trash2,
  Copy,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  Sparkles,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DealLoadingSpinner } from "@/components/brand";

interface Template {
  id: string;
  name: string;
  description: string;
  sector: string;
  category: "official" | "community" | "premium";
  items: TemplateItem[];
  downloads: number;
  rating: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TemplateItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

const SECTORS = {
  plomberie: "Plomberie",
  electricite: "Électricité",
  peinture: "Peinture",
  chauffage: "Chauffage",
  menuiserie: "Menuiserie",
  general: "Général",
};

// Mock data
const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Installation chauffe-eau",
    description: "Template complet pour l'installation d'un chauffe-eau avec tous les accessoires",
    sector: "plomberie",
    category: "official",
    items: [
      { description: "Chauffe-eau 200L", quantity: 1, unit: "u", unitPrice: 450 },
      { description: "Kit raccordement", quantity: 1, unit: "u", unitPrice: 85 },
      { description: "Main d'œuvre installation", quantity: 3, unit: "h", unitPrice: 55 },
    ],
    downloads: 1234,
    rating: 4.8,
    isPublished: true,
    isFeatured: true,
    createdBy: "DEAL Team",
    createdAt: "2024-01-15",
    updatedAt: "2024-03-10",
  },
  {
    id: "2",
    name: "Rénovation tableau électrique",
    description: "Mise aux normes d'un tableau électrique standard",
    sector: "electricite",
    category: "official",
    items: [
      { description: "Tableau 2 rangées", quantity: 1, unit: "u", unitPrice: 180 },
      { description: "Disjoncteurs", quantity: 12, unit: "u", unitPrice: 15 },
      { description: "Différentiel 30mA", quantity: 2, unit: "u", unitPrice: 45 },
      { description: "Main d'œuvre", quantity: 4, unit: "h", unitPrice: 60 },
    ],
    downloads: 876,
    rating: 4.6,
    isPublished: true,
    isFeatured: false,
    createdBy: "DEAL Team",
    createdAt: "2024-02-01",
    updatedAt: "2024-03-05",
  },
  {
    id: "3",
    name: "Peinture chambre complète",
    description: "Peinture complète d'une chambre standard 12m²",
    sector: "peinture",
    category: "community",
    items: [
      { description: "Sous-couche", quantity: 5, unit: "L", unitPrice: 12 },
      { description: "Peinture finition", quantity: 10, unit: "L", unitPrice: 25 },
      { description: "Préparation murs", quantity: 1, unit: "forfait", unitPrice: 150 },
      { description: "Application 2 couches", quantity: 1, unit: "forfait", unitPrice: 280 },
    ],
    downloads: 543,
    rating: 4.2,
    isPublished: true,
    isFeatured: false,
    createdBy: "Jean P.",
    createdAt: "2024-02-15",
    updatedAt: "2024-02-15",
  },
  {
    id: "4",
    name: "Entretien chaudière gaz",
    description: "Entretien annuel obligatoire chaudière gaz",
    sector: "chauffage",
    category: "premium",
    items: [
      { description: "Vérification complète", quantity: 1, unit: "forfait", unitPrice: 120 },
      { description: "Nettoyage brûleur", quantity: 1, unit: "forfait", unitPrice: 45 },
      { description: "Analyse combustion", quantity: 1, unit: "u", unitPrice: 35 },
      { description: "Attestation", quantity: 1, unit: "u", unitPrice: 0 },
    ],
    downloads: 432,
    rating: 4.9,
    isPublished: true,
    isFeatured: true,
    createdBy: "DEAL Team",
    createdAt: "2024-01-20",
    updatedAt: "2024-03-01",
  },
];

export default function AdminTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTemplates(MOCK_TEMPLATES);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sectorFilter === "all" || template.sector === sectorFilter;
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesSector && matchesCategory;
  });

  const handleTogglePublish = (template: Template) => {
    setTemplates(templates.map(t =>
      t.id === template.id ? { ...t, isPublished: !t.isPublished } : t
    ));
    toast({
      title: template.isPublished ? "Template dépublié" : "Template publié",
      description: `"${template.name}" ${template.isPublished ? "retiré de" : "ajouté à"} la marketplace`,
    });
  };

  const handleToggleFeatured = (template: Template) => {
    setTemplates(templates.map(t =>
      t.id === template.id ? { ...t, isFeatured: !t.isFeatured } : t
    ));
    toast({
      title: template.isFeatured ? "Template non mis en avant" : "Template mis en avant",
    });
  };

  const getCategoryBadge = (category: Template["category"]) => {
    switch (category) {
      case "official":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Officiel</Badge>;
      case "community":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Communauté</Badge>;
      case "premium":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">Premium</Badge>;
    }
  };

  const stats = {
    total: templates.length,
    published: templates.filter(t => t.isPublished).length,
    featured: templates.filter(t => t.isFeatured).length,
    totalDownloads: templates.reduce((sum, t) => sum + t.downloads, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DealLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates Marketplace</h1>
          <p className="text-muted-foreground">
            Gérez les templates de devis disponibles pour les utilisateurs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadTemplates} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button className="bg-[#E85A5A] hover:bg-[#D64545]">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={LayoutTemplate} label="Total templates" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle} label="Publiés" value={stats.published} color="green" />
        <StatCard icon={Star} label="Mis en avant" value={stats.featured} color="amber" />
        <StatCard icon={Download} label="Téléchargements" value={stats.totalDownloads} color="purple" />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un template..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous secteurs</SelectItem>
                {Object.entries(SECTORS).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="official">Officiel</SelectItem>
                <SelectItem value="community">Communauté</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer",
                !template.isPublished && "opacity-60"
              )}>
                {/* Featured badge */}
                {template.isFeatured && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-amber-500 text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}

                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E85A5A]/10 flex items-center justify-center flex-shrink-0">
                      <LayoutTemplate className="w-5 h-5 text-[#E85A5A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryBadge(template.category)}
                        <Badge variant="outline" className="text-xs">
                          {SECTORS[template.sector as keyof typeof SECTORS]}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {template.description}
                  </p>

                  {/* Items preview */}
                  <div className="text-xs text-muted-foreground mb-3">
                    {template.items.length} lignes • Total: {
                      new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
                        .format(template.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0))
                    }
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {template.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {template.rating}
                    </span>
                    <span className="text-xs">par {template.createdBy}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(template)}
                      className="flex-1"
                    >
                      {template.isPublished ? (
                        <>Dépublier</>
                      ) : (
                        <>Publier</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(template)}
                      className={cn(template.isFeatured && "text-amber-500")}
                    >
                      <Star className={cn("w-4 h-4", template.isFeatured && "fill-current")} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <LayoutTemplate className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun template trouvé</p>
        </div>
      )}

      {/* Template Detail Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-[#E85A5A]" />
              {selectedTemplate?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getCategoryBadge(selectedTemplate.category)}
                <Badge variant="outline">
                  {SECTORS[selectedTemplate.sector as keyof typeof SECTORS]}
                </Badge>
                {selectedTemplate.isFeatured && (
                  <Badge className="bg-amber-500 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground">{selectedTemplate.description}</p>

              {/* Items table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-4 py-2">Description</th>
                      <th className="text-right px-4 py-2">Qté</th>
                      <th className="text-right px-4 py-2">Unité</th>
                      <th className="text-right px-4 py-2">Prix unit.</th>
                      <th className="text-right px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTemplate.items.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="text-right px-4 py-2">{item.quantity}</td>
                        <td className="text-right px-4 py-2">{item.unit}</td>
                        <td className="text-right px-4 py-2">{item.unitPrice} €</td>
                        <td className="text-right px-4 py-2 font-medium">
                          {(item.quantity * item.unitPrice).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted font-bold">
                      <td colSpan={4} className="text-right px-4 py-2">Total HT</td>
                      <td className="text-right px-4 py-2">
                        {selectedTemplate.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2)} €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Download className="w-4 h-4" />
                  {selectedTemplate.downloads} téléchargements
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4 text-amber-500" />
                  {selectedTemplate.rating} / 5
                </span>
                <span className="text-muted-foreground">
                  Créé par {selectedTemplate.createdBy}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Fermer
            </Button>
            <Button className="gap-2">
              <Pencil className="w-4 h-4" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "blue" | "green" | "amber" | "purple";
}) {
  const colorStyles = {
    blue: "bg-blue-500/10 text-blue-500",
    green: "bg-green-500/10 text-green-500",
    amber: "bg-amber-500/10 text-amber-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorStyles[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
