'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Receipt,
  CreditCard,
  PlusCircle,
  Menu,
  Bell,
  Users,
  PieChart,
  Repeat,
  DollarSign,
  Settings,
  LogOut,
  X,
  FileSpreadsheet,
  History,
  Tag,
  UserCheck,
} from 'lucide-react';
import { DataStore } from '@/lib/data-store';
import { Notification } from '@/lib/types';

export function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [store, setStore] = useState(DataStore.getStore());
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showMobileMenuModal, setShowMobileMenuModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const s = DataStore.getStore();
    setStore(s);
    if (s.notifications) {
      const unread = s.notifications.filter((n) => !n.is_read && !n.is_dismissed);
      setUnreadNotifications(unread);
    }
  }, [pathname]);

  const activeHousehold = store.households && store.households.length > 0 ? store.households[0] : null;
  const currentUser = store.profiles && store.profiles.length > 0
    ? store.profiles.find((p) => p.id === store.currentUserId) || store.profiles[0]
    : null;

  const handleMarkAllNotificationsRead = () => {
    const updated = {
      ...store,
      notifications: (store.notifications || []).map((n) => ({ ...n, is_read: true })),
    };
    DataStore.saveStore(updated);
    setStore(updated);
    setUnreadNotifications([]);
  };

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Gastos', href: '/expenses', icon: Receipt },
    { label: 'Tarjetas', href: '/cards', icon: CreditCard },
    { label: 'Resúmenes', href: '/statements', icon: PieChart },
    { label: 'Devoluciones', href: '/reimbursements/pending', icon: DollarSign },
    { label: 'Recurrentes', href: '/recurring', icon: Repeat },
  ];

  const secondaryNavItems = [
    { label: 'Personas', href: '/people', icon: UserCheck },
    { label: 'Categorías', href: '/categories', icon: Tag },
    { label: 'Auditoría', href: '/audit-logs', icon: History },
    { label: 'Integrantes', href: '/members', icon: Users },
    { label: 'Exportar CSV', href: '/export', icon: FileSpreadsheet },
    { label: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-sky-500/20">
            💳
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white">Tarjetas en Orden</h1>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeHousehold ? activeHousehold.name : 'Sin Hogar'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href="/expenses/new"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition transform hover:-translate-y-0.5 mb-6 text-sm"
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Nuevo gasto</span>
        </Link>

        {/* Main Nav */}
        <div className="space-y-1 mb-6">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menú Principal
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Secondary Nav */}
        <div className="space-y-1 flex-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Gestión y Ajustes
          </span>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card at bottom of sidebar */}
        {currentUser ? (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser.full_name || 'Usuario'}
                className="w-8 h-8 rounded-full border border-sky-500/40 object-cover"
              />
              <div className="text-left leading-tight">
                <span className="text-xs font-semibold text-slate-200 block truncate max-w-[110px]">
                  {currentUser.full_name || 'Usuario'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                  {currentUser.email || ''}
                </span>
              </div>
            </div>

            <Link
              href="/profile"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Mi Perfil"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-800">
            <Link
              href="/register"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center"
            >
              Crear Cuenta
            </Link>
          </div>
        )}
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-20 glass-nav px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center font-bold text-sm text-white">
              💳
            </div>
            <span className="font-extrabold text-sm text-white">Tarjetas en Orden</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Espacio activo:</span>
            <span className="bg-slate-800 text-sky-400 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700">
              {activeHousehold ? activeHousehold.name : 'Sin Hogar Activo'}
            </span>
          </div>

          {/* Right Topbar Controls */}
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotificationsMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-400" />
                      Notificaciones
                    </h4>
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] text-sky-400 hover:underline"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {(!store.notifications || store.notifications.length === 0) ? (
                      <p className="text-xs text-slate-500 text-center py-4">Sin notificaciones</p>
                    ) : (
                      store.notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs ${
                            n.type === 'warning'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                              : 'bg-slate-800/60 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="font-semibold text-slate-100 mb-0.5">{n.title}</div>
                          <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setShowNotificationsMenu(false)}
                      className="text-xs text-sky-400 font-medium hover:underline"
                    >
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.full_name || 'Usuario'}
                    className="w-8 h-8 rounded-full border border-sky-500/40 object-cover"
                  />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.full_name || 'Usuario'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email || ''}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar sesión</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className="bg-sky-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs hover:bg-sky-500 transition"
              >
                Crear Cuenta
              </Link>
            )}
          </div>
        </header>

        {/* MAIN PAGE BODY */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav z-40 px-3 py-2 border-t border-slate-800 flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Inicio</span>
        </Link>

        <Link
          href="/expenses"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/expenses') && pathname !== '/expenses/new' ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Gastos</span>
        </Link>

        {/* FLOATING ACTION BUTTON "+ NUEVO GASTO" */}
        <Link
          href="/expenses/new"
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-sky-600/40 border-2 border-slate-900 transition transform active:scale-95"
        >
          <PlusCircle className="w-7 h-7" />
        </Link>

        <Link
          href="/cards"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/cards') ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-[10px]">Tarjetas</span>
        </Link>

        <button
          onClick={() => setShowMobileMenuModal(true)}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Más</span>
        </button>
      </nav>

      {/* MOBILE MENU MODAL */}
      {showMobileMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Menú Completo</h3>
              <button
                onClick={() => setShowMobileMenuModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[...navItems, ...secondaryNavItems].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenuModal(false)}
                    className="flex items-center gap-3 p-3 bg-slate-800/70 rounded-2xl border border-slate-700/50 text-slate-200 font-medium text-xs hover:bg-slate-700 transition"
                  >
                    <Icon className="w-4 h-4 text-sky-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
