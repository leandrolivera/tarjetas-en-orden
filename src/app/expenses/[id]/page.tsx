'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Expense } from '@/lib/types';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Tag,
  User,
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
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
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

  const card = store.cards.find((c) => c.id === expense.card_id);
  const category = store.categories.find((c) => c.id === expense.category_id);
  const purchaser = store.people.find((p) => p.id === expense.purchaser_id);

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
          notes,
          updated_at: new Date().toISOString(),
        };
      }
      return e;
    });

    currentStore.expenses = updatedExpenses;
    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Editó gasto', 'expense', expenseId, expense, { description, merchant, notes });

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
      DataStore.addAuditLog('household-hogar-999', 'Archivó gasto', 'expense', expenseId);
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

        {/* WARNING GUARDRAIL FOR PAID STATEMENTS (Section 9 compliance) */}
        {isStatementPaid && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-0.5">Advertencia de Seguridad</h4>
              <p>
                Este gasto se encuentra asociado a un resumen de tarjeta ya pagado. Los cambios críticos en cuotas o montos están protegidos para evitar inconsistencias contables.
              </p>
            </div>
          </div>
        )}

        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400">Detalle del Gasto</span>
              <h1 className="text-xl font-bold text-white">{expense.description}</h1>
            </div>
            <CurrencyDisplay amount={expense.total_amount} currency={expense.currency} size="lg" />
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Descripción
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                Comercio
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Tarjeta</span>
                <span className="font-bold text-white">{card?.name}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Categoría</span>
                <span className="font-bold text-white">{category?.name}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Compró</span>
                <span className="font-bold text-white">{purchaser?.name}</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl">
                <span className="text-slate-500 block mb-0.5">Cuotas</span>
                <span className="font-bold text-sky-400">{expense.installments_count} cuotas</span>
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
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cambios guardados en el historial de auditoría.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </form>
        </div>
      </div>
    </Navigation>
  );
}
