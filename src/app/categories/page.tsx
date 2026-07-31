'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { Category } from '@/lib/types';
import { Tag, PlusCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [store, setStore] = useState(DataStore.getStore());
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0284c7');

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const currentStore = DataStore.getStore();
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      household_id: 'household-hogar-999',
      name,
      color,
      icon: 'tag',
      is_active: true,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    currentStore.categories.push(newCat);
    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Creó categoría', 'category', newCat.id, null, newCat);

    setStore({ ...currentStore });
    setName('');
  };

  return (
    <Navigation>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Categorías de Gastos</h1>
            <p className="text-xs text-slate-400">
              Personalizá las categorías. Las categorías con gastos asociados se desactivan (sin borrado físico).
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="glass-card p-4 rounded-3xl flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            placeholder="Nueva categoría (Ej. Mascotas, Deportes)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-9 bg-slate-900 border border-slate-700 rounded-xl cursor-pointer p-1"
          />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar Categoría</span>
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {store.categories.map((cat) => (
            <div key={cat.id} className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color || '#64748b' }} />
              <span className="font-bold text-xs text-white">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Navigation>
  );
}
