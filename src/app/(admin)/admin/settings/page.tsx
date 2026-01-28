import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Palette,
  Server,
} from "lucide-react";

export const dynamic = "force-dynamic";

const settingsSections = [
  {
    title: "Notifications",
    description: "Configurer les alertes et notifications système",
    icon: Bell,
    status: "Actif",
  },
  {
    title: "Sécurité",
    description: "Paramètres de sécurité et authentification",
    icon: Shield,
    status: "Actif",
  },
  {
    title: "Base de données",
    description: "Configuration Supabase et backups",
    icon: Database,
    status: "Connecté",
  },
  {
    title: "Emails",
    description: "Templates et configuration SMTP",
    icon: Mail,
    status: "Configuré",
  },
  {
    title: "Localisation",
    description: "Langues et formats régionaux",
    icon: Globe,
    status: "FR-BE",
  },
  {
    title: "Apparence",
    description: "Thèmes et personnalisation",
    icon: Palette,
    status: "Défaut",
  },
  {
    title: "Système",
    description: "Logs, maintenance et performances",
    icon: Server,
    status: "OK",
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Paramètres Admin
        </h1>
        <p className="text-muted-foreground">
          Configuration globale de la plateforme DEAL
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <Card key={section.title} className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {section.status}
                </Badge>
              </div>
              <CardTitle className="text-base mt-3">{section.title}</CardTitle>
              <CardDescription className="text-sm">
                {section.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Informations système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Version</p>
              <p className="font-medium">DEAL v2.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Environnement</p>
              <p className="font-medium">Development</p>
            </div>
            <div>
              <p className="text-muted-foreground">Base de données</p>
              <p className="font-medium">Supabase (PostgreSQL)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
