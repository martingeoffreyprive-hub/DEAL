"use client";

import {
  FileText,
  Users,
  Receipt,
  BarChart3,
  Calculator,
  Image,
  Calendar,
  Settings,
  Home,
  PlusCircle,
  UserCircle,
  CreditCard,
  Target,
  FileStack,
  Truck,
  Gift,
  Shield,
  Palette,
  Workflow,
  Key,
  LucideIcon,
} from "lucide-react";

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  href: string;
  category: "main" | "tools" | "settings" | "system";
  badge?: number;
  description?: string;
}

// Icon mapping
export const iconMap: Record<string, LucideIcon> = {
  FileText,
  Users,
  Receipt,
  BarChart3,
  Calculator,
  Image,
  Calendar,
  Settings,
  Home,
  PlusCircle,
  UserCircle,
  CreditCard,
  Target,
  FileStack,
  Truck,
  Gift,
  Shield,
  Palette,
  Workflow,
  Key,
};

// All available apps in the system
export const appRegistry: AppConfig[] = [
  // Main Apps
  {
    id: "dashboard",
    name: "Accueil",
    icon: "Home",
    color: "#E85A5A",
    href: "/dashboard",
    category: "main",
    description: "Tableau de bord principal",
  },
  {
    id: "quotes",
    name: "Devis",
    icon: "FileText",
    color: "#3B82F6",
    href: "/quotes",
    category: "main",
    badge: 3,
    description: "Gérer vos devis",
  },
  {
    id: "new-quote",
    name: "Créer",
    icon: "PlusCircle",
    color: "#E85A5A",
    href: "/quotes/new",
    category: "main",
    description: "Nouveau devis",
  },
  {
    id: "clients",
    name: "Clients",
    icon: "Users",
    color: "#22C55E",
    href: "/clients",
    category: "main",
    description: "Base clients",
  },
  {
    id: "invoices",
    name: "Factures",
    icon: "Receipt",
    color: "#F59E0B",
    href: "/invoices",
    category: "main",
    description: "Facturation",
  },
  {
    id: "analytics",
    name: "Stats",
    icon: "BarChart3",
    color: "#8B5CF6",
    href: "/analytics",
    category: "main",
    description: "Statistiques & KPIs",
  },

  // Tools
  {
    id: "calculator",
    name: "Calcul",
    icon: "Calculator",
    color: "#6366F1",
    href: "/calculator",
    category: "tools",
    description: "Calculatrice métier",
  },
  {
    id: "templates",
    name: "Modèles",
    icon: "FileStack",
    color: "#EC4899",
    href: "/templates",
    category: "tools",
    description: "Modèles de devis",
  },
  {
    id: "calendar",
    name: "Planning",
    icon: "Calendar",
    color: "#14B8A6",
    href: "/calendar",
    category: "tools",
    description: "Calendrier",
  },
  {
    id: "leads",
    name: "Prospects",
    icon: "Target",
    color: "#F97316",
    href: "/leads",
    category: "tools",
    description: "Gestion prospects",
  },
  {
    id: "suppliers",
    name: "Fournisseurs",
    icon: "Truck",
    color: "#0EA5E9",
    href: "/suppliers",
    category: "tools",
    description: "Catalogue fournisseurs",
  },
  {
    id: "referral",
    name: "Parrainage",
    icon: "Gift",
    color: "#A855F7",
    href: "/referral",
    category: "tools",
    description: "Programme parrainage",
  },

  // Settings
  {
    id: "settings",
    name: "Réglages",
    icon: "Settings",
    color: "#64748B",
    href: "/settings",
    category: "settings",
    description: "Paramètres généraux",
  },
  {
    id: "profile",
    name: "Profil",
    icon: "UserCircle",
    color: "#F472B6",
    href: "/profile",
    category: "settings",
    description: "Mon profil",
  },
  {
    id: "appearance",
    name: "Apparence",
    icon: "Palette",
    color: "#A78BFA",
    href: "/settings/appearance",
    category: "settings",
    description: "Thème & affichage",
  },
  {
    id: "security",
    name: "Sécurité",
    icon: "Shield",
    color: "#10B981",
    href: "/settings/security",
    category: "settings",
    description: "Sécurité du compte",
  },
  {
    id: "subscription",
    name: "Abonnement",
    icon: "CreditCard",
    color: "#FBBF24",
    href: "/settings/subscription",
    category: "settings",
    description: "Gérer l'abonnement",
  },
];

// Get apps by category
export function getAppsByCategory(category: AppConfig["category"]): AppConfig[] {
  return appRegistry.filter((app) => app.category === category);
}

// Get app by ID
export function getAppById(id: string): AppConfig | undefined {
  return appRegistry.find((app) => app.id === id);
}

// Get home screen apps (main + some tools)
export function getHomeScreenApps(): AppConfig[] {
  const mainApps = getAppsByCategory("main");
  const toolApps = getAppsByCategory("tools").slice(0, 2); // Show first 2 tools
  const settingsApp = getAppById("settings");

  return [...mainApps, ...toolApps, settingsApp].filter(Boolean) as AppConfig[];
}

// Get dock apps (frequently used)
export function getDockApps(): AppConfig[] {
  return ["quotes", "new-quote", "clients", "analytics"]
    .map(getAppById)
    .filter(Boolean) as AppConfig[];
}
