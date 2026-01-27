"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  type LocaleCode,
  type LocalePack,
  getLocalePack,
  detectLocale,
  validateCompliance,
  getTaxRates,
  isValidLocaleCode,
} from '@/lib/locale-packs';

const LOCALE_STORAGE_KEY = 'quotevoice_locale';
const DEFAULT_LOCALE: LocaleCode = 'fr-BE';

// Safe localStorage helper - graceful fallback if localStorage is unavailable
function safeGetLocale(): LocaleCode | null {
  try {
    if (typeof window === 'undefined') return null;

    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);

    if (!saved) return null;

    if (isValidLocaleCode(saved)) {
      return saved;
    }

    // Invalid locale in storage - clean it up and warn
    console.warn(
      `[DEAL] Invalid locale "${saved}" found in localStorage, resetting to default (${DEFAULT_LOCALE})`
    );
    localStorage.removeItem(LOCALE_STORAGE_KEY);
    return null;
  } catch (error) {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
    console.warn(
      '[DEAL] localStorage unavailable, using default locale:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

// Safe localStorage setter
function safeSaveLocale(locale: LocaleCode): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn(
      '[DEAL] Failed to save locale to localStorage:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

interface LocaleContextValue {
  locale: LocaleCode;
  localePack: LocalePack;
  setLocale: (locale: LocaleCode) => void;
  taxRates: { value: number; label: string; description?: string }[];
  validateQuote: (data: any) => ReturnType<typeof validateCompliance>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  defaultLocale?: LocaleCode;
}

export function LocaleProvider({ children, defaultLocale = DEFAULT_LOCALE }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<LocaleCode>(defaultLocale);
  const [localePack, setLocalePack] = useState<LocalePack>(getLocalePack(defaultLocale));
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved locale from localStorage on mount with graceful fallback
  useEffect(() => {
    try {
      // Try to get saved locale
      const saved = safeGetLocale();

      if (saved) {
        setLocaleState(saved);
        setLocalePack(getLocalePack(saved));
      } else if (typeof window !== 'undefined') {
        // Try to detect locale from browser
        const detected = detectLocale({
          browserLocale: navigator.language,
        });
        setLocaleState(detected);
        setLocalePack(getLocalePack(detected));

        // Log if we fell back to browser detection
        if (detected !== DEFAULT_LOCALE) {
          console.info(`[DEAL] Detected locale from browser: ${detected}`);
        }
      }
    } catch (error) {
      // Ultimate fallback - use default locale
      console.warn(
        '[DEAL] Error during locale initialization, using default:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      setLocaleState(DEFAULT_LOCALE);
      setLocalePack(getLocalePack(DEFAULT_LOCALE));
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Update locale and save to localStorage with error handling
  const setLocale = useCallback((newLocale: LocaleCode) => {
    // Validate the locale before setting
    if (!isValidLocaleCode(newLocale)) {
      console.warn(`[DEAL] Attempted to set invalid locale: ${newLocale}`);
      return;
    }

    setLocaleState(newLocale);
    setLocalePack(getLocalePack(newLocale));
    safeSaveLocale(newLocale);
  }, []);

  // Get tax rates for current locale
  const taxRates = getTaxRates(locale);

  // Validate quote data against locale rules
  const validateQuote = useCallback(
    (data: any) => validateCompliance(data, locale),
    [locale]
  );

  // Format currency according to locale
  const formatCurrency = useCallback(
    (amount: number) => {
      const { symbol, position, decimalSeparator, thousandsSeparator, decimals } =
        localePack.currency;

      const formatted = amount
        .toFixed(decimals)
        .replace('.', decimalSeparator)
        .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

      return position === 'before'
        ? `${symbol}${formatted}`
        : `${formatted} ${symbol}`;
    },
    [localePack]
  );

  // Format date according to locale
  const formatDate = useCallback(
    (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(localePack.date.locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    [localePack]
  );

  // Format date and time according to locale
  const formatDateTime = useCallback(
    (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(localePack.date.locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    [localePack]
  );

  const value: LocaleContextValue = {
    locale,
    localePack,
    setLocale,
    taxRates,
    validateQuote,
    formatCurrency,
    formatDate,
    formatDateTime,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }
  return context;
}

// Re-export for backwards compatibility with useLocale hook
export { useLocaleContext as useLocale };
