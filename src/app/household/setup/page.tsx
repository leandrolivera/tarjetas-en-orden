'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Users, Plus, ArrowRight } from 'lucide-react';

export default function HouseholdSetupPage() {
  const router = useRouter();
  const [householdName, setHouseholdName] = useState('Hogar César y Antonela');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/household/invite');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white mx-auto mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Configurar tu Espacio</h1>
          <p className="text-xs text-slate-400">Creá un espacio compartido ("Hogar") para administrar los gastos</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Nombre del Espacio Compartido
            </label>
            <input
              type="text"
              required
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="Ej. Hogar Gómez-Rodríguez"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 text-sm"
          >
            <span>Crear Hogar y Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
