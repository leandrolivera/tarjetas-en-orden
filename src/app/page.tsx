'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { CardVisual } from '@/components/CardVisual';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import { Expense, Card } from '@/lib/types';
import { calculateInstallments } from '@/lib/installments';
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
  ShieldCheck,
} from 'lucide-react';
import { format, addMonths, parseISO, isSameMonth, startOfMonth, getDate } from 'date-fns';
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

  // Handle 1-Tap Checkbox Payment Toggle with confirmation modal
  const handleTogglePayment = (expenseId: string, isCurrentlyPaid?: boolean) => {
    const confirmMessage = isCurrentlyPaid
      ? '¿Deseás anular el check y volver a marcar este gasto como pendiente de pago?'
      : '¿Confirmás que se realizó el pago de este gasto?';

    if (window.confirm(confirmMessage)) {
      const updatedStore = DataStore.toggleExpensePaymentStatus(expenseId);
      setStore({ ...updatedStore });
    }
  };

  const activeExpenses = (store.expenses || []).filter((e) => !e.archived_at);
  const pendingExpenses = activeExpenses.filter((e) => !e.is_paid);
  const paidExpenses = activeExpenses.filter((e) => e.is_paid);
  const activeCards = (store.cards || []).filter((c) => c.is_active);

  const baseDate = new Date();
  const currentMonthStart = startOfMonth(baseDate);

  // Helper to calculate exact installment schedules for an expense
  const getExpenseInstallmentSchedule = (exp: Expense) => {
    let pDate = new Date();
    try {
      if (exp.purchase_date) pDate = parseISO(exp.purchase_date);
    } catch (e) {}

    const card = activeCards.find((c) => c.id === exp.card_id);
    const closingDay = card?.default_closing_day || 25;
    const pDay = getDate(pDate);

    // If purchase day is after closing day, 1st installment starts next month
    let firstDueMonth = pDate;
    if (pDay > closingDay) {
      firstDueMonth = addMonths(pDate, 1);
    }
    const firstDueDateStr = format(firstDueMonth, 'yyyy-MM-dd');

    return calculateInstallments(
      exp.total_amount,
      exp.installments_count || 1,
      exp.currency,
      firstDueDateStr
    );
  };

  // 1. Calculate THIS MONTH'S installment amounts (A PAGAR ESTE MES) vs Total Remaining
  let thisMonthARS = 0;
  let thisMonthUSD = 0;

  let totalPendingRemainingARS = 0;
  let totalPendingRemainingUSD = 0;

  pendingExpenses.forEach((exp) => {
    if (exp.currency === 'ARS') totalPendingRemainingARS += exp.total_amount;
    if (exp.currency === 'USD') totalPendingRemainingUSD += exp.total_amount;

    const schedule = getExpenseInstallmentSchedule(exp);
    schedule.forEach((inst) => {
      try {
        const instDate = parseISO(inst.due_date);
        if (isSameMonth(instDate, currentMonthStart)) {
          if (exp.currency === 'ARS') thisMonthARS += inst.amount;
          if (exp.currency === 'USD') thisMonthUSD += inst.amount;
        }
      } catch (e) {}
    });
  });

  // 2. Future Months Projection (12 Months)
  const futureMonthsProjection: Array<{ monthName: string; totalARS: number; totalUSD: number; cuotasCount: number }> = [];

  for (let i = 0; i < 12; i++) {
    const targetMonthDate = addMonths(currentMonthStart, i);
    const monthLabel = format(targetMonthDate, 'MMM yyyy', { locale: es });

    let monthARS = 0;
    let monthUSD = 0;
    let cuotas = 0;

    activeExpenses.forEach((exp) => {
      const schedule = getExpenseInstallmentSchedule(exp);
      schedule.forEach((inst) => {
        try {
          const instDate = parseISO(inst.due_date);
          if (isSameMonth(instDate, targetMonthDate)) {
            if (exp.currency === 'ARS') monthARS += inst.amount;
            if (exp.currency === 'USD') monthUSD += inst.amount;
            cuotas += 1;
          }
        } catch (e) {}
      });
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
              En grande ves lo que vence <b>este mes</b> y en pequeño el saldo total acumulado
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

        {/* TOP STAT CARDS (A PAGAR ESTE MES vs SALDO TOTAL) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-3xl relative overflow-hidden border border-sky-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-sky-400">A Pagar Este Mes (ARS)</span>
              <Receipt className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mb-1">
              <CurrencyDisplay amount={thisMonthARS} currency="ARS" size="xl" />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>Saldo total restante:</span>
              <b className="text-slate-200">${totalPendingRemainingARS.toLocaleString('es-AR')}</b>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden border border-emerald-500/30">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-emerald-400">A Pagar Este Mes (USD)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mb-1">
              <CurrencyDisplay amount={thisMonthUSD} currency="USD" size="xl" />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>Saldo total restante:</span>
              <b className="text-slate-200">USD {totalPendingRemainingUSD.toLocaleString('es-AR')}</b>
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-amber-400">Gastos Pendientes</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">
              {pendingExpenses.length} <span className="text-xs font-normal text-slate-400">activos</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {pendingExpenses.reduce((s, e) => s + (e.installments_count || 1), 0)} cuotas vigentes
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-emerald-400">Pagados Este Mes</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mb-1">
              {paidExpenses.length} <span className="text-xs font-normal text-slate-400">completados</span>
            </div>
            <span className="text-[11px] text-slate-400 block">Marcados con check ✓</span>
          </div>
        </div>

        {/* SECTION 1: A PAGAR POR TARJETA DE CRÉDITO */}
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
                
                // Calculate THIS MONTH'S installment sum for this card
                let cardThisMonthARS = 0;
                let cardThisMonthUSD = 0;
                let cardTotalRemainingARS = 0;
                let cardTotalRemainingUSD = 0;

                cardExpenses.forEach((exp) => {
                  if (exp.currency === 'ARS') cardTotalRemainingARS += exp.total_amount;
                  if (exp.currency === 'USD') cardTotalRemainingUSD += exp.total_amount;

                  const schedule = getExpenseInstallmentSchedule(exp);
                  schedule.forEach((inst) => {
                    try {
                      if (isSameMonth(parseISO(inst.due_date), currentMonthStart)) {
                        if (exp.currency === 'ARS') cardThisMonthARS += inst.amount;
                        if (exp.currency === 'USD') cardThisMonthUSD += inst.amount;
                      }
                    } catch (e) {}
                  });
                });

                return (
                  <div key={card.id} className="space-y-3">
                    <CardVisual card={card} />
                    <div className="glass-card p-4 rounded-2xl text-xs space-y-2.5">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-sky-400 font-bold uppercase text-[10px] block">A Pagar Este Mes:</span>
                          <CurrencyDisplay amount={cardThisMonthARS} currency="ARS" size="md" />
                          {cardThisMonthUSD > 0 && (
                            <div className="mt-0.5">
                              <CurrencyDisplay amount={cardThisMonthUSD} currency="USD" size="md" />
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[10px] block">Saldo Total Tarjeta:</span>
                          <span className="font-semibold text-slate-300 text-xs">
                            ${cardTotalRemainingARS.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Día de Cierre:</span>
                        <span className="font-bold text-white">Día {card.default_closing_day}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
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

        {/* SECTION 2: GASTOS PENDIENTES Y PAGOS (CHECK 1-TAP) */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Gastos Pendientes y Pagos (Check 1-Tap)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tocá la casilla de verificación para marcar un gasto como pagado con confirmación
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

                // Compute this month's installment for this expense
                const schedule = getExpenseInstallmentSchedule(exp);
                const currentMonthInst = schedule.find((inst) => {
                  try {
                    return isSameMonth(parseISO(inst.due_date), currentMonthStart);
                  } catch (e) {
                    return false;
                  }
                });

                const count = exp.installments_count || 1;
                const thisMonthInstallmentAmount = currentMonthInst ? currentMonthInst.amount : exp.total_amount / count;
                const instNumber = currentMonthInst ? currentMonthInst.installment_number : 1;

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
                      onClick={() => handleTogglePayment(exp.id, exp.is_paid)}
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
                          <span>•</span>
                          <span>Pagó: <b>{purchaser?.name || 'Titular'}</b></span>
                          {count > 1 && (
                            <>
                              <span>•</span>
                              <span className="text-sky-400 font-semibold">Cuota {instNumber} de {count}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Right: Amount (This Month BIG, Total SMALL) & Status Button */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Cuota de este mes:</span>
                        <CurrencyDisplay amount={thisMonthInstallmentAmount} currency={exp.currency} size="md" />
                        {count > 1 && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Total compra: ${exp.total_amount.toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePayment(exp.id, exp.is_paid)}
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
            <span className="text-xs text-slate-400">Proyección exacta mes por mes</span>
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
                <span className="text-[9px] text-slate-400 block">{proj.cuotasCount} ítem(s)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Navigation>
  );
}
