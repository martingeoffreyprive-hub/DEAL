"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Wrench,
  Zap,
  Paintbrush,
  Home,
  Car,
  Leaf,
  Hammer,
  Settings,
  BookOpen,
  Save,
  X,
  GripVertical,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DealLoadingSpinner } from "@/components/brand";

interface Sector {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  usersCount: number;
  quotesCount: number;
  aiVocabulary: string[];
  createdAt: string;
}

const ICON_OPTIONS = [
  { key: "wrench", icon: Wrench, label: "Clé" },
  { key: "zap", icon: Zap, label: "Électricité" },
  { key: "paintbrush", icon: Paintbrush, label: "Peinture" },
  { key: "home", icon: Home, label: "Maison" },
  { key: "car", icon: Car, label: "Voiture" },
  { key: "leaf", icon: Leaf, label: "Jardin" },
  { key: "hammer", icon: Hammer, label: "Construction" },
  { key: "settings", icon: Settings, label: "Général" },
];

const COLOR_OPTIONS = [
  { key: "blue", color: "#3B82F6", label: "Bleu" },
  { key: "green", color: "#10B981", label: "Vert" },
  { key: "amber", color: "#F59E0B", label: "Ambre" },
  { key: "red", color: "#EF4444", label: "Rouge" },
  { key: "purple", color: "#8B5CF6", label: "Violet" },
  { key: "pink", color: "#EC4899", label: "Rose" },
  { key: "cyan", color: "#06B6D4", label: "Cyan" },
  { key: "coral", color: "#E85A5A", label: "Corail" },
];

