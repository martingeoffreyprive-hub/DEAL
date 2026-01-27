"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  FileText,
  Home,
  LogOut,
  Mic,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  Users,
  Zap,
  BarChart3,
  FolderOpen,
  HelpCircle,
  Keyboard,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  group: string;
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Toggle with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setOpen(false);
  }, []);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "dashboard",
      label: "Tableau de bord",
      description: "Accéder au tableau de bord",
      icon: <Home className="w-4 h-4" />,
      shortcut: ["G", "D"],
      action: () => navigate("/dashboard"),
      group: "Navigation",
      keywords: ["home", "accueil", "dashboard"],
    },
    {
      id: "quotes",
      label: "Mes devis",
      description: "Voir tous les devis",
      icon: <FolderOpen className="w-4 h-4" />,
      shortcut: ["G", "Q"],
      action: () => navigate("/quotes"),
      group: "Navigation",
      keywords: ["devis", "quotes", "liste"],
    },
    {
      id: "profile",
      label: "Profil entreprise",
      description: "Modifier les informations",
      icon: <User className="w-4 h-4" />,
      shortcut: ["G", "P"],
      action: () => navigate("/profile"),
      group: "Navigation",
      keywords: ["profil", "entreprise", "profile", "company"],
    },
    {
      id: "settings",
      label: "Paramètres",
      description: "Configuration de l'application",
      icon: <Settings className="w-4 h-4" />,
      shortcut: ["G", "S"],
      action: () => navigate("/settings/subscription"),
      group: "Navigation",
      keywords: ["settings", "config", "abonnement"],
    },

    // Actions
    {
      id: "new-quote",
      label: "Nouveau devis",
      description: "Créer un devis avec transcription vocale",
      icon: <Plus className="w-4 h-4" />,
      shortcut: ["N"],
      action: () => navigate("/quotes/new"),
      group: "Actions",
      keywords: ["nouveau", "créer", "new", "create", "devis"],
    },
    {
      id: "voice",
      label: "Enregistrer un devis",
      description: "Dictez votre devis",
      icon: <Mic className="w-4 h-4" />,
      shortcut: ["V"],
      action: () => navigate("/quotes/new"),
      group: "Actions",
      keywords: ["voix", "voice", "micro", "dicter", "enregistrer"],
    },

    // Team (if enabled)
    {
      id: "team",
      label: "Équipe",
      description: "Gérer les membres de l'équipe",
      icon: <Users className="w-4 h-4" />,
      action: () => navigate("/team"),
      group: "Équipe",
      keywords: ["team", "équipe", "membres", "collaborateurs"],
    },

    // Analytics
    {
      id: "analytics",
      label: "Statistiques",
      description: "Voir les analyses et rapports",
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => navigate("/analytics"),
      group: "Analytique",
      keywords: ["stats", "analytics", "rapports", "chiffres"],
    },

    // Theme & Preferences
    {
      id: "toggle-theme",
      label: "Changer de thème",
      description: "Basculer entre clair et sombre",
      icon: <Sun className="w-4 h-4" />,
      shortcut: ["T"],
      action: toggleTheme,
      group: "Préférences",
      keywords: ["theme", "dark", "light", "sombre", "clair", "mode"],
    },

    // Help
    {
      id: "shortcuts",
      label: "Raccourcis clavier",
      description: "Voir tous les raccourcis",
      icon: <Keyboard className="w-4 h-4" />,
      shortcut: ["?"],
      action: () => {
        setOpen(false);
        // Could open a modal with shortcuts
      },
      group: "Aide",
      keywords: ["raccourcis", "shortcuts", "keyboard", "clavier"],
    },
    {
      id: "help",
      label: "Centre d'aide",
      description: "Documentation et support",
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => {
        setOpen(false);
        window.open("https://help.quotevoice.app", "_blank");
      },
      group: "Aide",
      keywords: ["aide", "help", "support", "documentation"],
    },

    // Account
    {
      id: "logout",
      label: "Déconnexion",
      description: "Se déconnecter de DEAL",
      icon: <LogOut className="w-4 h-4" />,
      action: () => navigate("/auth/logout"),
      group: "Compte",
      keywords: ["logout", "déconnexion", "quitter"],
    },
  ];

  // Group commands
  const groups = commands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) {
      acc[cmd.group] = [];
    }
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="command-overlay"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Command Dialog */}
      <Command
        className="command-dialog"
        shouldFilter={true}
        loop
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Rechercher une commande..."
            className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="ml-2 text-2xs">ESC</kbd>
        </div>

        {/* Command List */}
        <Command.List className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            Aucun résultat trouvé.
          </Command.Empty>

          {Object.entries(groups).map(([group, items]) => (
            <Command.Group
              key={group}
              heading={group}
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
            >
              {items.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.keywords?.join(" ") || ""}`}
                  onSelect={item.action}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-md cursor-pointer text-sm aria-selected:bg-accent aria-selected:text-accent-foreground transition-colors"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {item.shortcut && (
                    <div className="flex items-center gap-1">
                      {item.shortcut.map((key, i) => (
                        <kbd key={i} className="text-2xs">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd>↑↓</kbd> naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd>↵</kbd> sélectionner
            </span>
            <span className="flex items-center gap-1">
              <kbd>ESC</kbd> fermer
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            DEAL
          </div>
        </div>
      </Command>
    </>
  );
}

// Trigger button component
export function CommandPaletteTrigger() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => {
        // Dispatch keyboard event to open palette
        const event = new KeyboardEvent("keydown", {
          key: "k",
          metaKey: true,
          bubbles: true,
        });
        document.dispatchEvent(event);
      }}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Rechercher...</span>
      <kbd className="ml-2 hidden sm:inline text-2xs">
        {typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
          ? "⌘K"
          : "Ctrl+K"}
      </kbd>
    </button>
  );
}

export default CommandPalette;
