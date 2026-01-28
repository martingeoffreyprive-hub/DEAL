import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ScrollText,
  Settings,
  ArrowLeft,
  Shield,
  Briefcase,
  FileText,
  Coins,
  BarChart3,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/sectors", label: "Secteurs", icon: Briefcase },
  { href: "/admin/templates", label: "Templates", icon: FileText },
  { href: "/admin/tokens", label: "TokenDEAL", icon: Coins },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
  { href: "/admin/audit-logs", label: "Journaux d'audit", icon: ScrollText },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Back to app */}
          <div className="p-4 border-t border-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'application
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
