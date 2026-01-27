"use client";

/**
 * Settings - Widget Configuration Page
 * Configuration du widget intégrable pour sites clients
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Code,
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key?: string; // Only on creation
  permissions: string[];
  rate_limit_per_hour: number;
  last_used_at: string | null;
  revoked: boolean;
  created_at: string;
  expires_at: string | null;
}

export default function WidgetSettingsPage() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      const data = await response.json();
      setApiKeys(data.api_keys || []);
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à votre clé API",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          permissions: ["widget:create_lead"],
          rate_limit_per_hour: 100,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setNewlyCreatedKey(data.api_key.key);
      setApiKeys([data.api_key, ...apiKeys]);
      setNewKeyName("");

      toast({
        title: "Clé API créée",
        description: "Conservez cette clé en lieu sûr !",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la clé API",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const revokeApiKey = async (id: string) => {
    if (!confirm("Révoquer cette clé API ? Cette action est irréversible.")) return;

    try {
      await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
      setApiKeys(apiKeys.map(k => k.id === id ? { ...k, revoked: true } : k));
      toast({
        title: "Clé révoquée",
        description: "La clé API a été désactivée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer la clé",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: `${label} copié dans le presse-papier`,
    });
  };

  const activeKey = apiKeys.find(k => !k.revoked);

  const embedCode = `<!-- DEAL Widget -->
<script
  src="https://deal.be/widget.js"
  data-api-key="${activeKey?.key || 'YOUR_API_KEY'}"
  data-theme="light"
  data-position="bottom-right"
  async
></script>`;

  const iframeCode = `<iframe
  src="https://deal.be/widget/embed?key=${activeKey?.key || 'YOUR_API_KEY'}"
  width="400"
  height="500"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>`;

  return (
    <>
      <div className="container max-w-4xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Code className="h-8 w-8 text-[#C9A962]" />
              Widget & Intégrations
            </h1>
            <p className="text-muted-foreground mt-2">
              Intégrez un formulaire de demande de devis sur votre site web
            </p>
          </div>

          {/* Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700">Recevez des demandes automatiquement</p>
                <p className="text-blue-600">
                  Ajoutez le widget DEAL sur votre site pour recevoir des demandes de devis
                  directement dans votre tableau de bord. Les workflows peuvent les traiter automatiquement.
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="keys">
            <TabsList>
              <TabsTrigger value="keys">Clés API</TabsTrigger>
              <TabsTrigger value="embed">Code d'intégration</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-4">
              {/* Create new key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Nouvelle clé API
                  </CardTitle>
                  <CardDescription>
                    Créez une clé pour connecter votre site au widget DEAL
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nom de la clé (ex: Site principal)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <Button
                      onClick={createApiKey}
                      disabled={isCreating}
                      className="bg-[#1E3A5F] gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Créer
                    </Button>
                  </div>

                  {/* Newly created key */}
                  {newlyCreatedKey && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-700">Clé créée avec succès !</p>
                          <p className="text-sm text-green-600">
                            Copiez cette clé maintenant, elle ne sera plus visible.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Input
                          value={newlyCreatedKey}
                          readOnly
                          className="font-mono text-xs bg-white"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(newlyCreatedKey, "Clé API")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Existing keys */}
              <Card>
                <CardHeader>
                  <CardTitle>Vos clés API</CardTitle>
                </CardHeader>
                <CardContent>
                  {apiKeys.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucune clé API créée
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            key.revoked ? "bg-gray-50 opacity-60" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              key.revoked ? "bg-gray-100" : "bg-[#1E3A5F]/10"
                            }`}>
                              <Key className={`h-5 w-5 ${
                                key.revoked ? "text-gray-400" : "text-[#1E3A5F]"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">{key.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Créée le {new Date(key.created_at).toLocaleDateString("fr-BE")}
                                {key.last_used_at && (
                                  <> • Dernière utilisation: {new Date(key.last_used_at).toLocaleDateString("fr-BE")}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={key.revoked ? "destructive" : "default"}>
                              {key.revoked ? "Révoquée" : `${key.rate_limit_per_hour}/h`}
                            </Badge>
                            {!key.revoked && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => revokeApiKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Embed Code Tab */}
            <TabsContent value="embed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Script JavaScript</CardTitle>
                  <CardDescription>
                    Ajoutez ce code avant la fermeture de {"</body>"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm">
                      {embedCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(embedCode, "Code")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>iFrame (alternative)</CardTitle>
                  <CardDescription>
                    Intégrez le widget dans une zone spécifique de votre page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm">
                      {iframeCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(iframeCode, "Code iFrame")}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options de configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">data-theme</Label>
                        <p className="text-xs text-muted-foreground">light, dark, auto</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">data-position</Label>
                        <p className="text-xs text-muted-foreground">bottom-right, bottom-left, inline</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">data-color</Label>
                        <p className="text-xs text-muted-foreground">Code hex (#1E3A5F)</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">data-language</Label>
                        <p className="text-xs text-muted-foreground">fr, nl, en</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du widget</CardTitle>
                  <CardDescription>
                    Voici comment le widget apparaîtra sur votre site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] relative">
                    {/* Simulated widget */}
                    <div className="absolute bottom-4 right-4 w-80">
                      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="bg-[#1E3A5F] p-4 text-white">
                          <h3 className="font-semibold">Demande de devis</h3>
                          <p className="text-sm text-white/80">Réponse sous 24h</p>
                        </div>
                        <div className="p-4 space-y-3">
                          <Input placeholder="Votre nom" disabled />
                          <Input placeholder="Email" disabled />
                          <Input placeholder="Téléphone" disabled />
                          <textarea
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="Décrivez votre projet..."
                            rows={3}
                            disabled
                          />
                          <Button className="w-full bg-[#C9A962] hover:bg-[#B89952]" disabled>
                            Envoyer ma demande
                          </Button>
                        </div>
                        <div className="px-4 pb-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          Propulsé par DEAL
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Aperçu de votre page web...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  );
}
