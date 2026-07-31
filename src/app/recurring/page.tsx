'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { RecurringExpense, RecurringFrequency, Currency } from '@/lib/types';
import { Repeat, Play, Pause, PlusCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { format, addMonths } from 'date-fns';

export default function RecurringExpensesPage() {
  const [store, setStore] = useState(DataStore.getStore());
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [showForm, setShowForm] = useState(false);
  const [triggeredMsg, setTriggeredMsg] = useState('');

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = typeof amount === 'number' ? amount : 0;
    if (!description || numAmt <= 0) return;

    const currentStore = DataStore.getStore();
    const newRec: RecurringExpense = {
      id: 'rec-' + Date.now(),
      household_id: 'household-hogar-999',
      card_id: currentStore.cards[0]?.id || '',
      category_id: currentStore.categories[0]?.id || '',
      purchaser_id: currentStore.people[0]?.id || '',
      description,
      merchant: merchant || description,
      amount: numAmt,
      currency,
      distribution_type: 'shared_equal',
      frequency,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      next_execution_date: format(new Date(), 'yyyy-MM-dd'),
      is_active: true,
      created_by: currentStore.currentUserId,
      created_at: new Date().toISOString(),
    };

    currentStore.recurring.unshift(newRec);
    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Creó gasto recurrente', 'recurring_expense', newRec.id, null, newRec);

    setStore({ ...currentStore });
    setShowForm(false);
    setDescription('');
    setAmount('');
  };

  const handleToggleActive = (id: string) => {
    const currentStore = DataStore.getStore();
    currentStore.recurring = currentStore.recurring.map((r) => {
      if (r.id === id) {
        return { ...r, is_active: !r.is_active };
      }
      return r;
    });
    DataStore.saveStore(currentStore);
    setStore({ ...currentStore });
  };

  // Idempotent execution of active recurring expenses
  const handleTriggerAll = () => {
    const currentStore = DataStore.getStore();
    let generatedCount = 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    currentStore.recurring.forEach((rec) => {
      if (!rec.is_active) return;

      // Idempotency check: don't duplicate if expense with same desc + date already exists
      const exists = currentStore.expenses.some(
        (e) => e.description === rec.description && e.purchase_date === rec.next_execution_date
      );

      if (!exists) {
        const newExpense = {
          id: 'exp-rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          household_id: rec.household_id,
          card_id: rec.card_id,
          category_id: rec.category_id,
          purchaser_id: rec.purchaser_id,
          description: rec.description,
          merchant: rec.merchant,
          total_amount: rec.amount,
          currency: rec.currency,
          purchase_date: rec.next_execution_date,
          installments_count: 1,
          distribution_type: rec.distribution_type,
          notes: 'Generado automáticamente desde gasto recurrente',
          created_by: rec.created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        currentStore.expenses.unshift(newExpense);
        generatedCount += 1;
      }
    });

    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Ejecutó motor de gastos recurrentes', 'recurring_engine', 'sys', null, { generatedCount });

    setTriggeredMsg(`Proceso ejecutado. Se generaron ${generatedCount} gastos nuevos sin duplicar.`);
    setStore({ ...currentStore });
  };

  return (
    <Navigation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Gastos Recurrentes</h1>
            <p className="text-xs text-slate-400">
              Suscripciones y servicios habituales que generan gastos automáticos sin duplicar
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerAll}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ejecutar Proceso Recurrente</span>
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nueva Recurrencia</span>
            </button>
          </div>
        </div>

        {triggeredMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{triggeredMsg}</span>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="glass-card p-6 rounded-3xl space-y-4 max-w-xl">
            <h3 className="font-bold text-sm text-white">Crear Nueva Recurrencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Descripción *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Netflix, Spotify, Gimnasio"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Comercio</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Ej. Netflix Inc"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Importe *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="ARS">ARS ($)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Frecuencia</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              >
                <option value="monthly">Mensual</option>
                <option value="bimonthly">Bimestral</option>
                <option value="quarterly">Trimestral</option>
                <option value="semiannual">Semestral</option>
                <option value="annual">Anual</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs"
            >
              Guardar Recurrencia
            </button>
          </form>
        )}

        <div className="space-y-4">
          {store.recurring.map((rec) => {
            const card = store.cards.find((c) => c.id === rec.card_id);
            const cat = store.categories.find((c) => c.id === rec.category_id);

            return (
              <div key={rec.id} className="glass-card p-5 rounded-3xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{rec.description}</span>
                    {rec.is_active ? (
                      <Badge variant="green">Activa</Badge>
                    ) : (
                      <Badge variant="gray" className="font-bold">Pausada</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Comercio: {rec.merchant} • Tarjeta: {card?.name} • Frecuencia: <span className="capitalize">{rec.frequency}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Próxima ejecución: <b>{rec.next_execution_date}</b>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <CurrencyDisplay amount={rec.amount} currency={rec.currency} size="lg" />
                  <button
                    onClick={() => handleToggleActive(rec.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                      rec.is_active ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    {rec.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="hidden sm:inline">{rec.is_active ? 'Pausar' : 'Reactivar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Navigation>
  );
}
