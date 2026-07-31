import React from 'react';
import { Card } from '@/lib/types';
import { CreditCard, Calendar } from 'lucide-react';

interface CardVisualProps {
  card: Card;
  onClick?: () => void;
  showDetails?: boolean;
}

export function CardVisual({ card, onClick, showDetails = true }: CardVisualProps) {
  const bgColor = card.color || '#0284c7';

  return (
    <div
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${bgColor}ee, ${bgColor}99), #0f172a`,
      }}
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-xl transition transform hover:-translate-y-1 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-white/70 block">
            {card.bank}
          </span>
          <h3 className="font-bold text-lg leading-snug">{card.name}</h3>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="mb-4">
        <span className="text-xs text-white/60 tracking-widest block mb-1">NÚMERO DE TARJETA</span>
        <div className="text-xl font-mono tracking-widest flex items-center gap-3">
          <span>••••</span>
          <span>••••</span>
          <span>••••</span>
          <span className="font-bold">{card.last_four_digits}</span>
        </div>
      </div>

      <div className="flex items-end justify-between text-xs pt-2 border-t border-white/15">
        <div>
          <span className="text-white/60 block text-[10px] uppercase font-medium">TITULAR</span>
          <span className="font-semibold text-white/90">{card.cardholder_name}</span>
        </div>
        {showDetails && (
          <div className="text-right flex items-center gap-2 text-white/80 text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Cierre: <b>{card.default_closing_day}</b></span>
            <span>•</span>
            <span>Venc: <b>{card.default_due_day}</b></span>
          </div>
        )}
      </div>
    </div>
  );
}
