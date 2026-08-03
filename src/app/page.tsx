'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CardVisual } from '@/components/CardVisual';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Expense, Card } from '@/lib/types';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Receipt,
  Clock,
  ChevronRight,
  Sparkles,
  PlusCircle,
  CheckCircle2,
  Circle,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    setStore(DataStore.getStore());
  }, []);

  const activeHousehold = store.households && store.households.length > 0 ? store.households[0] : null;
  const currentPerson = store.people && store.people.length > 0
    ? store.people.find((p) => p.user_id === store.currentUserId) || store.people[0]
    : null;

  // Onboarding view if no user / household registered yet
  if (!activeHousehold || !currentPerson) {
    return (
      <Navigation>
        <div className="max-w-md mx-auto text-center glass-card p-8 rounded-3xl space-y-4 my-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center font-bold text-3xl text-white mx-auto shadow-xl">
            💳
          </div>
          <h2 className="text-2xl font-black text-white">¡Bienvenido a Tarjetas en Orden!</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu sistema de control de gastos está listo. Registrá tu usuario y tu espacio compartido para cargar tus propias tarjetas y movimientos.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-emerald-500 hover:from-sky-500 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-lg transition transform hover:-translate-y-0.5"
          >
            <span>Crear Mi Cuenta y Hogar</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Navigation>
    );
  }

  // Handle 1-Tap Checkbox Payment Toggle directly from Dashboard
  const handleTogglePayment = (expenseId: string) => {
    const updatedStore = DataStore.toggleExpensePaymentStatus(expenseId);
    setStore({ ...updatedStore });
  };

  const activeExpenses = (store.expenses || []).filter((e) => !e.archived_at);
  const pendingExpenses = activeExpenses.filter((e) => !e.is_paid);
  const paidExpenses = activeExpenses.filter((e) => e.is_paid);
  const activeCards = (store.cards || []).filter((c) => c.is_active);

  // Totals to Pay (Pending)
  const pendingAmountARS = pendingExpenses
    .filter((e) => e.currency === 'ARS')
    .reduce((sum, e) => sum + e.total_amount, 0);

  const pendingAmountUSD = pendingExpenses
    .filter((e) => e.currency === 'USD')
    .reduce((sum, e) => sum + e.total_amount, 0);

  // Future Months Projection
  const futureMonthsProjection: Array<{ monthName: string; totalARS: number; totalUSD: number; cuotasCount: number }> = [];
  const baseDate = new Date();

  for (let i = 0; i < 12; i++) {
    const targetDate = addMonths(baseDate, i);
    const monthLabel = format(targetDate, 'MMM yyyy', { locale: es });
    
    let monthARS = 0;
    let monthUSD = 0;
    let cuotas = 0;

    pendingExpenses.forEach((exp) => {
      if (exp.installments_count > 1) {
        const perCuota = exp.total_amount / exp.installments_count;
        if (exp.currency === 'ARS') monthARS += perCuota;
        if (exp.currency === 'USD') monthUSD += perCuota;
        cuotas += 1;
      }
    });

    futureMonthsProjection.push({
      monthName: monthLabel,
      totalARS: Math.round(monthARS),
      totalUSD: Math.round(monthUSD),
      cuotasCount: cuotas,
    });
  }

  return (
    <Navigation>
      <div className="space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">Control de Pagos</span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                {activeHousehold.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hola, {currentPerson.name} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Marcá tus gastos como pagados con 1 toque o consultá tus próximos vencimientos
            </p>
          </div>

          <Link
            href="/expenses/new"
            className="self-start sm:self-center bg-gradient-to-r from-sky-600 to-emerald-500 hover:from-sky-500 hover:to-emerald-400 text-white font-bold py-3 px-5 rounded-2xl shadow-lg shadow-sky-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Registrar Gasto</span>
          </Link>
        </div>

        {/* TOP STAT CARDS (A PAGAR) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-3xl relative overflow-hidden border border-sky-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-sky-400">A Pagar (ARS)</span>
              <Receipt className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mb-2">
              <CurrencyDisplay amount={pendingAmountARS} currency="ARS" size="xl" />
            </div>
            <div className="text-[11px] text-slate-400">Total de gastos pendientes en pesos</div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden border border-emerald-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-emerald-400">A Pagar (USD)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mb-2">
              <CurrencyDisplay amount={pendingAmountUSD} currency="USD" size="xl" />
            </div>
            <div className="text-[11px] text-slate-400">Total de gastos pendientes en dólares</div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-amber-400">Pendientes</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">
              {pendingExpenses.length} <span className="text-xs font-normal text-slate-400">por pagar</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {pendingExpenses.reduce((s, e) => s + e.installments_count, 0)} cuotas activas
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-emerald-400">Pagados este mes</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mb-1">
              {paidExpenses.length} <span className="text-xs font-normal text-slate-400">completados</span>
            </div>
            <span className="text-[11px] text-slate-400 block">Marcados con 1-tap ✓</span>
          </div>
        </div>

        {/* SECTION 1: A PAGAR POR TARJETA */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sky-400" />
              A Pagar por Tarjeta de Crédito
            </h2>
            <Link href="/cards/new" className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Agregar Tarjeta</span>
            </Link>
          </div>

          {activeCards.length === 0 ? (
            <div className="glass-card p-8 rounded-3xl text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-sm">No tenés tarjetas registradas aún</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Creá tu primera tarjeta para asociar tus compras y cuotas.
              </p>
              <Link
                href="/cards/new"
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Crear Primera Tarjeta</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeCards.map((card) => {
                const cardExpenses = pendingExpenses.filter((e) => e.card_id === card.id);
                const cardPendingARS = cardExpenses
                  .filter((e) => e.currency === 'ARS')
                  .reduce((sum, e) => sum + e.total_amount, 0);

                const cardPendingUSD = cardExpenses
                  .filter((e) => e.currency === 'USD')
                  .reduce((sum, e) => sum + e.total_amount, 0);

                return (
                  <div key={card.id} className="space-y-3">
                    <CardVisual card={card} />
                    <div className="glass-card p-4 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Total a Pagar:</span>
                        <div className="text-right">
                          <CurrencyDisplay amount={cardPendingARS} currency="ARS" size="md" />
                          {cardPendingUSD > 0 && (
                            <div className="mt-0.5">
                              <CurrencyDisplay amount={cardPendingUSD} currency="USD" size="md" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Día de Cierre:</span>
                        <span className="font-bold text-white">Día {card.default_closing_day}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Próximo Vencimiento:</span>
                        <span className="font-bold text-amber-400">Día {card.default_due_day}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: GASTOS A PAGAR (CHECK RÁPIDO 1-TAP) */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Gastos Pendientes y Pagos (Check 1-Tap)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tocá la casilla de verificación en cualquier gasto para marcarlo como pagado al instante
              </p>
            </div>
            <Link href="/expenses/new" className="text-xs text-sky-400 hover:underline font-semibold">
              + Nuevo gasto
            </Link>
          </div>

          {activeExpenses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              👍 No hay gastos cargados aún. ¡Usá el botón <b>"+ Registrar Gasto"</b> para cargar tu primera compra!
            </div>
          ) : (
            <div className="space-y-3">
              {activeExpenses.map((exp) => {
                const card = activeCards.find((c) => c.id === exp.card_id);
                const purchaser = (store.people || []).find((p) => p.id === exp.purchaser_id);

                return (
                  <div
                    key={exp.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                      exp.is_paid
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                        : 'bg-slate-900/90 border-slate-700/60 hover:border-sky-500/40'
                    }`}
                  >
                    {/* Left: Interactive 1-Tap Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleTogglePayment(exp.id)}
                      className="flex items-center gap-3 focus:outline-none text-left group"
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                          exp.is_paid
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/30'
                            : 'bg-slate-800 border-2 border-slate-600 text-transparent group-hover:border-sky-400'
                        }`}
                      >
                        ✓
                      </div>

                      <div>
                        <div className={`font-bold text-sm ${exp.is_paid ? 'line-through text-slate-400' : 'text-white'}`}>
                          {exp.description}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{exp.merchant}</span>
                          <span>•</span>
                          <span>{card?.name || 'Tarjeta'}</span>
                          {exp.installments_count > 1 && (
                            <>
                              <span>•</span>
                              <span className="text-sky-400 font-semibold">{exp.installments_count} cuotas</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Right: Amount & Status Badge */}
                    <div className="flex items-center gap-3">
                      <CurrencyDisplay amount={exp.total_amount} currency={exp.currency} size="md" />

                      <button
                        type="button"
                        onClick={() => handleTogglePayment(exp.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          exp.is_paid
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                        }`}
                      >
                        {exp.is_paid ? '✓ Pagado' : 'A Pagar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: PROYECCIÓN DE CUOTAS FUTURAS (12 MESES) */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              Compromisos de Cuotas Futuras (Próximos 12 meses)
            </h2>
            <span className="text-xs text-slate-400">Proyección mensual</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {futureMonthsProjection.slice(0, 12).map((proj, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-center space-y-1 hover:border-sky-500/40 transition"
              >
                <span className="text-[11px] font-bold text-sky-400 capitalize block">{proj.monthName}</span>
                <span className="text-xs font-black text-white block">
                  $ {proj.totalARS.toLocaleString('es-AR')}
                </span>
                {proj.totalUSD > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400 block">
                    USD {proj.totalUSD}
                  </span>
                )}
                <span className="text-[9px] text-slate-400 block">{proj.cuotasCount} cuotas</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Navigation>
  );
}
