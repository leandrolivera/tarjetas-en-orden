'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { History, Shield, Clock, User } from 'lucide-react';

export default function AuditLogsPage() {
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  return (
    <Navigation>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-sky-400" />
            Historial de Actividad y Auditoría
          </h1>
          <p className="text-xs text-slate-400">
            Registro inalterable de modificaciones de gastos, resúmenes, pagos y devoluciones
          </p>
        </div>

        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Fecha / Hora</th>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Acción Realizada</th>
                  <th className="py-3.5 px-4">Entidad Afectada</th>
                  <th className="py-3.5 px-4">Detalles / Cambios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {store.auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Sin registros de auditoría aún.
                    </td>
                  </tr>
                ) : (
                  store.auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {log.created_at.replace('T', ' ').slice(0, 19)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">
                        {log.user_profile?.full_name || 'Usuario'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-sky-400">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-400">
                        {log.entity_type} ({log.entity_id.slice(0, 8)})
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[10px]">
                        {log.new_values ? JSON.stringify(log.new_values) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
