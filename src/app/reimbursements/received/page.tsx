'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ReceivedReimbursementsPage() {
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const receivedList = store.reimbursements.filter((r) => r.status === 'received');

  const handleRevert = (reimbId: string) => {
    if (confirm('¿Confirmás que querés revertir esta devolución a estado pendiente?')) {
      const currentStore = DataStore.getStore();
      currentStore.reimbursements = currentStore.reimbursements.map((r) => {
        if (r.id === reimbId) {
          return {
            ...r,
            status: 'pending' as const,
            received_at: null,
            received_by_user_id: null,
          };
        }
        return r;
      });

      DataStore.saveStore(currentStore);
      DataStore.addAuditLog('household-hogar-999', 'Revirtió devolución a pendiente', 'reimbursement', reimbId);
      setStore({ ...currentStore });
    }
  };

  return (
    <Navigation>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/reimbursements/pending"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Devoluciones Pendientes</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Historial de Devoluciones Recibidas</h1>
        </div>

        <div className="space-y-4">
          {receivedList.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-3xl">
              No hay devoluciones marcadas como recibidas.
            </div>
          ) : (
            receivedList.map((r) => {
              const debtor = store.people.find((p) => p.id === r.debtor_person_id);
              const exp = store.expenses.find((e) => e.id === r.expense_id);

              return (
                <div key={r.id} className="glass-card p-5 rounded-3xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">
                        {debtor?.name} {debtor?.last_name || ''}
                      </span>
                      <Badge variant="green">Recibida ✓</Badge>
                    </div>
                    <p className="text-xs text-slate-300">
                      Gasto: <b>{exp?.description || 'Gasto'}</b> • Recibida el: {r.received_at}
                    </p>
                    {r.note && <p className="text-[11px] text-slate-400 italic">Nota: {r.note}</p>}
                  </div>

                  <div className="flex items-center gap-4">
                    <CurrencyDisplay amount={r.amount} currency={r.currency} size="lg" />
                    <button
                      onClick={() => handleRevert(r.id)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-xs font-semibold flex items-center gap-1"
                      title="Revertir a pendiente"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Revertir</span>
                    </button>
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
