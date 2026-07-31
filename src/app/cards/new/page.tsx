'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { Card, Currency } from '@/lib/types';
import { CreditCard, Save, ArrowLeft, Shield } from 'lucide-react';

export default function NewCardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [cardholderName, setCardholderName] = useState('César Rodríguez');
  const [brand, setBrand] = useState('Visa');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [defaultClosingDay, setDefaultClosingDay] = useState(25);
  const [defaultDueDay, setDefaultDueDay] = useState(5);
  const [primaryCurrency, setPrimaryCurrency] = useState<Currency>('ARS');
  const [color, setColor] = useState('#0284c7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(lastFourDigits)) {
      alert('Ingresá exactamente los últimos 4 dígitos numéricos.');
      return;
    }

    const currentStore = DataStore.getStore();
    const newCard: Card = {
      id: 'card-' + Date.now(),
      household_id: 'household-hogar-999',
      name,
      bank,
      cardholder_name: cardholderName,
      brand,
      last_four_digits: lastFourDigits,
      default_closing_day: defaultClosingDay,
      default_due_day: defaultDueDay,
      primary_currency: primaryCurrency,
      color,
      is_active: true,
      created_by: currentStore.currentUserId,
      created_at: new Date().toISOString(),
    };

    currentStore.cards.push(newCard);
    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Creó tarjeta', 'card', newCard.id, null, newCard);

    router.push('/cards');
  };

  return (
    <Navigation>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/cards')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Tarjetas</span>
          </button>
          <h1 className="text-xl font-bold text-white">Nueva Tarjeta de Crédito</h1>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-3xl space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Nombre Personalizado de la Tarjeta *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Visa Galicia César"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Banco Emisor *
              </label>
              <input
                type="text"
                required
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ej. Banco Galicia"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Marca de Tarjeta
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="American Express">American Express</option>
                <option value="Naranja X">Naranja X</option>
                <option value="Otra">Otra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Titular de la Tarjeta *
              </label>
              <input
                type="text"
                required
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Últimos 4 Dígitos *
              </label>
              <input
                type="text"
                maxLength={4}
                required
                value={lastFourDigits}
                onChange={(e) => setLastFourDigits(e.target.value)}
                placeholder="4589"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Día Habitual de Cierre (1-31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={defaultClosingDay}
                onChange={(e) => setDefaultClosingDay(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Día Habitual de Vencimiento (1-31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={defaultDueDay}
                onChange={(e) => setDefaultDueDay(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Moneda Principal
              </label>
              <select
                value={primaryCurrency}
                onChange={(e) => setPrimaryCurrency(e.target.value as Currency)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              >
                <option value="ARS">ARS ($)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Color Identificatorio
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer p-1"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Tarjeta</span>
          </button>
        </form>
      </div>
    </Navigation>
  );
}
