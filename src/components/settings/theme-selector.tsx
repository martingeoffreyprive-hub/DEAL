"use client";

/**
 * Theme Selector - Sélecteur de thème visuel
 * 4 thèmes: Classic, Chantier, Nuit, Nature
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useThemeVariant, THEME_VARIANTS, ThemeVariant } from "@/contexts/theme-context";
import { useAccessibility } from "@/contexts/accessibility-context";
import { Check, Briefcase, HardHat, Moon, Leaf, Monitor, Smartphone } from "lucide-react";

export function ThemeSelector() {
  const { themeVariant, setThemeVariant, isDark } = useThemeVariant();
  const { settings, setMode, updateSetting } = useAccessibility();

  const themes: { value: ThemeVariant; icon: any }[] = [
    { value: "classic", icon: Briefcase },
    { value: "chantier", icon: HardHat },
    { value: "nuit", icon: Moon },
    { value: "nature", icon: Leaf },
  ];

  return (
    <div className="space-y-6">
      {/* Thème de couleur */}
      <Card>
        <CardHeader>
          <CardTitle>Thème de couleur</CardTitle>
          <CardDescription>
            Choisissez le thème qui correspond à votre style de travail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={themeVariant}
            onValueChange={(value) => setThemeVariant(value as ThemeVariant)}
            className="grid grid-cols-2 gap-4"
          >
            {themes.map(({ value, icon: Icon }) => {
              const theme = THEME_VARIANTS[value];
              const colors = isDark ? theme.colors.dark : theme.colors.light;
              const isSelected = themeVariant === value;

              return (
                <Label
                  key={value}
                  htmlFor={`theme-${value}`}
                  className="cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-primary shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={value}
                      id={`theme-${value}`}
                      className="sr-only"
                    />

                    {/* Check mark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </motion.div>
                    )}

                    {/* Preview */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Icon className="h-5 w-5" style={{ color: colors.primaryForeground }} />
                      </div>
                      <div>
                        <div className="font-semibold">{theme.name}</div>
                        <div className="text-xs text-muted-foreground">{theme.description}</div>
                      </div>
                    </div>

                    {/* Color preview */}
                    <div className="flex gap-1.5">
                      <div
                        className="h-6 flex-1 rounded"
                        style={{ backgroundColor: colors.primary }}
                        title="Primaire"
                      />
                      <div
                        className="h-6 flex-1 rounded"
                        style={{ backgroundColor: colors.secondary }}
                        title="Secondaire"
                      />
                      <div
                        className="h-6 flex-1 rounded"
                        style={{ backgroundColor: colors.accent }}
                        title="Accent"
                      />
                      <div
                        className="h-6 flex-1 rounded border"
                        style={{ backgroundColor: colors.background }}
                        title="Fond"
                      />
                    </div>
                  </motion.div>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Mode d'interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardHat className="h-5 w-5 text-orange-500" />
            Mode d'interface
          </CardTitle>
          <CardDescription>
            Adaptez l'interface à vos conditions de travail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Chantier */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">Mode Chantier</div>
                <div className="text-sm text-muted-foreground">
                  Gros boutons, haute visibilité, adapté aux gants
                </div>
              </div>
            </div>
            <Switch
              checked={settings.mode === "chantier"}
              onCheckedChange={(checked) => setMode(checked ? "chantier" : "standard")}
            />
          </div>

          {/* Options individuelles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="large-text">Texte agrandi</Label>
              <Switch
                id="large-text"
                checked={settings.largeText}
                onCheckedChange={(checked) => updateSetting("largeText", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">Contraste élevé</Label>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting("highContrast", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Réduire les animations</Label>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting("reducedMotion", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="haptic">Retour haptique (vibration)</Label>
              <Switch
                id="haptic"
                checked={settings.hapticFeedback}
                onCheckedChange={(checked) => updateSetting("hapticFeedback", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
          <CardDescription>Prévisualisation des boutons et éléments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Boutons */}
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                Bouton principal
              </button>
              <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                Bouton secondaire
              </button>
              <button className="px-6 py-3 border border-input bg-background rounded-lg font-medium hover:bg-accent transition-colors">
                Bouton outline
              </button>
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Champ de saisie exemple"
              className="w-full px-4 py-3 border border-input rounded-lg bg-background"
            />

            {/* Card preview */}
            <div className="p-4 rounded-lg border bg-card">
              <div className="font-semibold mb-1">Carte exemple</div>
              <div className="text-sm text-muted-foreground">
                Aperçu du style des cartes avec le thème actuel
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
