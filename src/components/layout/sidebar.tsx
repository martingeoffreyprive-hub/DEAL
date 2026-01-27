"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  CreditCard,
  Users,
  BarChart3,
  Plug,
  Shield,
  Lock,
  Receipt,
  Gift,
  Coins,
  Building2,
  LayoutTemplate,
  UserPlus,
  Palette,
  Workflow,
  Code,
  BookOpen,
} from "lucide-react";
import { DealLogo } from "@/components/brand";

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

const navigation: NavSection[] = [
  {
    title: "Principal",
    items: [
      { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
      { name: "Mes devis", href: "/quotes", icon: FileText },
      { name: "Nouveau devis", href: "/quotes/new", icon: Plus },
      { name: "Leads", href: "/leads", icon: UserPlus, badge: "Nouveau" },
    ],
  },
  {
    title: "Business",
    items: [
      { name: "Factures", href: "/invoices", icon: Receipt },
      { name: "Fournisseurs", href: "/suppliers", icon: Building2 },
      { name: "Templates", href: "/templates", icon: LayoutTemplate },
      { name: "Analytiques", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Récompenses",
    items: [
      { name: "Parrainage", href: "/referral", icon: Gift },
      { name: "TokenDEAL", href: "/tokens", icon: Coins },
    ],
  },
  {
    title: "Organisation",
    items: [
      { name: "Équipe", href: "/team", icon: Users },
      { name: "Profil entreprise", href: "/profile", icon: User },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { name: "Abonnement", href: "/settings/subscription", icon: CreditCard },
      { name: "Apparence", href: "/settings/appearance", icon: Palette },
      { name: "Widget", href: "/settings/widget", icon: Code },
      { name: "Workflows", href: "/settings/workflows", icon: Workflow },
      { name: "Intégrations", href: "/settings/integrations", icon: Plug },
      { name: "Sécurité", href: "/settings/security", icon: Lock },
      { name: "Confidentialité", href: "/settings/privacy", icon: Shield },
    ],
  },
  {
    title: "Aide",
    items: [
      { name: "Guide utilisateur", href: "/docs/user-guide", icon: BookOpen },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 border-b px-4">
        <Link href="/dashboard">
          <DealLogo type="combined" size="sm" variant="primary" animated />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
        {navigation.map((section, sectionIndex) => (
          <div key={section.title} className={cn(sectionIndex > 0 && "mt-6")}>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#C9A962] text-white rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
