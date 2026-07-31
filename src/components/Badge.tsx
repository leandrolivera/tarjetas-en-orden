import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  variant?: 'green' | 'yellow' | 'red' | 'gray' | 'blue';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  const styles = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    red: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    gray: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
    blue: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
