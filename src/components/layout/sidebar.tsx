"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Plus, User, CreditCard, Users, BarChart3, Plug, Shield, Lock } from "lucide-react";
import { DealLogo } from "@/components/brand";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mes devis", href: "/quotes", icon: FileText },
  { name: "Nouveau devis", href: "/quotes/new", icon: Plus },
  { name: "Équipe", href: "/team", icon: Users },
  { name: "Analytiques", href: "/analytics", icon: BarChart3 },
  { name: "Intégrations", href: "/settings/integrations", icon: Plug },
  { name: "Profil entreprise", href: "/profile", icon: User },
  { name: "Abonnement", href: "/settings/subscription", icon: CreditCard },
  { name: "Sécurité", href: "/settings/security", icon: Lock },
  { name: "Confidentialité", href: "/settings/privacy", icon: Shield },
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

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
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
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
