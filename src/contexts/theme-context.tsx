"use client";

/**
 * Theme Context - 4 thèmes DEAL
 * Classic, Chantier, Nuit, Nature
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeVariant = 'classic' | 'chantier' | 'nuit' | 'nature';

interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  ring: string;
}

export const THEME_VARIANTS: Record<ThemeVariant, {
  name: string;
  description: string;
  icon: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}> = {
  classic: {
    name: 'DEAL Classic',
    description: 'Thème professionnel par défaut',
    icon: '💼',
    colors: {
      light: {
        primary: '#1E3A5F',
        primaryForeground: '#FFFFFF',
        secondary: '#C9A962',
        secondaryForeground: '#0D1B2A',
        accent: '#C9A962',
        accentForeground: '#0D1B2A',
        background: '#FFFFFF',
        foreground: '#0D1B2A',
        card: '#FFFFFF',
        cardForeground: '#0D1B2A',
        muted: '#F1F5F9',
        mutedForeground: '#64748B',
        border: '#E2E8F0',
        ring: '#1E3A5F',
      },
      dark: {
        primary: '#C9A962',
        primaryForeground: '#0D1B2A',
        secondary: '#1E3A5F',
        secondaryForeground: '#FFFFFF',
        accent: '#C9A962',
        accentForeground: '#0D1B2A',
        background: '#0D1B2A',
        foreground: '#F8FAFC',
        card: '#1E293B',
        cardForeground: '#F8FAFC',
        muted: '#1E293B',
        mutedForeground: '#94A3B8',
        border: '#334155',
        ring: '#C9A962',
      },
    },
  },
  chantier: {
    name: 'Chantier',
    description: 'Haute visibilité pour le terrain',
    icon: '🦺',
    colors: {
      light: {
        primary: '#EA580C',
        primaryForeground: '#FFFFFF',
        secondary: '#374151',
        secondaryForeground: '#FFFFFF',
        accent: '#F97316',
        accentForeground: '#FFFFFF',
        background: '#FFF7ED',
        foreground: '#1F2937',
        card: '#FFFFFF',
        cardForeground: '#1F2937',
        muted: '#FED7AA',
        mutedForeground: '#9A3412',
        border: '#FDBA74',
        ring: '#EA580C',
      },
      dark: {
        primary: '#F97316',
        primaryForeground: '#FFFFFF',
        secondary: '#4B5563',
        secondaryForeground: '#FFFFFF',
        accent: '#FB923C',
        accentForeground: '#1F2937',
        background: '#1F2937',
        foreground: '#FFF7ED',
        card: '#374151',
        cardForeground: '#FFF7ED',
        muted: '#4B5563',
        mutedForeground: '#FDBA74',
        border: '#6B7280',
        ring: '#F97316',
      },
    },
  },
  nuit: {
    name: 'Mode Nuit',
    description: 'Confort visuel en soirée',
    icon: '🌙',
    colors: {
      light: {
        primary: '#3B82F6',
        primaryForeground: '#FFFFFF',
        secondary: '#1E293B',
        secondaryForeground: '#FFFFFF',
        accent: '#60A5FA',
        accentForeground: '#1E293B',
        background: '#F8FAFC',
        foreground: '#0F172A',
        card: '#FFFFFF',
        cardForeground: '#0F172A',
        muted: '#E2E8F0',
        mutedForeground: '#475569',
        border: '#CBD5E1',
        ring: '#3B82F6',
      },
      dark: {
        primary: '#60A5FA',
        primaryForeground: '#0F172A',
        secondary: '#334155',
        secondaryForeground: '#F8FAFC',
        accent: '#3B82F6',
        accentForeground: '#FFFFFF',
        background: '#0A0A0A',
        foreground: '#FAFAFA',
        card: '#171717',
        cardForeground: '#FAFAFA',
        muted: '#262626',
        mutedForeground: '#A3A3A3',
        border: '#404040',
        ring: '#60A5FA',
      },
    },
  },
  nature: {
    name: 'Nature',
    description: 'Éco-construction et durabilité',
    icon: '🌿',
    colors: {
      light: {
        primary: '#059669',
        primaryForeground: '#FFFFFF',
        secondary: '#A16207',
        secondaryForeground: '#FFFFFF',
        accent: '#10B981',
        accentForeground: '#FFFFFF',
        background: '#F0FDF4',
        foreground: '#14532D',
        card: '#FFFFFF',
        cardForeground: '#14532D',
        muted: '#DCFCE7',
        mutedForeground: '#166534',
        border: '#BBF7D0',
        ring: '#059669',
      },
      dark: {
        primary: '#10B981',
        primaryForeground: '#052E16',
        secondary: '#D97706',
        secondaryForeground: '#FFFFFF',
        accent: '#34D399',
        accentForeground: '#052E16',
        background: '#052E16',
        foreground: '#ECFDF5',
        card: '#14532D',
        cardForeground: '#ECFDF5',
        muted: '#166534',
        mutedForeground: '#86EFAC',
        border: '#22543D',
        ring: '#10B981',
      },
    },
  },
};

interface ThemeContextValue {
  themeVariant: ThemeVariant;
  setThemeVariant: (variant: ThemeVariant) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeVariantContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeVariantProvider({ children }: { children: React.ReactNode }) {
  const [themeVariant, setThemeVariantState] = useState<ThemeVariant>('classic');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Charger le thème depuis localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('deal-theme-variant');
    if (saved && saved in THEME_VARIANTS) {
      setThemeVariantState(saved as ThemeVariant);
    }

    // Détecter le mode sombre
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkQuery.matches || document.documentElement.classList.contains('dark'));

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkQuery.addEventListener('change', handleChange);

    // Observer les changements de classe sur html
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      darkQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  // Appliquer les variables CSS
  useEffect(() => {
    const theme = THEME_VARIANTS[themeVariant];
    const colors = isDark ? theme.colors.dark : theme.colors.light;
    const root = document.documentElement;

    // Convertir hex en HSL pour Tailwind
    const hexToHSL = (hex: string): string => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    root.style.setProperty('--primary', hexToHSL(colors.primary));
    root.style.setProperty('--primary-foreground', hexToHSL(colors.primaryForeground));
    root.style.setProperty('--secondary', hexToHSL(colors.secondary));
    root.style.setProperty('--secondary-foreground', hexToHSL(colors.secondaryForeground));
    root.style.setProperty('--accent', hexToHSL(colors.accent));
    root.style.setProperty('--accent-foreground', hexToHSL(colors.accentForeground));
    root.style.setProperty('--background', hexToHSL(colors.background));
    root.style.setProperty('--foreground', hexToHSL(colors.foreground));
    root.style.setProperty('--card', hexToHSL(colors.card));
    root.style.setProperty('--card-foreground', hexToHSL(colors.cardForeground));
    root.style.setProperty('--muted', hexToHSL(colors.muted));
    root.style.setProperty('--muted-foreground', hexToHSL(colors.mutedForeground));
    root.style.setProperty('--border', hexToHSL(colors.border));
    root.style.setProperty('--ring', hexToHSL(colors.ring));

    // Appliquer le data-theme pour CSS
    root.setAttribute('data-deal-theme', themeVariant);
  }, [themeVariant, isDark]);

  const setThemeVariant = useCallback((variant: ThemeVariant) => {
    setThemeVariantState(variant);
    localStorage.setItem('deal-theme-variant', variant);
  }, []);

  const colors = isDark
    ? THEME_VARIANTS[themeVariant].colors.dark
    : THEME_VARIANTS[themeVariant].colors.light;

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeVariantContext.Provider value={{ themeVariant, setThemeVariant, colors, isDark }}>
      {children}
    </ThemeVariantContext.Provider>
  );
}

export function useThemeVariant() {
  const context = useContext(ThemeVariantContext);
  if (!context) {
    throw new Error('useThemeVariant must be used within a ThemeVariantProvider');
  }
  return context;
}
