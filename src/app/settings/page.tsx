'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { Settings, Globe, DollarSign, Clock, ShieldCheck } from 'lucide-react';

export default function GeneralSettingsPage() {
  return (
    <Navigation>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Configuración General</h1>
          <p className="text-xs text-slate-400">Ajustes regionales, zona horaria y preferencias del sistema</p>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Configuración Regional y Monedas
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Idioma</span>
                <span className="font-bold text-white">Español (Argentina)</span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Zona Horaria</span>
                <span className="font-bold text-sky-400">America/Argentina/Cordoba</span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Moneda Principal</span>
                <span className="font-bold text-emerald-400">Pesos Argentinos (ARS)</span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Moneda Secundaria</span>
                <span className="font-bold text-emerald-400">Dólares EE.UU. (USD)</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <h4 className="font-bold text-xs text-slate-300">Reglas Activas del Sistema</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>ARS y USD se presentan de forma estrictamente separada sin conversiones automáticas.</li>
              <li>El pago del resumen de tarjeta y la devolución de dinero entre personas son independientes.</li>
              <li>Las compras en cuotas distribuyen centavos sobrantes sin modificar el importe total original.</li>
            </ul>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de reiniciar todos los datos a un estado limpio (vacío desde cero)?')) {
                  DataStore.resetToClean();
                  window.location.href = '/register';
                }
              }}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2.5 px-4 rounded-xl border border-rose-500/30 text-xs transition"
            >
              🗑️ Reiniciar todo a estado limpio (Vacío desde 0)
            </button>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
