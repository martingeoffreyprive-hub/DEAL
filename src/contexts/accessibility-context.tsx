"use client";

/**
 * Accessibility Context - Mode Chantier
 * Interface adaptée aux conditions de terrain
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AccessibilityMode = 'standard' | 'chantier' | 'senior';

interface AccessibilitySettings {
  mode: AccessibilityMode;
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  voiceCommands: boolean;
  hapticFeedback: boolean;
  buttonSize: 'normal' | 'large' | 'xlarge';
  touchTargetSize: number; // en pixels
  spacing: 'compact' | 'normal' | 'relaxed';
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  mode: 'standard',
  largeText: false,
  highContrast: false,
  reducedMotion: false,
  voiceCommands: false,
  hapticFeedback: true,
  buttonSize: 'normal',
  touchTargetSize: 44,
  spacing: 'normal',
};

const CHANTIER_SETTINGS: AccessibilitySettings = {
  mode: 'chantier',
  largeText: true,
  highContrast: true,
  reducedMotion: true,
  voiceCommands: true,
  hapticFeedback: true,
  buttonSize: 'xlarge',
  touchTargetSize: 64,
  spacing: 'relaxed',
};

const SENIOR_SETTINGS: AccessibilitySettings = {
  mode: 'senior',
  largeText: true,
  highContrast: false,
  reducedMotion: true,
  voiceCommands: false,
  hapticFeedback: true,
  buttonSize: 'large',
  touchTargetSize: 56,
  spacing: 'relaxed',
};

interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  setMode: (mode: AccessibilityMode) => void;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetSettings: () => void;
  isChantierMode: boolean;
  buttonClasses: string;
  inputClasses: string;
  cardClasses: string;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('deal-accessibility');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // Ignorer les erreurs de parsing
      }
    }

    // Détecter les préférences système
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    // Détecter si c'est un écran tactile
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      // Suggérer le mode chantier sur tablettes en orientation portrait
      const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
      if (isTablet) {
        // Ne pas forcer, juste préparer
      }
    }
  }, []);

  // Appliquer les variables CSS
  useEffect(() => {
    const root = document.documentElement;

    // Taille des boutons
    const buttonHeight = settings.buttonSize === 'xlarge' ? '64px'
      : settings.buttonSize === 'large' ? '56px'
      : '40px';
    root.style.setProperty('--button-height', buttonHeight);

    // Taille des zones tactiles
    root.style.setProperty('--touch-target', `${settings.touchTargetSize}px`);

    // Espacement
    const spacingMultiplier = settings.spacing === 'relaxed' ? '1.5'
      : settings.spacing === 'compact' ? '0.75'
      : '1';
    root.style.setProperty('--spacing-multiplier', spacingMultiplier);

    // Taille du texte
    if (settings.largeText) {
      root.style.setProperty('--text-base', '18px');
      root.style.setProperty('--text-sm', '16px');
      root.style.setProperty('--text-lg', '22px');
    } else {
      root.style.removeProperty('--text-base');
      root.style.removeProperty('--text-sm');
      root.style.removeProperty('--text-lg');
    }

    // Contraste élevé
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Mode chantier
    if (settings.mode === 'chantier') {
      root.classList.add('chantier-mode');
    } else {
      root.classList.remove('chantier-mode');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Sauvegarder
    localStorage.setItem('deal-accessibility', JSON.stringify(settings));
  }, [settings]);

  const setMode = useCallback((mode: AccessibilityMode) => {
    switch (mode) {
      case 'chantier':
        setSettings(CHANTIER_SETTINGS);
        break;
      case 'senior':
        setSettings(SENIOR_SETTINGS);
        break;
      default:
        setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('deal-accessibility');
  }, []);

  // Classes utilitaires basées sur les paramètres
  const buttonClasses = settings.mode === 'chantier'
    ? 'min-h-[64px] min-w-[64px] text-lg font-bold px-6 py-4 touch-manipulation'
    : settings.mode === 'senior'
    ? 'min-h-[56px] min-w-[56px] text-base font-medium px-5 py-3'
    : 'min-h-[40px] px-4 py-2';

  const inputClasses = settings.mode === 'chantier'
    ? 'min-h-[56px] text-lg px-4 py-3 touch-manipulation'
    : settings.mode === 'senior'
    ? 'min-h-[52px] text-base px-4 py-3'
    : 'min-h-[40px] px-3 py-2';

  const cardClasses = settings.mode === 'chantier'
    ? 'p-6 space-y-4'
    : settings.mode === 'senior'
    ? 'p-5 space-y-3'
    : 'p-4 space-y-2';

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setMode,
        updateSetting,
        resetSettings,
        isChantierMode: settings.mode === 'chantier',
        buttonClasses,
        inputClasses,
        cardClasses,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Hook pour les gros boutons en mode chantier
 */
export function useChantierButton() {
  const { settings } = useAccessibility();

  return {
    className: settings.mode === 'chantier'
      ? 'min-h-[64px] min-w-[64px] text-lg font-bold rounded-xl shadow-lg active:scale-95 transition-transform touch-manipulation'
      : '',
    style: settings.mode === 'chantier'
      ? { WebkitTapHighlightColor: 'transparent' }
      : {},
  };
}

/**
 * Hook pour le feedback haptique
 */
export function useHapticFeedback() {
  const { settings } = useAccessibility();

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, [settings.hapticFeedback]);

  return { vibrate };
}