// Mock data
const MOCK_SECTORS: Sector[] = [
  {
    id: "1",
    key: "plomberie",
    name: "Plomberie",
    description: "Installation et réparation de systèmes de plomberie",
    icon: "wrench",
    color: "#3B82F6",
    isActive: true,
    usersCount: 156,
    quotesCount: 1234,
    aiVocabulary: ["tuyau", "robinet", "chauffe-eau", "fuite", "siphon", "canalisation"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    key: "electricite",
    name: "Électricité",
    description: "Travaux électriques et installations",
    icon: "zap",
    color: "#F59E0B",
    isActive: true,
    usersCount: 143,
    quotesCount: 987,
    aiVocabulary: ["câble", "tableau électrique", "prise", "disjoncteur", "LED"],
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    key: "peinture",
    name: "Peinture",
    description: "Travaux de peinture intérieure et extérieure",
    icon: "paintbrush",
    color: "#EC4899",
    isActive: true,
    usersCount: 98,
    quotesCount: 654,
    aiVocabulary: ["peinture", "enduit", "rouleau", "sous-couche", "finition"],
    createdAt: "2024-01-15",
  },
  {
    id: "4",
    key: "chauffage",
    name: "Chauffage",
    description: "Installation et maintenance de systèmes de chauffage",
    icon: "home",
    color: "#EF4444",
    isActive: true,
    usersCount: 87,
    quotesCount: 543,
    aiVocabulary: ["chaudière", "radiateur", "thermostat", "PAC", "pompe à chaleur"],
    createdAt: "2024-01-15",
  },
  {
    id: "5",
    key: "jardinage",
    name: "Jardinage",
    description: "Entretien et aménagement de jardins",
    icon: "leaf",
    color: "#10B981",
    isActive: false,
    usersCount: 45,
    quotesCount: 234,
    aiVocabulary: ["tonte", "taille", "haie", "arbre", "pelouse"],
    createdAt: "2024-02-20",
  },
];

export default function AdminSectorsPage() {
  const { toast } = useToast();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [vocabularyModalSector, setVocabularyModalSector] = useState<Sector | null>(null);
  const [newVocabularyWord, setNewVocabularyWord] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    icon: "wrench",
    color: "#3B82F6",
    isActive: true,
  });

  const loadSectors = useCallback(async () => {
    setLoading(true);
    try {
      // In real app, fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      setSectors(MOCK_SECTORS);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les secteurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSectors();
  }, [loadSectors]);

  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(search.toLowerCase()) ||
    sector.key.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      icon: "wrench",
      color: "#3B82F6",
      isActive: true,
    });
    setIsCreateMode(true);
    setEditingSector({} as Sector);
  };

  const handleOpenEdit = (sector: Sector) => {
    setFormData({
      key: sector.key,
      name: sector.name,
      description: sector.description,
      icon: sector.icon,
      color: sector.color,
      isActive: sector.isActive,
    });
    setIsCreateMode(false);
    setEditingSector(sector);
  };

  const handleSave = async () => {
    if (!formData.key || !formData.name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isCreateMode) {
        // Create new sector
        const newSector: Sector = {
          id: Date.now().toString(),
          ...formData,
          usersCount: 0,
          quotesCount: 0,
          aiVocabulary: [],
          createdAt: new Date().toISOString(),
        };
        setSectors([...sectors, newSector]);
        toast({
          title: "Secteur créé",
          description: `Le secteur "${formData.name}" a été créé`,
        });
      } else {
        // Update existing
        setSectors(sectors.map(s =>
          s.id === editingSector?.id
            ? { ...s, ...formData }
            : s
        ));
        toast({
          title: "Secteur mis à jour",
          description: `Le secteur "${formData.name}" a été mis à jour`,
        });
      }
      setEditingSector(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "L'opération a échoué",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingSector) return;

    try {
      setSectors(sectors.filter(s => s.id !== deletingSector.id));
      toast({
        title: "Secteur supprimé",
        description: `Le secteur "${deletingSector.name}" a été supprimé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "La suppression a échoué",
        variant: "destructive",
      });
    } finally {
      setDeletingSector(null);
    }
  };

  const handleToggleActive = async (sector: Sector) => {
    setSectors(sectors.map(s =>
      s.id === sector.id ? { ...s, isActive: !s.isActive } : s
    ));
    toast({
      title: sector.isActive ? "Secteur désactivé" : "Secteur activé",
      description: `Le secteur "${sector.name}" a été ${sector.isActive ? "désactivé" : "activé"}`,
    });
  };

  const handleAddVocabulary = () => {
    if (!vocabularyModalSector || !newVocabularyWord.trim()) return;

    setSectors(sectors.map(s =>
      s.id === vocabularyModalSector.id
        ? { ...s, aiVocabulary: [...s.aiVocabulary, newVocabularyWord.trim()] }
        : s
    ));
    setNewVocabularyWord("");
    toast({
      title: "Mot ajouté",
      description: `"${newVocabularyWord.trim()}" ajouté au vocabulaire`,
    });
  };

  const handleRemoveVocabulary = (word: string) => {
    if (!vocabularyModalSector) return;

    setSectors(sectors.map(s =>
      s.id === vocabularyModalSector.id
        ? { ...s, aiVocabulary: s.aiVocabulary.filter(w => w !== word) }
        : s
    ));
  };

  const getIconComponent = (iconKey: string) => {
    const iconOption = ICON_OPTIONS.find(i => i.key === iconKey);
    return iconOption?.icon || Settings;
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
          <h1 className="text-2xl font-bold">Gestion des secteurs</h1>
          <p className="text-muted-foreground">
            {sectors.length} secteurs configurés
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSectors} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleOpenCreate} className="bg-[#E85A5A] hover:bg-[#D64545]">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau secteur
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un secteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sectors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredSectors.map((sector, index) => {
            const IconComponent = getIconComponent(sector.icon);

            return (
              <motion.div
                key={sector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  !sector.isActive && "opacity-60"
                )}>
                  {/* Color bar */}
                  <div
                    className="h-1"
                    style={{ backgroundColor: sector.color }}
                  />

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${sector.color}20` }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: sector.color }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{sector.name}</h3>
                          <Badge
                            variant="outline"
                            className={sector.isActive
                              ? "bg-green-500/10 text-green-500 border-green-500/30"
                              : "bg-gray-500/10 text-gray-500 border-gray-500/30"
                            }
                          >
                            {sector.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {sector.description}
                        </p>

                        {/* Stats */}
                        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                          <span>{sector.usersCount} utilisateurs</span>
                          <span>{sector.quotesCount} devis</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(sector)}
                        className="flex-1"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVocabularyModalSector(sector)}
                        className="flex-1"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Vocabulaire
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingSector(sector)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredSectors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun secteur trouvé</p>
        </div>
      )}

      {/* Edit/Create Modal */}
      <Dialog open={!!editingSector} onOpenChange={() => setEditingSector(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isCreateMode ? "Nouveau secteur" : "Modifier le secteur"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Clé technique *</Label>
                <Input
                  id="key"
                  placeholder="ex: plomberie"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                  disabled={!isCreateMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nom affiché *</Label>
                <Input
                  id="name"
                  placeholder="ex: Plomberie"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description du secteur..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Icon selection */}
            <div className="space-y-2">
              <Label>Icône</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: option.key })}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all",
                        formData.icon === option.key
                          ? "border-[#E85A5A] bg-[#E85A5A]/10"
                          : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color selection */}
            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: option.color })}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      formData.color === option.color
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: option.color }}
                  />
                ))}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="active">Secteur actif</Label>
                <p className="text-xs text-muted-foreground">
                  Les secteurs inactifs ne sont pas proposés aux utilisateurs
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSector(null)}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-[#E85A5A] hover:bg-[#D64545]">
              <Save className="w-4 h-4 mr-2" />
              {isCreateMode ? "Créer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vocabulary Modal (Story 8.2) */}
      <Dialog open={!!vocabularyModalSector} onOpenChange={() => setVocabularyModalSector(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#E85A5A]" />
              Vocabulaire IA - {vocabularyModalSector?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ces mots aident l'IA à mieux comprendre le contexte des transcriptions dans ce secteur.
            </p>

            {/* Add word */}
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un mot..."
                value={newVocabularyWord}
                onChange={(e) => setNewVocabularyWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddVocabulary()}
              />
              <Button onClick={handleAddVocabulary} disabled={!newVocabularyWord.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Words list */}
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 rounded-lg bg-muted/50">
              {vocabularyModalSector?.aiVocabulary.length === 0 ? (
                <p className="text-sm text-muted-foreground w-full text-center py-4">
                  Aucun mot dans le vocabulaire
                </p>
              ) : (
                vocabularyModalSector?.aiVocabulary.map((word) => (
                  <Badge
                    key={word}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {word}
                    <button
                      onClick={() => handleRemoveVocabulary(word)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setVocabularyModalSector(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSector} onOpenChange={() => setDeletingSector(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce secteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les {deletingSector?.usersCount} utilisateurs
              utilisant ce secteur devront en choisir un autre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
