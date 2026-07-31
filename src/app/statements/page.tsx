'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Statement } from '@/lib/types';
import { PieChart, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

export default function StatementsListPage() {
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  return (
    <Navigation>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Resúmenes Mensuales de Tarjetas</h1>
          <p className="text-xs text-slate-400">
            Control de cierres, vencimientos y estado de pago de los resúmenes bancarios
          </p>
        </div>

        <div className="space-y-6">
          {store.cards.map((card) => {
            const cardStatements = store.statements.filter((s) => s.card_id === card.id);

            return (
              <div key={card.id} className="glass-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: card.color || '#0284c7' }}
                    />
                    <div>
                      <h3 className="font-bold text-base text-white">{card.name}</h3>
                      <span className="text-xs text-slate-400">{card.bank} • Titular: {card.cardholder_name}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">•••• {card.last_four_digits}</span>
                </div>

                {cardStatements.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center">
                    No hay resúmenes generados para esta tarjeta.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {cardStatements.map((stmt) => (
                      <Link
                        key={stmt.id}
                        href={`/statements/${stmt.id}`}
                        className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 p-4 rounded-2xl transition space-y-3 block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">
                            Período {stmt.period_month}/{stmt.period_year}
                          </span>
                          {stmt.status === 'paid' ? (
                            <Badge variant="green">Pagado ✓</Badge>
                          ) : (
                            <Badge variant="yellow">Pendiente</Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-xs text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Cierre:</span>
                            <span className="font-semibold text-slate-200">{stmt.closing_date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Vencimiento:</span>
                            <span className="font-semibold text-amber-400">{stmt.due_date}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Total Exigible</span>
                          <CurrencyDisplay
                            amount={stmt.total_ars || 0}
                            currency={card.primary_currency}
                            size="md"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Navigation>
  );
}
