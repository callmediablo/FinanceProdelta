import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency (EUR)
 */
export function formatCurrency(amount: number, showSign: boolean = false): string {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  if (showSign && amount > 0) {
    return '+' + formatter.format(amount);
  }
  
  return formatter.format(amount);
}

/**
 * Formats a date as a relative string (today, yesterday, date)
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (inputDate.getTime() === today.getTime()) {
    return 'Heute';
  }
  
  if (inputDate.getTime() === yesterday.getTime()) {
    return 'Gestern';
  }
  
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

/**
 * Formats a percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
