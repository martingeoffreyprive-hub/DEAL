// Hook pour la gestion de la locale
import { useState, useEffect, useCallback } from 'react';
import {
  type LocaleCode,
  type LocalePack,
  getLocalePack,
  detectLocale,
  validateCompliance,
  getTaxRates,
} from '@/lib/locale-packs';

const LOCALE_STORAGE_KEY = 'quotevoice_locale';

interface UseLocaleReturn {
  locale: LocaleCode;
  localePack: LocalePack;
  setLocale: (locale: LocaleCode) => void;
  taxRates: { value: number; label: string; description?: string }[];
  validateQuote: (data: any) => ReturnType<typeof validateCompliance>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
}

export function useLocale(): UseLocaleReturn {
  const [locale, setLocaleState] = useState<LocaleCode>('fr-BE');
  const [localePack, setLocalePack] = useState<LocalePack>(getLocalePack('fr-BE'));

  // Load saved locale from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved && ['fr-BE', 'fr-FR', 'fr-CH'].includes(saved)) {
        setLocaleState(saved as LocaleCode);
        setLocalePack(getLocalePack(saved as LocaleCode));
      } else {
        // Try to detect locale from browser
        const detected = detectLocale({
          browserLocale: navigator.language,
        });
        setLocaleState(detected);
        setLocalePack(getLocalePack(detected));
      }
    }
  }, []);

  // Update locale and save to localStorage
  const setLocale = useCallback((newLocale: LocaleCode) => {
    setLocaleState(newLocale);
    setLocalePack(getLocalePack(newLocale));
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
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

  return {
    locale,
    localePack,
    setLocale,
    taxRates,
    validateQuote,
    formatCurrency,
    formatDate,
  };
}
