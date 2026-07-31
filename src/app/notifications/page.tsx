'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { Bell, Check, Trash2, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const handleMarkAllRead = () => {
    const currentStore = DataStore.getStore();
    currentStore.notifications = currentStore.notifications.map((n) => ({ ...n, is_read: true }));
    DataStore.saveStore(currentStore);
    setStore({ ...currentStore });
  };

  const handleDismiss = (id: string) => {
    const currentStore = DataStore.getStore();
    currentStore.notifications = currentStore.notifications.filter((n) => n.id !== id);
    DataStore.saveStore(currentStore);
    setStore({ ...currentStore });
  };

  return (
    <Navigation>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Centro de Notificaciones</h1>
            <p className="text-xs text-slate-400">Alertas internas de vencimientos, cuotas y devoluciones</p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs text-sky-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>Marcar todas leídas</span>
          </button>
        </div>

        <div className="space-y-3">
          {store.notifications.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 text-xs rounded-3xl">
              Sin notificaciones pendientes.
            </div>
          ) : (
            store.notifications.map((n) => (
              <div
                key={n.id}
                className={`glass-card p-5 rounded-3xl flex items-center justify-between border ${
                  n.type === 'warning' ? 'border-amber-500/30' : 'border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{n.title}</span>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />}
                  </div>
                  <p className="text-xs text-slate-300">{n.message}</p>
                  <span className="text-[10px] text-slate-500">{n.created_at}</span>
                </div>

                <button
                  onClick={() => handleDismiss(n.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Navigation>
  );
}
