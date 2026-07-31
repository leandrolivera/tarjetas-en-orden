'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { Card, Currency } from '@/lib/types';
import { ArrowLeft, Save, Trash2, CheckCircle2 } from 'lucide-react';

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.id as string;

  const [store, setStore] = useState(DataStore.getStore());
  const [card, setCard] = useState<Card | null>(null);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [brand, setBrand] = useState('Visa');
  const [lastFourDigits, setLastFourDigits] = useState('');
  const [defaultClosingDay, setDefaultClosingDay] = useState(25);
  const [defaultDueDay, setDefaultDueDay] = useState(5);
  const [primaryCurrency, setPrimaryCurrency] = useState<Currency>('ARS');
  const [color, setColor] = useState('#0284c7');
  const [isActive, setIsActive] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const s = DataStore.getStore();
    setStore(s);
    const c = s.cards.find((card) => card.id === cardId);
    if (c) {
      setCard(c);
      setName(c.name);
      setBank(c.bank);
      setCardholderName(c.cardholder_name);
      setBrand(c.brand);
      setLastFourDigits(c.last_four_digits);
      setDefaultClosingDay(c.default_closing_day);
      setDefaultDueDay(c.default_due_day);
      setPrimaryCurrency(c.primary_currency);
      setColor(c.color);
      setIsActive(c.is_active);
    }
  }, [cardId]);

  if (!card) {
    return (
      <Navigation>
        <div className="p-8 text-center text-slate-400">Tarjeta no encontrada.</div>
      </Navigation>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStore = DataStore.getStore();
    currentStore.cards = currentStore.cards.map((c) => {
      if (c.id === cardId) {
        return {
          ...c,
          name,
          bank,
          cardholder_name: cardholderName,
          brand,
          last_four_digits: lastFourDigits,
          default_closing_day: defaultClosingDay,
          default_due_day: defaultDueDay,
          primary_currency: primaryCurrency,
          color,
          is_active: isActive,
        };
      }
      return c;
    });

    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Editó tarjeta', 'card', cardId, card, { name, isActive });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
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
          <h1 className="text-xl font-bold text-white">Editar Tarjeta</h1>
        </div>

        <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Nombre Personalizado de la Tarjeta *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Estado
              </label>
              <select
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva (Conserva historial)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Día habit. de Cierre
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={defaultClosingDay}
                onChange={(e) => setDefaultClosingDay(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Día habit. de Vencimiento
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={defaultDueDay}
                onChange={(e) => setDefaultDueDay(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>
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

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tarjeta actualizada correctamente.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </form>
      </div>
    </Navigation>
  );
}
