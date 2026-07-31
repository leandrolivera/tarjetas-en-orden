'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Users, UserPlus, Shield, CheckCircle2 } from 'lucide-react';

export default function HouseholdMembersPage() {
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  return (
    <Navigation>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Integrantes del Hogar</h1>
            <p className="text-xs text-slate-400">
              Administración de miembros, pareje e invitaciones del espacio compartido
            </p>
          </div>

          <Link
            href="/household/invite"
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition flex items-center gap-2 text-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invitar Integrante</span>
          </Link>
        </div>

        <div className="space-y-4">
          {store.members.map((m) => (
            <div key={m.id} className="glass-card p-5 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={m.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={m.profile?.full_name || 'Member'}
                  className="w-10 h-10 rounded-full border border-sky-500/40 object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">{m.profile?.full_name}</h3>
                  <span className="text-xs text-slate-400">{m.profile?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={m.role === 'admin' ? 'blue' : 'gray'}>
                  {m.role === 'admin' ? 'Administrador' : 'Miembro'}
                </Badge>
                <span className="text-[10px] text-slate-500">Unido el {m.joined_at.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Navigation>
  );
}
