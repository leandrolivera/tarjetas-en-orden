'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { CardVisual } from '@/components/CardVisual';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { Badge } from '@/components/Badge';
import { DataStore } from '@/lib/data-store';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  Receipt,
  Clock,
  PieChart,
  UserCheck,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Home,
} from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const router = useRouter();
  const [store, setStore] = useState(DataStore.getStore());

  useEffect(() => {
    const s = DataStore.getStore();
    setStore(s);
  }, []);

  const activeHousehold = store.households[0];
  const currentPerson = store.people.find((p) => p.user_id === store.currentUserId) || store.people[0];

  // If no user or household exists yet, prompt onboarding
  if (!activeHousehold || !currentPerson) {
    return (
      <Navigation>
        <div className="max-w-md mx-auto text-center glass-card p-8 rounded-3xl space-y-4 my-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center font-bold text-3xl text-white mx-auto">
            💳
          </div>
          <h2 className="text-2xl font-black text-white">¡Bienvenido a Tarjetas en Orden!</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu panel está listo. Comenzá registrando tu cuenta y tu espacio compartido para cargar tus propias tarjetas y gastos.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-emerald-500 hover:from-sky-500 hover:to-emerald-400 text-white font-bold py-3 px-6 rounded-2xl text-xs shadow-lg transition"
          >
            <span>Crear Mi Cuenta y Hogar</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Navigation>
    );
  }

  // Compute metrics
  const activeExpenses = store.expenses.filter((e) => !e.archived_at);
  const activeCards = store.cards.filter((c) => c.is_active);

  // Totals
  const currentMonthARS = activeExpenses
    .filter((e) => e.currency === 'ARS')
    .reduce((sum, e) => sum + e.total_amount, 0);

  const currentMonthUSD = activeExpenses
    .filter((e) => e.currency === 'USD')
    .reduce((sum, e) => sum + e.total_amount, 0);

  const activeCuotasCount = activeExpenses.reduce((sum, e) => sum + e.installments_count, 0);

  // Reimbursements
  const pendingReimbursements = store.reimbursements.filter((r) => r.status === 'pending');
  const iOweReimbursements = pendingReimbursements.filter((r) => r.debtor_person_id === currentPerson.id);
  const owedToMeReimbursements = pendingReimbursements.filter((r) => r.creditor_person_id === currentPerson.id);

  // Group Owed To Me by Person
  const owedByPersonMap = new Map<string, { person: any; count: number; totalARS: number; totalUSD: number }>();
  owedToMeReimbursements.forEach((r) => {
    const debtor = store.people.find((p) => p.id === r.debtor_person_id);
    if (!debtor) return;
    const existing = owedByPersonMap.get(debtor.id) || { person: debtor, count: 0, totalARS: 0, totalUSD: 0 };
    existing.count += 1;
    if (r.currency === 'ARS') existing.totalARS += r.amount;
    if (r.currency === 'USD') existing.totalUSD += r.amount;
    owedByPersonMap.set(debtor.id, existing);
  });

  // Future Months Projection
  const futureMonthsProjection: Array<{ monthName: string; totalARS: number; totalUSD: number; cuotasCount: number }> = [];
  const baseDate = new Date();

  for (let i = 0; i < 12; i++) {
    const targetDate = addMonths(baseDate, i);
    const monthLabel = format(targetDate, 'MMM yyyy', { locale: es });
    
    let monthARS = 0;
    let monthUSD = 0;
    let cuotas = 0;

    activeExpenses.forEach((exp) => {
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

  // Category Breakdown
  const categoryTotalsMap = new Map<string, { category: any; arsAmount: number; usdAmount: number }>();
  activeExpenses.forEach((e) => {
    const cat = store.categories.find((c) => c.id === e.category_id) || {
      id: 'cat-otros',
      name: 'Otros',
      color: '#64748b',
      icon: 'more-horizontal',
      is_active: true,
      is_default: true,
      created_at: '',
    };
    const existing = categoryTotalsMap.get(cat.id) || { category: cat, arsAmount: 0, usdAmount: 0 };
    if (e.currency === 'ARS') existing.arsAmount += e.total_amount;
    if (e.currency === 'USD') existing.usdAmount += e.total_amount;
    categoryTotalsMap.set(cat.id, existing);
  });

  return (
    <Navigation>
      <div className="space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">Dashboard Familiar</span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                {activeHousehold.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hola, {currentPerson.name} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Aquí tenés el control en tiempo real de tus tarjetas y devoluciones
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

        {/* TOP STAT CARDS (RESUMEN DEL MES) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold">Gastos Totales (ARS)</span>
              <Receipt className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mb-2">
              <CurrencyDisplay amount={currentMonthARS} currency="ARS" size="xl" />
            </div>
            <div className="text-[11px] text-slate-400">Total en pesos argentinos</div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold">Gastos Totales (USD)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mb-2">
              <CurrencyDisplay amount={currentMonthUSD} currency="USD" size="xl" />
            </div>
            <div className="text-[11px] text-slate-400">Total en dólares estadounidenses</div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold">Movimientos</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white mb-1">
              {activeExpenses.length} <span className="text-xs font-normal text-slate-400">registrados</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {activeCuotasCount} cuotas activas en total
            </div>
          </div>

          <div className="glass-card p-5 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold">Devoluciones Pendientes</span>
              <UserCheck className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400 mb-1">
              {pendingReimbursements.length} <span className="text-xs font-normal text-slate-400">pendientes</span>
            </div>
            <Link href="/reimbursements/pending" className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1">
              <span>Gestionar cobros</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* SECTION: TARJETAS Y RESÚMENES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sky-400" />
              Tus Tarjetas de Crédito y Cierres
            </h2>
            <Link href="/cards/new" className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Agregar Tarjeta</span>
            </Link>
          </div>

          {activeCards.length === 0 ? (
            <div className="glass-card p-8 rounded-3xl text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-sm">Todavía no agregaste ninguna tarjeta</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Crea tu primera tarjeta indicando el banco, titular, días de cierre y vencimiento.
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
                const stmt = store.statements.find((s) => s.card_id === card.id);
                return (
                  <div key={card.id} className="space-y-3">
                    <CardVisual card={card} />
                    <div className="glass-card p-4 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Estado Resumen:</span>
                        {stmt?.status === 'paid' ? (
                          <Badge variant="green">Pagado ✓</Badge>
                        ) : (
                          <Badge variant="yellow">Pendiente</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                        <span className="text-slate-400">Próximo Cierre:</span>
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

        {/* SECTION: DINERO QUE ME DEBEN & YO DEBO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Dinero que me deben
              </h2>
            </div>
            {owedByPersonMap.size === 0 ? (
              <div className="bg-slate-900/60 rounded-2xl p-6 text-center text-xs text-slate-400">
                👍 Nadie te debe dinero actualmente.
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(owedByPersonMap.values()).map(({ person, count, totalARS, totalUSD }) => (
                  <div key={person.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{person.name} {person.last_name || ''}</h4>
                      <p className="text-[11px] text-slate-400">{count} {count === 1 ? 'gasto pendiente' : 'gastos pendientes'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      {totalARS > 0 && <CurrencyDisplay amount={totalARS} currency="ARS" size="md" />}
                      {totalUSD > 0 && <CurrencyDisplay amount={totalUSD} currency="USD" size="md" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                Dinero que yo debo
              </h2>
            </div>
            {iOweReimbursements.length === 0 ? (
              <div className="bg-slate-900/60 rounded-2xl p-6 text-center text-xs text-slate-400">
                🎉 No tenés deudas pendientes de devolución.
              </div>
            ) : (
              <div className="space-y-3">
                {iOweReimbursements.map((r) => {
                  const creditor = store.people.find((p) => p.id === r.creditor_person_id);
                  const exp = store.expenses.find((e) => e.id === r.expense_id);
                  return (
                    <div key={r.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-white">A: {creditor?.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{exp?.description || 'Gasto'}</p>
                      </div>
                      <CurrencyDisplay amount={r.amount} currency={r.currency} size="md" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SECTION: PROYECCIÓN DE CUOTAS FUTURAS */}
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
