import React from 'react';
import { Currency } from '@/lib/types';
import { formatCurrency } from '@/lib/currency';

interface CurrencyDisplayProps {
  amount: number;
  currency: Currency;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function CurrencyDisplay({ amount, currency, size = 'md', className = '' }: CurrencyDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-bold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-black tracking-tight',
  };

  const currencyBadgeColor = currency === 'USD' 
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    : 'bg-sky-500/20 text-sky-400 border-sky-500/30';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${currencyBadgeColor}`}>
        {currency}
      </span>
      <span className={`${sizeClasses[size]} text-slate-100`}>
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function DualCurrencyView({ arsAmount, usdAmount }: { arsAmount: number; usdAmount: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <CurrencyDisplay amount={arsAmount} currency="ARS" size="lg" />
      {usdAmount > 0 && (
        <>
          <span className="hidden sm:inline text-slate-600">|</span>
          <CurrencyDisplay amount={usdAmount} currency="USD" size="lg" />
        </>
      )}
    </div>
  );
}
