import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getLocalePack, type LocaleCode } from "@/lib/locale-packs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency according to a specific locale.
 * For components with locale context, use useLocaleContext().formatCurrency instead.
 * This function is for server-side or non-React contexts.
 */
export function formatCurrencyWithLocale(amount: number, localeCode: LocaleCode = 'fr-BE'): string {
  const localePack = getLocalePack(localeCode);
  const { symbol, position, decimalSeparator, thousandsSeparator, decimals } = localePack.currency;

  const formatted = amount
    .toFixed(decimals)
    .replace('.', decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  return position === 'before'
    ? `${symbol}${formatted}`
    : `${formatted} ${symbol}`;
}

/**
 * Format date according to a specific locale.
 * For components with locale context, use useLocaleContext().formatDate instead.
 * This function is for server-side or non-React contexts.
 */
export function formatDateWithLocale(date: string | Date, localeCode: LocaleCode = 'fr-BE'): string {
  const localePack = getLocalePack(localeCode);
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(localePack.date.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date and time according to a specific locale.
 * For components with locale context, use useLocaleContext().formatDateTime instead.
 * This function is for server-side or non-React contexts.
 */
export function formatDateTimeWithLocale(date: string | Date, localeCode: LocaleCode = 'fr-BE'): string {
  const localePack = getLocalePack(localeCode);
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(localePack.date.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * @deprecated Use useLocaleContext().formatCurrency or formatCurrencyWithLocale instead.
 * This function is kept for backwards compatibility but defaults to fr-BE.
 */
export function formatCurrency(amount: number): string {
  return formatCurrencyWithLocale(amount, 'fr-BE');
}

/**
 * @deprecated Use useLocaleContext().formatDate or formatDateWithLocale instead.
 * This function is kept for backwards compatibility but defaults to fr-BE.
 */
export function formatDate(date: string | Date): string {
  return formatDateWithLocale(date, 'fr-BE');
}

/**
 * @deprecated Use useLocaleContext().formatDateTime or formatDateTimeWithLocale instead.
 * This function is kept for backwards compatibility but defaults to fr-BE.
 */
export function formatDateTime(date: string | Date): string {
  return formatDateTimeWithLocale(date, 'fr-BE');
}

export function calculateTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * taxRate / 100 * 100) / 100;
}

export function calculateGrandTotal(subtotal: number, taxAmount: number): number {
  return Math.round((subtotal + taxAmount) * 100) / 100;
}

export function generateValidUntilDate(daysFromNow: number = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
