'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { DataStore } from '@/lib/data-store';
import { Expense, Currency, DistributionType } from '@/lib/types';
import {
  ArrowLeft,
  AlertTriangle,
  Save,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params?.id as string;

  const [store, setStore] = useState(DataStore.getStore());
  const [expense, setExpense] = useState<Expense | null>(null);

  // Editable states for ALL fields
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [cardId, setCardId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchaserId, setPurchaserId] = useState('');
  const [distributionType, setDistributionType] = useState<DistributionType>('shared_equal');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const s = DataStore.getStore();
    setStore(s);
    const exp = s.expenses.find((e) => e.id === expenseId);
    if (exp) {
      setExpense(exp);
      setDescription(exp.description);
      setMerchant(exp.merchant);
      setTotalAmount(exp.total_amount);
      setCurrency(exp.currency);
      setCardId(exp.card_id);
      setCategoryId(exp.category_id);
      setPurchaserId(exp.purchaser_id);
      setDistributionType(exp.distribution_type);
      setInstallmentsCount(exp.installments_count);
      setPurchaseDate(exp.purchase_date);
      setNotes(exp.notes || '');
    }
  }, [expenseId]);

  if (!expense) {
    return (
      <Navigation>
        <div className="p-8 text-center text-slate-400">Gasto no encontrado.</div>
      </Navigation>
    );
  }

  // Check if associated statement is paid
  const isStatementPaid = store.statements.some(
    (s) => s.card_id === expense.card_id && s.status === 'paid'
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStore = DataStore.getStore();
    const updatedExpenses = currentStore.expenses.map((e) => {
      if (e.id === expenseId) {
        return {
          ...e,
          description,
          merchant,
          total_amount: Number(totalAmount),
          currency,
          card_id: cardId,
          category_id: categoryId,
          purchaser_id: purchaserId,
          distribution_type: distributionType,
          installments_count: Number(installmentsCount),
          purchase_date: purchaseDate,
          notes,
          updated_at: new Date().toISOString(),
        };
      }
      return e;
    });

    currentStore.expenses = updatedExpenses;
    DataStore.saveStore(currentStore);
    DataStore.addAuditLog(
      currentStore.households[0]?.id || 'household-default',
      'Editó gasto completo',
      'expense',
      expenseId,
      expense,
      { description, merchant, totalAmount, currency, cardId, categoryId, purchaserId, distributionType, installmentsCount, purchaseDate, notes }
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleArchive = () => {
    if (confirm('¿Estás seguro de archivar este gasto? El historial de auditoría se conservará.')) {
      const currentStore = DataStore.getStore();
      currentStore.expenses = currentStore.expenses.map((e) => {
        if (e.id === expenseId) {
          return {
            ...e,
            archived_at: new Date().toISOString(),
            archived_by: currentStore.currentUserId,
          };
        }
        return e;
      });
      DataStore.saveStore(currentStore);
      DataStore.addAuditLog(currentStore.households[0]?.id || 'household-default', 'Archivó gasto', 'expense', expenseId);
      router.push('/expenses');
    }
  };

  return (
    <Navigation>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/expenses')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Gastos</span>
          </button>

          <button
            onClick={handleArchive}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Archivar Gasto</span>
          </button>
        </div>

        {/* WARNING GUARDRAIL FOR PAID STATEMENTS */}
        {isStatementPaid && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Advertencia de Seguridad</h4>
              <p>
                Este gasto pertenece a un resumen ya pagado. Las modificaciones cambiarán los totales futuros.
              </p>
            </div>
          </div>
        )}

        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400">Editar Gasto Completo</span>
              <h1 className="text-xl font-bold text-white">{description || 'Sin Descripción'}</h1>
            </div>
            <CurrencyDisplay amount={totalAmount} currency={currency} size="lg" />
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Descripción de la Compra *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Supermercado semanal"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
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
                placeholder="Ej. Coto, Frávega, YPF"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            {/* IMPORTE TOTAL Y MONEDA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Importe Total *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="ARS">ARS ($)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            {/* TARJETA Y CATEGORÍA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Tarjeta de Crédito Utilizada *
                </label>
                <select
                  value={cardId}
                  onChange={(e) => setCardId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  {(store.cards || []).map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} ({card.bank})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Categoría *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  {(store.categories || []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* COMPRÓ (QUIÉN PAGÓ) Y TIPO DE DISTRIBUCIÓN (QUIÉN DEBE) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  ¿Quién realizó la compra / pagó? *
                </label>
                <select
                  value={purchaserId}
                  onChange={(e) => setPurchaserId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  {(store.people || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.last_name || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  ¿Quién debe el dinero? (Distribución) *
                </label>
                <select
                  value={distributionType}
                  onChange={(e) => setDistributionType(e.target.value as DistributionType)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  <option value="shared_equal">🤝 50/50 Compartido Pareja</option>
                  <option value="own">👤 100% Propio (Personal)</option>
                  <option value="third_party_100">👥 100% De otra persona (Tercero)</option>
                </select>
              </div>
            </div>

            {/* CUOTAS Y FECHA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                  Cantidad de Cuotas
                </label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  <option value={1}>1 Pago (Contado)</option>
                  <option value={3}>3 Cuotas</option>
                  <option value={6}>6 Cuotas</option>
                  <option value={12}>12 Cuotas</option>
                  <option value={18}>18 Cuotas</option>
                  <option value={24}>24 Cuotas</option>
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

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Notas adicionales
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Detalles opcionales sobre el gasto..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Gasto actualizado con éxito!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios del Gasto</span>
            </button>
          </form>
        </div>
      </div>
    </Navigation>
  );
}
