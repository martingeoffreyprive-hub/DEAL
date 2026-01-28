"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut, Settings, FileText, BarChart3, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocaleSelector } from "@/components/locale/locale-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette, CommandPaletteTrigger } from "@/components/command-palette";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { cn } from "@/lib/utils";

// Desktop navigation items
const desktopNavItems = [
  { href: "/dashboard", label: "Accueil" },
  { href: "/quotes", label: "Devis" },
  { href: "/analytics", label: "Finance" },
];

interface HeaderProps {
  user: User;
  profile: Profile | null;
}

export function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté",
    });
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.company_name
    ? profile.company_name.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || "QV";

  return (
    <header className="relative z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex-shrink-0">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <Link href="/dashboard" className="flex items-baseline gap-0.5 flex-shrink-0">
            <span className="text-lg sm:text-xl font-extrabold tracking-[0.12em] text-foreground" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              DEAL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E85A5A] mb-0.5"></span>
          </Link>

          {/* Desktop Navigation - horizontal links */}
          <nav className="hidden lg:flex items-center gap-1">
            {desktopNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/quotes/new"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                "bg-[#E85A5A] text-white hover:bg-[#D64545]"
              )}
            >
              <Plus className="h-4 w-4" />
              Nouveau
            </Link>
          </nav>
        </div>

        {/* Command Palette, Locale Selector, Theme Toggle & User Menu */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Command Palette Trigger - hidden on mobile and tablet */}
          <div className="hidden lg:block">
            <CommandPaletteTrigger />
          </div>

          {/* Locale Selector - hidden on mobile/tablet */}
          <div className="hidden md:block">
            <LocaleSelector size="sm" />
          </div>

          {/* Notifications - always visible but smaller on mobile */}
          <NotificationBell />

          {/* Theme Toggle - hidden on small mobile */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.logo_url || undefined} alt="Avatar" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.company_name || "Mon entreprise"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                Profil entreprise
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {/* Command Palette (global) */}
      <CommandPalette />
    </header>
  );
}
