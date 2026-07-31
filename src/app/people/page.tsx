'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { Person } from '@/lib/types';
import { UserCheck, PlusCircle, User, Phone, FileText } from 'lucide-react';

export default function PeoplePage() {
  const [store, setStore] = useState(DataStore.getStore());
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const currentStore = DataStore.getStore();
    const newPerson: Person = {
      id: 'person-' + Date.now(),
      household_id: 'household-hogar-999',
      user_id: null,
      name,
      last_name: lastName || null,
      alias: alias || name,
      phone: phone || null,
      notes: notes || null,
      is_active: true,
      created_by: currentStore.currentUserId,
      created_at: new Date().toISOString(),
    };

    currentStore.people.push(newPerson);
    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Creó persona externa', 'person', newPerson.id, null, newPerson);

    setStore({ ...currentStore });
    setShowForm(false);
    setName('');
    setLastName('');
    setAlias('');
  };

  return (
    <Navigation>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Personas Externas e Integrantes</h1>
            <p className="text-xs text-slate-400">
              Administrá personas que participan en gastos pero no requieren cuenta de usuario
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Agregar Persona</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="glass-card p-6 rounded-3xl space-y-4 max-w-xl">
            <h3 className="font-bold text-sm text-white">Agregar Persona Externa</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Alias / Descripción</label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Ej. Amigo del trabajo"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+549..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs"
            >
              Guardar Persona
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {store.people.map((p) => (
            <div key={p.id} className="glass-card p-5 rounded-3xl space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-sm">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {p.name} {p.last_name || ''}
                  </h3>
                  <span className="text-xs text-slate-400 block">{p.alias || 'Integrante'}</span>
                </div>
              </div>
              {p.phone && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800">
                  <Phone className="w-3 h-3 text-sky-400" />
                  <span>{p.phone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Navigation>
  );
}
