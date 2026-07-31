'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Statement } from '@/lib/types';
import { ArrowLeft, CheckCircle2, RefreshCw, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function StatementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const statementId = params?.id as string;

  const [store, setStore] = useState(DataStore.getStore());
  const [statement, setStatement] = useState<Statement | null>(null);
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [paymentNote, setPaymentNote] = useState('');
  const [showConfirmReopen, setShowConfirmReopen] = useState(false);

  useEffect(() => {
    const s = DataStore.getStore();
    setStore(s);
    const stmt = s.statements.find((st) => st.id === statementId);
    if (stmt) setStatement(stmt);
  }, [statementId]);

  if (!statement) {
    return (
      <Navigation>
        <div className="p-8 text-center text-slate-400">Resumen no encontrado.</div>
      </Navigation>
    );
  }

  const card = store.cards.find((c) => c.id === statement.card_id);
  const isPaid = statement.status === 'paid';

  const handleMarkPaid = () => {
    const currentStore = DataStore.getStore();
    currentStore.statements = currentStore.statements.map((s) => {
      if (s.id === statementId) {
        return {
          ...s,
          status: 'paid' as const,
          paid_at: paymentDate,
          paid_by_user_id: currentStore.currentUserId,
          note: paymentNote,
        };
      }
      return s;
    });

    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Marcó resumen como pagado', 'statement', statementId, null, { paid_at: paymentDate, note: paymentNote });
    setStatement({ ...statement, status: 'paid', paid_at: paymentDate, note: paymentNote });
  };

  const handleReopen = () => {
    const currentStore = DataStore.getStore();
    currentStore.statements = currentStore.statements.map((s) => {
      if (s.id === statementId) {
        return {
          ...s,
          status: 'open' as const,
          paid_at: null,
          paid_by_user_id: null,
        };
      }
      return s;
    });

    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Reabrió resumen pagado', 'statement', statementId);
    setStatement({ ...statement, status: 'open', paid_at: null });
    setShowConfirmReopen(false);
  };

  return (
    <Navigation>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/statements')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Resúmenes</span>
          </button>
          <h1 className="text-xl font-bold text-white">Detalle de Resumen</h1>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-6">
          {/* Statement Overview Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400">
                {card?.name} • Período {statement.period_month}/{statement.period_year}
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">
                Cierre: {statement.closing_date}
              </h2>
              <span className="text-xs text-amber-400 font-semibold">
                Vence: {statement.due_date}
              </span>
            </div>

            <div>
              {isPaid ? (
                <Badge variant="green" className="text-sm px-3 py-1.5">
                  ✓ Resumen Pagado
                </Badge>
              ) : (
                <Badge variant="yellow" className="text-sm px-3 py-1.5">
                  Pendiente de Pago
                </Badge>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Total Exigible en Resumen</span>
            <CurrencyDisplay
              amount={statement.total_ars || 0}
              currency={card?.primary_currency || 'ARS'}
              size="xl"
            />
          </div>

          {/* Action Box: Mark Paid or Reopen */}
          {isPaid ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Resumen marcado como pagado el {statement.paid_at}</span>
              </div>
              {statement.note && <p className="text-xs text-slate-300">Nota: {statement.note}</p>}

              {showConfirmReopen ? (
                <div className="bg-slate-900 p-3 rounded-xl space-y-2 border border-slate-700">
                  <p className="text-xs text-rose-400 font-semibold">
                    ¿Confirmás que querés reabrir este resumen? Se registrará en la auditoría.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReopen}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs"
                    >
                      Sí, Reabrir Resumen
                    </button>
                    <button
                      onClick={() => setShowConfirmReopen(false)}
                      className="bg-slate-800 text-slate-300 font-bold py-1.5 px-3 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmReopen(true)}
                  className="text-xs text-slate-400 hover:text-white underline font-semibold"
                >
                  Desmarcar pago y reabrir resumen
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Marcar Resumen como Pagado
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Fecha Real de Pago *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Nota Opcional de Pago
                  </label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Ej. Débito automático en cuenta Santander"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                <button
                  onClick={handleMarkPaid}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Pago de Resumen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Navigation>
  );
}
