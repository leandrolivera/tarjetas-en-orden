'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Expense } from '@/lib/types';
import {
  PlusCircle,
  Search,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { exportExpensesToCSV, downloadCSV } from '@/lib/csv';

export default function ExpenseListPage() {
  const [store, setStore] = useState(DataStore.getStore());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchant'>('date');

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const handleTogglePayment = (expenseId: string, isCurrentlyPaid?: boolean) => {
    const confirmMessage = isCurrentlyPaid
      ? '¿Deseás anular el check y volver a marcar este gasto como pendiente de pago?'
      : '¿Confirmás que se realizó el pago de este gasto?';

    if (window.confirm(confirmMessage)) {
      const updatedStore = DataStore.toggleExpensePaymentStatus(expenseId);
      setStore({ ...updatedStore });
    }
  };

  const filteredExpenses = (store.expenses || [])
    .filter((e) => !e.archived_at)
    .filter((e) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = e.description.toLowerCase().includes(term);
        const matchesMerchant = e.merchant.toLowerCase().includes(term);
        if (!matchesDesc && !matchesMerchant) return false;
      }
      if (selectedCardId && e.card_id !== selectedCardId) return false;
      if (selectedCategoryId && e.category_id !== selectedCategoryId) return false;
      if (selectedCurrency && e.currency !== selectedCurrency) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
      if (sortBy === 'amount') return b.total_amount - a.total_amount;
      if (sortBy === 'merchant') return a.merchant.localeCompare(b.merchant);
      return 0;
    });

  const handleExportCSV = () => {
    const csv = exportExpensesToCSV(filteredExpenses);
    downloadCSV(`gastos_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <Navigation>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Registro de Gastos</h1>
            <p className="text-xs text-slate-400">Tocá la casilla ✓ de cualquier gasto para marcarlo como pagado en 1 toque</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <Link
              href="/expenses/new"
              className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center gap-2 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Gasto</span>
            </Link>
          </div>
        </div>

        {/* FILTERS & SEARCH BAR */}
        <div className="glass-card p-4 rounded-3xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por descripción o comercio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition"
              >
                <option value="">Todas las Tarjetas</option>
                {(store.cards || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition"
              >
                <option value="">Todas las Categorías</option>
                {(store.categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-sky-500 transition"
              >
                <option value="">Cualquier Moneda</option>
                <option value="ARS">ARS ($)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* EXPENSES LIST TABLE */}
        <div className="glass-card rounded-3xl overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No se encontraron gastos con los criterios seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Estado Pago</th>
                    <th className="py-3.5 px-4">Fecha / Compra</th>
                    <th className="py-3.5 px-4">Comercio</th>
                    <th className="py-3.5 px-4">Tarjeta</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4 text-right">Cuotas</th>
                    <th className="py-3.5 px-4 text-right">Importe Total</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredExpenses.map((exp) => {
                    const card = (store.cards || []).find((c) => c.id === exp.card_id);
                    const cat = (store.categories || []).find((c) => c.id === exp.category_id);
                    const purchaser = (store.people || []).find((p) => p.id === exp.purchaser_id);

                    return (
                      <tr key={exp.id} className={`transition ${exp.is_paid ? 'bg-slate-900/30 opacity-70' : 'hover:bg-slate-800/40'}`}>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleTogglePayment(exp.id)}
                            className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center mx-auto transition ${
                              exp.is_paid
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                : 'bg-slate-800 border border-slate-600 text-transparent hover:border-sky-400'
                            }`}
                            title={exp.is_paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                          >
                            ✓
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className={`font-bold text-sm ${exp.is_paid ? 'line-through text-slate-400' : 'text-white'}`}>
                            {exp.description}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-sky-400" />
                            <span>{exp.purchase_date}</span>
                            <span>•</span>
                            <span>Compró: <b>{purchaser?.name || 'Titular'}</b></span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {exp.merchant}
                        </td>

                        <td className="py-3.5 px-4">
                          {card && (
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: card.color || '#0284c7' }}
                              />
                              <span className="font-medium text-slate-200">{card.name}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="blue">{cat?.name || 'Categoría'}</Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sky-400">
                          {exp.installments_count > 1 ? `${exp.installments_count} cuotas` : '1 pago'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <CurrencyDisplay amount={exp.total_amount} currency={exp.currency} size="md" />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/expenses/${exp.id}`}
                            className="text-xs text-sky-400 font-semibold hover:underline"
                          >
                            Ver / Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Navigation>
  );
}
