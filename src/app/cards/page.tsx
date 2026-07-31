'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CardVisual } from '@/components/CardVisual';
import { DataStore } from '@/lib/data-store';
import { PlusCircle, CreditCard, Shield, AlertCircle } from 'lucide-react';

export default function CardsListPage() {
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  return (
    <Navigation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Tarjetas de Crédito</h1>
            <p className="text-xs text-slate-400">
              Administrá tus tarjetas, titulares, días de cierre y vencimiento
            </p>
          </div>

          <Link
            href="/cards/new"
            className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nueva Tarjeta</span>
          </Link>
        </div>

        {/* SECURITY NOTICE (Section 4 Compliance) */}
        <div className="bg-sky-500/10 border border-sky-500/30 p-4 rounded-2xl flex items-center gap-3 text-xs text-sky-300">
          <Shield className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <span>
            <b>Seguridad Garantizada:</b> El sistema solo almacena los últimos 4 dígitos. Nunca se solicitan ni guardan números completos, CVV ni claves bancarias.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {store.cards.map((card) => (
            <div key={card.id} className="space-y-3">
              <CardVisual card={card} />
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-slate-400">
                  {card.is_active ? '✅ Tarjeta Activa' : '⏸️ Inactiva'}
                </span>
                <Link
                  href={`/cards/${card.id}`}
                  className="text-xs text-sky-400 font-semibold hover:underline"
                >
                  Editar Ajustes
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Navigation>
  );
}
