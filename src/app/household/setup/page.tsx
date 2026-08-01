'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowRight } from 'lucide-react';
import { DataStore } from '@/lib/data-store';
import { Household, HouseholdMember } from '@/lib/types';

export default function HouseholdSetupPage() {
  const router = useRouter();
  const [householdName, setHouseholdName] = useState('Mi Hogar');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName) return;

    const store = DataStore.getStore();
    const hId = 'hh-' + Date.now();
    const newHousehold: Household = {
      id: hId,
      name: householdName,
      created_by: store.currentUserId || 'usr-default',
      created_at: new Date().toISOString(),
    };

    const newMember: HouseholdMember = {
      id: 'hm-' + Date.now(),
      household_id: hId,
      user_id: store.currentUserId || 'usr-default',
      role: 'admin',
      joined_at: new Date().toISOString(),
    };

    // Update person entry to belong to this household
    store.people = store.people.map((p) => {
      if (p.user_id === store.currentUserId) {
        return { ...p, household_id: hId };
      }
      return p;
    });

    store.households.push(newHousehold);
    store.members.push(newMember);
    DataStore.saveStore(store);

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
          <p className="text-xs text-slate-400">Creá tu espacio compartido ("Hogar") para administrar tus gastos</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Nombre del Espacio Compartido *
            </label>
            <input
              type="text"
              required
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="Ej. Hogar Gómez-Rodríguez, Mi Familia"
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
