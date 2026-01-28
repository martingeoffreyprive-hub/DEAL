"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardHat, Sun, Eye, Hand, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CONSTRUCTION_MODE_KEY = "deal_construction_mode";

interface ConstructionModeContextValue {
  isEnabled: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const ConstructionModeContext = createContext<ConstructionModeContextValue | null>(null);

export function useConstructionMode() {
  const context = useContext(ConstructionModeContext);
  if (!context) {
    return {
      isEnabled: false,
      toggle: () => {},
      enable: () => {},
      disable: () => {},
    };
  }
  return context;
}

interface ConstructionModeProviderProps {
  children: ReactNode;
}

export function ConstructionModeProvider({ children }: ConstructionModeProviderProps) {
  const [isEnabled, setIsEnabled] = useState(false);

  // Load saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSTRUCTION_MODE_KEY);
      if (saved === "true") {
        setIsEnabled(true);
        document.documentElement.classList.add("construction-mode");
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(CONSTRUCTION_MODE_KEY, String(newValue));
      } catch {
        // localStorage unavailable
      }
      if (newValue) {
        document.documentElement.classList.add("construction-mode");
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      } else {
        document.documentElement.classList.remove("construction-mode");
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
      return newValue;
    });
  }, []);

  const enable = useCallback(() => {
    setIsEnabled(true);
    try {
      localStorage.setItem(CONSTRUCTION_MODE_KEY, "true");
    } catch {}
    document.documentElement.classList.add("construction-mode");
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const disable = useCallback(() => {
    setIsEnabled(false);
    try {
      localStorage.setItem(CONSTRUCTION_MODE_KEY, "false");
    } catch {}
    document.documentElement.classList.remove("construction-mode");
  }, []);

  return (
    <ConstructionModeContext.Provider value={{ isEnabled, toggle, enable, disable }}>
      {children}
    </ConstructionModeContext.Provider>
  );
}

interface ConstructionModeToggleProps {
  showCard?: boolean;
  className?: string;
}

export function ConstructionModeToggle({
  showCard = false,
  className,
}: ConstructionModeToggleProps) {
  const { isEnabled, toggle } = useConstructionMode();

  const features = [
    { icon: Sun, label: "Contraste maximum", description: "WCAG AAA" },
    { icon: Hand, label: "Boutons 60px+", description: "Utilisable avec gants" },
    { icon: Eye, label: "Texte agrandi", description: "Lisible en plein soleil" },
    { icon: Volume2, label: "Retour haptique", description: "Vibrations fortes" },
  ];

  if (showCard) {
    return (
      <Card className={cn("border-amber-500/20", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                isEnabled
                  ? "bg-amber-500 text-white"
                  : "bg-amber-500/10 text-amber-600"
              )}
              animate={{ scale: isEnabled ? 1.05 : 1 }}
            >
              <HardHat className="w-6 h-6" />
            </motion.div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Mode Chantier</h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30"
                  >
                    Accessibilité
                  </Badge>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={toggle}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                Interface optimisée pour utilisation sur chantier : grands boutons,
                contraste élevé, pas de gestes complexes.
              </p>

              {/* Features */}
              <AnimatePresence>
                {isEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t"
                  >
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.label}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <feature.icon className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-xs font-medium">{feature.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simple toggle version
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isEnabled ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600"
        )}
      >
        <HardHat className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <Label htmlFor="construction-mode" className="text-sm font-medium cursor-pointer">
          Mode Chantier
        </Label>
      </div>
      <Switch
        id="construction-mode"
        checked={isEnabled}
        onCheckedChange={toggle}
        className="data-[state=checked]:bg-amber-500"
      />
    </div>
  );
}

// Global styles for construction mode - add to globals.css
export const constructionModeStyles = `
/* Construction Mode - High Contrast & Large Touch Targets */
.construction-mode {
  /* Force high contrast colors */
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --primary: 45 93% 47%;
  --primary-foreground: 0 0% 0%;

  /* Larger text */
  font-size: 18px;
}

.construction-mode .dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
}

/* Large touch targets */
.construction-mode button,
.construction-mode [role="button"],
.construction-mode a {
  min-height: 60px !important;
  min-width: 60px !important;
  padding: 16px 24px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
}

/* High contrast borders */
.construction-mode * {
  border-width: 2px !important;
}

/* Disable subtle animations */
.construction-mode * {
  transition-duration: 0ms !important;
}

/* Force black/white for maximum contrast */
.construction-mode .text-muted-foreground {
  color: inherit !important;
  opacity: 0.8;
}
`;
