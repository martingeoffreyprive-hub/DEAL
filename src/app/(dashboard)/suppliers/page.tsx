"use client";

/**
 * Suppliers Management Page
 * Gestion des fournisseurs et grossistes
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  CheckCircle,
  Link,
  ExternalLink,
  Settings,
  Trash2,
  Package,
} from "lucide-react";
import { SUPPLIER_CATEGORIES, POPULAR_BELGIAN_SUPPLIERS } from "@/lib/suppliers/constants";

interface Supplier {
  id: string;
  name: string;
  category: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  is_verified: boolean;
  rating?: number;
}

interface UserSupplier {
  id: string;
  supplier_id: string;
  custom_code?: string;
  discount_rate?: number;
  notes?: string;
  supplier: Supplier;
}

export default function SuppliersPage() {
  const { toast } = useToast();
  const [userSuppliers, setUserSuppliers] = useState<UserSupplier[]>([]);
  const [verifiedSuppliers, setVerifiedSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Simulate fetching data
    // In production, this would call the API
    setVerifiedSuppliers(POPULAR_BELGIAN_SUPPLIERS.map((s, i) => ({
      id: `supplier-${i}`,
      ...s,
      is_verified: true,
    })));
    setIsLoading(false);
  };

  const addSupplier = async (supplier: Supplier) => {
    try {
      // Simulate adding supplier
      const newUserSupplier: UserSupplier = {
        id: `us-${Date.now()}`,
        supplier_id: supplier.id,
        supplier,
      };
      setUserSuppliers([...userSuppliers, newUserSupplier]);

      toast({
        title: "Fournisseur ajouté",
        description: `${supplier.name} a été ajouté à vos fournisseurs`,
      });
      setShowAddDialog(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fournisseur",
        variant: "destructive",
      });
    }
  };

  const removeSupplier = async (id: string) => {
    if (!confirm("Retirer ce fournisseur de votre liste ?")) return;

    setUserSuppliers(userSuppliers.filter(s => s.id !== id));
    toast({
      title: "Fournisseur retiré",
      description: "Le fournisseur a été retiré de votre liste",
    });
  };

  const filteredSuppliers = verifiedSuppliers.filter(supplier => {
    const matchesSearch = !searchQuery ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" ||
      supplier.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Object.entries(SUPPLIER_CATEGORIES);

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
                <Building2 className="h-8 w-8 text-[#C9A962]" />
                Fournisseurs
              </h1>
              <p className="text-muted-foreground mt-2">
                Gérez vos fournisseurs et grossistes
              </p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-[#1E3A5F]">
                  <Plus className="h-4 w-4" />
                  Ajouter un fournisseur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un fournisseur</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un fournisseur vérifié ou ajoutez le vôtre
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un fournisseur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category filters */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory("all")}
                    >
                      Tous
                    </Badge>
                    {categories.map(([key, label]) => (
                      <Badge
                        key={key}
                        variant={selectedCategory === key ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(key)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>

                  {/* Suppliers list */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredSuppliers.map((supplier) => {
                      const isAdded = userSuppliers.some(us => us.supplier_id === supplier.id);
                      return (
                        <div
                          key={supplier.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isAdded ? "bg-green-50 border-green-200" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-[#1E3A5F]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{supplier.name}</p>
                                {supplier.is_verified && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {SUPPLIER_CATEGORIES[supplier.category as keyof typeof SUPPLIER_CATEGORIES]}
                                {supplier.city && ` • ${supplier.city}`}
                              </p>
                            </div>
                          </div>
                          {isAdded ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Ajouté
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addSupplier(supplier)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add custom supplier */}
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter un fournisseur personnalisé
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* My Suppliers */}
          <Card>
            <CardHeader>
              <CardTitle>Mes fournisseurs</CardTitle>
              <CardDescription>
                Fournisseurs liés à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">Aucun fournisseur</h3>
                  <p className="text-muted-foreground mb-4">
                    Ajoutez vos fournisseurs pour les utiliser dans vos devis
                  </p>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-[#1E3A5F]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un fournisseur
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {userSuppliers.map((us, index) => (
                    <motion.div
                      key={us.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-[#1E3A5F]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{us.supplier.name}</h3>
                                  {us.supplier.is_verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Vérifié
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {SUPPLIER_CATEGORIES[us.supplier.category as keyof typeof SUPPLIER_CATEGORIES]}
                                </p>
                                {us.custom_code && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Code client: {us.custom_code}
                                  </p>
                                )}
                                {us.discount_rate && (
                                  <Badge variant="outline" className="mt-2">
                                    Remise: {us.discount_rate}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSupplier(us.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {us.supplier.website && (
                              <Button variant="outline" size="sm" className="gap-1" asChild>
                                <a href={us.supplier.website} target="_blank" rel="noopener noreferrer">
                                  <Globe className="h-3 w-3" />
                                  Site web
                                </a>
                              </Button>
                            )}
                            {us.supplier.contact_phone && (
                              <Button variant="outline" size="sm" className="gap-1" asChild>
                                <a href={`tel:${us.supplier.contact_phone}`}>
                                  <Phone className="h-3 w-3" />
                                  Appeler
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="gap-1">
                              <Package className="h-3 w-3" />
                              Catalogue
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verified Suppliers Directory */}
          <Card>
            <CardHeader>
              <CardTitle>Annuaire des fournisseurs vérifiés</CardTitle>
              <CardDescription>
                Fournisseurs partenaires avec des conditions préférentielles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {categories.slice(0, 6).map(([key, label]) => {
                  const count = verifiedSuppliers.filter(s => s.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCategory(key);
                        setShowAddDialog(true);
                      }}
                      className="p-4 border rounded-lg hover:border-[#C9A962] hover:bg-[#C9A962]/5 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Building2 className="h-5 w-5 text-[#1E3A5F]" />
                        <Badge variant="outline">{count}</Badge>
                      </div>
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} fournisseur{count > 1 ? "s" : ""} vérifié{count > 1 ? "s" : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
