'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { User, Mail, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [store, setStore] = useState(DataStore.getStore());
  const currentUser = store.profiles.find((p) => p.id === store.currentUserId) || store.profiles[0];

  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStore = DataStore.getStore();
    currentStore.profiles = currentStore.profiles.map((p) => {
      if (p.id === currentStore.currentUserId) {
        return { ...p, full_name: fullName, email };
      }
      return p;
    });

    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Actualizó perfil de usuario', 'profile', currentUser.id);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <Navigation>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Perfil de Usuario</h1>
          <p className="text-xs text-slate-400">Datos personales y sesión en el hogar</p>
        </div>

        <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.full_name || 'User'}
              className="w-16 h-16 rounded-full border-2 border-sky-500 object-cover shadow-lg"
            />
            <div>
              <h3 className="font-bold text-base text-white">{currentUser.full_name}</h3>
              <span className="text-xs text-sky-400 font-semibold block">{currentUser.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Perfil actualizado correctamente.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm mt-4"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Perfil</span>
          </button>
        </form>
      </div>
    </Navigation>
  );
}
