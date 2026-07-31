'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Reimbursement } from '@/lib/types';
import { DollarSign, CheckCircle2, UserCheck, Clock, ArrowRight, History } from 'lucide-react';
import { format } from 'date-fns';

export default function PendingReimbursementsPage() {
  const [store, setStore] = useState(DataStore.getStore());
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const pendingList = store.reimbursements.filter((r) => r.status === 'pending');

  const handleMarkReceived = (reimbId: string) => {
    const currentStore = DataStore.getStore();
    const note = noteMap[reimbId] || '';
    const receivedDate = format(new Date(), 'yyyy-MM-dd');

    currentStore.reimbursements = currentStore.reimbursements.map((r) => {
      if (r.id === reimbId) {
        return {
          ...r,
          status: 'received' as const,
          received_at: receivedDate,
          received_by_user_id: currentStore.currentUserId,
          note,
        };
      }
      return r;
    });

    DataStore.saveStore(currentStore);
    DataStore.addAuditLog(
      'household-hogar-999',
      'Marcó devolución como recibida',
      'reimbursement',
      reimbId,
      null,
      { received_at: receivedDate, note }
    );

    setStore({ ...currentStore });
  };

  return (
    <Navigation>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Devoluciones Pendientes</h1>
            <p className="text-xs text-slate-400">
              Control de dinero que deben devolverte personas externas o integrantes del hogar
            </p>
          </div>

          <Link
            href="/reimbursements/received"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl border border-slate-700 transition flex items-center gap-2"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Ver Devoluciones Recibidas</span>
          </Link>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs text-amber-300">
          <b>Regla de Negocio (Sección 8):</b> No existen devoluciones parciales en esta versión. Cada importe pendiente solo se puede mantener o marcar como recibido en su totalidad.
        </div>

        <div className="space-y-4">
          {pendingList.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-3xl">
              👍 ¡No hay devoluciones pendientes en este momento!
            </div>
          ) : (
            pendingList.map((r) => {
              const debtor = store.people.find((p) => p.id === r.debtor_person_id);
              const creditor = store.people.find((p) => p.id === r.creditor_person_id);
              const exp = store.expenses.find((e) => e.id === r.expense_id);

              return (
                <div key={r.id} className="glass-card p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">
                        {debtor?.name} {debtor?.last_name || ''}
                      </span>
                      <Badge variant="yellow">Pendiente</Badge>
                    </div>

                    <p className="text-xs text-slate-300">
                      Gasto original: <b>{exp?.description || 'Gasto'}</b> ({exp?.merchant})
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Debe devolver a: <b>{creditor?.name}</b>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <CurrencyDisplay amount={r.amount} currency={r.currency} size="xl" />

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Nota opcional (Ej. Mercado Pago)"
                        value={noteMap[r.id] || ''}
                        onChange={(e) => setNoteMap({ ...noteMap, [r.id]: e.target.value })}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                      />
                      <button
                        onClick={() => handleMarkReceived(r.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Marcar Recibida (100%)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Navigation>
  );
}
