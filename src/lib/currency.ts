import { Currency } from './types';

/**
 * Format ARS or USD currency strictly following Argentine locale standards.
 * ARS: $ 1.250,50
 * USD: USD 1.250,50
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currency === 'USD') {
    return `USD ${formattedNumber}`;
  }

  return `$ ${formattedNumber}`;
}

/**
 * Ensures zero-decimal representation for whole numbers if clean format is preferred
 */
export function formatCurrencyClean(amount: number, currency: Currency): string {
  const hasDecimals = amount % 1 !== 0;
  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);

  if (currency === 'USD') {
    return `USD ${formattedNumber}`;
  }

  return `$ ${formattedNumber}`;
}

export interface DualCurrencyTotal {
  ARS: number;
  USD: number;
}

export function createEmptyTotals(): DualCurrencyTotal {
  return { ARS: 0, USD: 0 };
}
