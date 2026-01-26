"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import {
  AVAILABLE_INTEGRATIONS,
  getIntegrationsByCategory,
  type IntegrationCategory,
} from "@/lib/integrations";
import {
  ExternalLink,
  Check,
  X,
  Lock,
  Plug,
  FileSignature,
  Users,
  Calculator,
  MessageSquare,
  Loader2,
  Settings,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  cardHover,
} from "@/components/animations/page-transition";
import { DealIconD } from "@/components/brand";

const CATEGORY_INFO: Record<IntegrationCategory, { label: string; icon: React.ElementType; description: string }> = {
  signature: {
    label: "Signature électronique",
    icon: FileSignature,
    description: "Faites signer vos devis en ligne",
  },
  crm: {
    label: "CRM",
    icon: Users,
    description: "Synchronisez vos contacts et deals",
  },
  accounting: {
    label: "Comptabilité",
    icon: Calculator,
    description: "Créez des factures automatiquement",
  },
  communication: {
    label: "Communication",
    icon: MessageSquare,
    description: "Notifications et alertes",
  },
};

export default function IntegrationsPage() {
  const { toast } = useToast();
  const { plan, canUseProFeatures } = useSubscription();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  const isPro = canUseProFeatures();

  const handleConnect = async (integrationId: string) => {
    if (!isPro) {
      toast({
        title: "Fonctionnalité Pro",
        description: "Passez au plan Pro pour connecter des intégrations.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(integrationId);

    // Simulate connection (in production, this would redirect to OAuth)
    setTimeout(() => {
      setConnectedIntegrations([...connectedIntegrations, integrationId]);
      setConnecting(null);
      toast({
        title: "Intégration connectée",
        description: `${AVAILABLE_INTEGRATIONS[integrationId as keyof typeof AVAILABLE_INTEGRATIONS].name} est maintenant connecté.`,
      });
    }, 2000);
  };

  const handleDisconnect = (integrationId: string) => {
    setConnectedIntegrations(connectedIntegrations.filter((id) => id !== integrationId));
    toast({
      title: "Intégration déconnectée",
      description: "L'intégration a été déconnectée avec succès.",
    });
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero Header */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A5F] via-[#2D4A6F] to-[#0D1B2A] p-6 md:p-8"
        variants={staggerItem}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A962]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A962]/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#C9A962]/20 flex items-center justify-center">
              <Plug className="h-7 w-7 text-[#C9A962]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Intégrations
              </h1>
              <p className="text-white/70">
                Connectez vos outils préférés pour automatiser votre workflow
              </p>
            </div>
          </div>
          {!isPro && (
            <Button className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]" asChild>
              <Link href="/pricing">
                <Lock className="mr-2 h-4 w-4" />
                Débloquer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#C9A962]/10">
                  <Plug className="h-6 w-6 text-[#C9A962]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1E3A5F]">{connectedIntegrations.length}</p>
                  <p className="text-sm text-muted-foreground">Intégrations actives</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={isPro ? "bg-[#C9A962] text-[#0D1B2A]" : "bg-[#C9A962]/20 text-[#B89952]"}
                >
                  {isPro ? "Pro" : "Gratuit"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {isPro ? "Toutes les intégrations" : "Intégrations limitées"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Integration Categories */}
      <motion.div variants={staggerItem}>
        <Tabs defaultValue="signature" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1E3A5F]/5 p-1">
            {(Object.entries(CATEGORY_INFO) as [IntegrationCategory, typeof CATEGORY_INFO[IntegrationCategory]][]).map(
              ([key, { label, icon: Icon }]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2 data-[state=active]:bg-[#C9A962] data-[state=active]:text-[#0D1B2A]">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              )
            )}
          </TabsList>

          {(Object.keys(CATEGORY_INFO) as IntegrationCategory[]).map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-[#1E3A5F]">{CATEGORY_INFO[category].label}</h2>
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_INFO[category].description}
                </p>
              </div>

              <div className="grid gap-4">
                {getIntegrationsByCategory(category).map((integration) => {
                  const isConnected = connectedIntegrations.includes(integration.id);
                  const isConnecting = connecting === integration.id;

                  return (
                    <motion.div key={integration.id} {...cardHover}>
                      <Card className={`border-[#C9A962]/10 ${!integration.enabled ? "opacity-60" : ""}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-lg bg-[#C9A962]/10 flex items-center justify-center">
                                {/* Placeholder for integration logo */}
                                <span className="text-lg font-bold text-[#C9A962]">
                                  {integration.name.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-[#1E3A5F]">{integration.name}</h3>
                                  {isConnected && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      <Check className="mr-1 h-3 w-3" />
                                      Connecté
                                    </Badge>
                                  )}
                                  {!integration.enabled && (
                                    <Badge className="bg-[#C9A962]/20 text-[#B89952]">Bientôt</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {integration.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isConnected ? (
                                <>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDisconnect(integration.id)}
                                  >
                                    <X className="mr-1 h-4 w-4" />
                                    Déconnecter
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => handleConnect(integration.id)}
                                  disabled={!integration.enabled || isConnecting || !isPro}
                                  size="sm"
                                  className={isPro ? "bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]" : ""}
                                >
                                  {isConnecting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Connexion...
                                    </>
                                  ) : !isPro ? (
                                    <>
                                      <Lock className="mr-2 h-4 w-4" />
                                      Pro
                                    </>
                                  ) : (
                                    <>
                                      <ExternalLink className="mr-2 h-4 w-4" />
                                      Connecter
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Help Section */}
      <motion.div variants={staggerItem} {...cardHover}>
        <Card className="border-[#C9A962]/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#1E3A5F]/5 to-transparent">
            <div className="flex items-center gap-3">
              <DealIconD size="xs" variant="primary" />
              <div>
                <CardTitle className="text-base text-[#1E3A5F]">Besoin d'aide ?</CardTitle>
                <CardDescription>
                  Consultez notre documentation pour configurer vos intégrations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" className="border-[#C9A962]/30 hover:bg-[#C9A962]/10" asChild>
                <Link href="/docs/integrations">
                  Documentation
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button className="bg-[#C9A962] text-[#0D1B2A] hover:bg-[#D4B872]" asChild>
                <Link href="/support">
                  Contacter le support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
