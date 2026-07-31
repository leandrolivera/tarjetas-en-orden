'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { Currency, DistributionType, Expense } from '@/lib/types';
import { calculateInstallments } from '@/lib/installments';
import { formatCurrency } from '@/lib/currency';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  CreditCard,
  Tag,
  Users,
  DollarSign,
  Receipt,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function NewExpensePage() {
  const router = useRouter();
  const [store, setStore] = useState(DataStore.getStore());

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const defaultCard = store.cards[0]?.id || '';
  const defaultCategory = store.categories[0]?.id || '';
  const defaultPerson = store.people[0]?.id || '';

  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [cardId, setCardId] = useState(defaultCard);
  const [categoryId, setCategoryId] = useState(defaultCategory);
  const [purchaserId, setPurchaserId] = useState(defaultPerson);
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [distributionType, setDistributionType] = useState<DistributionType>('shared_equal');
  const [notes, setNotes] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayStr);

  const [thirdPartyPersonId, setThirdPartyPersonId] = useState(store.people[2]?.id || defaultPerson);
  const [customPctPersonA, setCustomPctPersonA] = useState(70);
  const [customPctPersonB, setCustomPctPersonB] = useState(30);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const numAmount = typeof totalAmount === 'number' ? totalAmount : 0;

  // Calculate live cuotas preview
  let calculatedCuotas: any[] = [];
  if (numAmount > 0 && installmentsCount >= 1) {
    calculatedCuotas = calculateInstallments(numAmount, installmentsCount, currency, purchaseDate);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !merchant || numAmount <= 0) return;

    const newExpenseId = 'exp-' + Date.now();
    const currentStore = DataStore.getStore();

    // Generate Allocations
    let allocations: any[] = [];
    if (distributionType === 'shared_equal') {
      const p1 = currentStore.people[0];
      const p2 = currentStore.people[1] || p1;
      const half = numAmount / 2;
      allocations = [
        { id: 'alloc-1', expense_id: newExpenseId, person_id: p1.id, percentage: 50, amount: half },
        { id: 'alloc-2', expense_id: newExpenseId, person_id: p2.id, percentage: 50, amount: half },
      ];
    } else if (distributionType === 'third_party_100') {
      allocations = [
        { id: 'alloc-1', expense_id: newExpenseId, person_id: thirdPartyPersonId, percentage: 100, amount: numAmount },
      ];
    } else {
      allocations = [
        { id: 'alloc-1', expense_id: newExpenseId, person_id: purchaserId, percentage: 100, amount: numAmount },
      ];
    }

    const newExpense: Expense = {
      id: newExpenseId,
      household_id: 'household-hogar-999',
      card_id: cardId,
      category_id: categoryId,
      purchaser_id: purchaserId,
      description,
      merchant,
      total_amount: numAmount,
      currency,
      purchase_date: purchaseDate,
      installments_count: installmentsCount,
      distribution_type: distributionType,
      notes,
      created_by: currentStore.currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      allocations,
      card: currentStore.cards.find((c) => c.id === cardId),
      category: currentStore.categories.find((c) => c.id === categoryId),
      purchaser: currentStore.people.find((p) => p.id === purchaserId),
    };

    // If 100% third party or shared with someone else, create reimbursement obligation
    if (distributionType === 'third_party_100') {
      const reimb = {
        id: 'reimb-' + Date.now(),
        household_id: 'household-hogar-999',
        expense_id: newExpenseId,
        debtor_person_id: thirdPartyPersonId,
        creditor_person_id: purchaserId,
        amount: numAmount,
        currency,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };
      currentStore.reimbursements.unshift(reimb);
    }

    currentStore.expenses.unshift(newExpense);
    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Creó gasto', 'expense', newExpenseId, null, newExpense);

    setSavedSuccess(true);
  };

  return (
    <Navigation>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-400" />
              Nuevo Gasto
            </h1>
            <p className="text-xs text-slate-400">Carga rápida optimizada para celular y escritorio</p>
          </div>
        </div>

        {savedSuccess ? (
          <div className="glass-card p-8 rounded-3xl text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">¡Gasto registrado con éxito!</h2>
            <p className="text-xs text-slate-300">
              El movimiento fue registrado correctamente y las cuotas y devoluciones se calcularon automáticamente.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSavedSuccess(false);
                  setDescription('');
                  setMerchant('');
                  setTotalAmount('');
                }}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition"
              >
                + Registrar otro gasto
              </button>
              <button
                onClick={() => router.push('/expenses')}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-5 rounded-xl text-xs transition border border-slate-700"
              >
                Ir al listado de gastos
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 rounded-3xl space-y-5">
            {/* 1. Descripcion & Comercio */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Descripción (Mandatoria) *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Supermercado semanal, Regalo mamá, Smart TV"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Comercio / Establecimiento *
                </label>
                <input
                  type="text"
                  required
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="Ej. Coto, Mercado Libre, Dexter, Farmacity"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>

            {/* 2. Importe & Moneda */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Importe Total *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 font-bold text-lg focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="ARS">ARS ($)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            {/* 3. Tarjeta & Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Tarjeta Utilizada
                </label>
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  {store.cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (•••• {c.last_four_digits})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Fecha de Compra
                </label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>

            {/* 4. Categoría & Cuotas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  {store.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Cantidad de Cuotas
                </label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  <option value={1}>1 Pago (Contado)</option>
                  <option value={3}>3 Cuotas</option>
                  <option value={6}>6 Cuotas</option>
                  <option value={12}>12 Cuotas</option>
                  <option value={18}>18 Cuotas</option>
                  <option value={24}>24 Cuotas</option>
                </select>
              </div>
            </div>

            {/* LIVE CUOTAS PREVIEW */}
            {calculatedCuotas.length > 1 && (
              <div className="bg-slate-900/90 border border-sky-500/30 p-4 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                  Vista Previa de Cuotas ({installmentsCount} pagos)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {calculatedCuotas.slice(0, 6).map((c, i) => (
                    <div key={i} className="bg-slate-800/80 p-2 rounded-xl text-center text-xs">
                      <span className="text-[10px] text-slate-400 block">{c.installment_number}/{c.total_installments}</span>
                      <span className="font-bold text-white">{formatCurrency(c.amount, currency)}</span>
                    </div>
                  ))}
                </div>
                {installmentsCount > 6 && (
                  <p className="text-[10px] text-slate-400 text-center italic">
                    y {installmentsCount - 6} cuotas más en los meses siguientes...
                  </p>
                )}
              </div>
            )}

            {/* 5. Comprador & Tipo de Distribución */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold uppercase text-slate-400">
                Persona que Realizó el Pago
              </label>
              <select
                value={purchaserId}
                onChange={(e) => setPurchaserId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              >
                {store.people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.last_name || ''}
                  </option>
                ))}
              </select>

              <label className="block text-xs font-bold uppercase text-slate-400 pt-2">
                Tipo de Distribución de Gasto
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDistributionType('shared_equal')}
                  className={`p-3 rounded-xl text-xs font-bold border transition ${
                    distributionType === 'shared_equal'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🤝 50 / 50 Compartido
                </button>

                <button
                  type="button"
                  onClick={() => setDistributionType('own')}
                  className={`p-3 rounded-xl text-xs font-bold border transition ${
                    distributionType === 'own'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  👤 100% Propio
                </button>

                <button
                  type="button"
                  onClick={() => setDistributionType('third_party_100')}
                  className={`p-3 rounded-xl text-xs font-bold border transition ${
                    distributionType === 'third_party_100'
                      ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  👥 100% De otra persona
                </button>
              </div>

              {distributionType === 'third_party_100' && (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-amber-300">
                    Seleccionar persona que debe devolver el 100%:
                  </label>
                  <select
                    value={thirdPartyPersonId}
                    onChange={(e) => setThirdPartyPersonId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500 transition"
                  >
                    {store.people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.last_name || ''} ({p.alias || 'Persona'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-600 to-emerald-500 hover:from-sky-500 hover:to-emerald-400 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-sky-600/30 transition transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Guardar Gasto</span>
            </button>
          </form>
        )}
      </div>
    </Navigation>
  );
}
