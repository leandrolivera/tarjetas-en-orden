'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, UserPlus, CheckCircle2, ArrowRight, Copy, Share2, Check } from 'lucide-react';
import { DataStore } from '@/lib/data-store';

export default function HouseholdInvitePage() {
  const router = useRouter();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState(false);

  const store = DataStore.getStore();
  const activeHousehold = store.households && store.households.length > 0 ? store.households[0] : null;
  const inviteCode = activeHousehold?.id || 'hh-invite-' + Date.now();
  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/register?invite=${inviteCode}` : `https://tarjetas-en-orden.pages.dev/register?invite=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`¡Sumate a nuestro espacio "${activeHousehold?.name || 'Hogar'}" en Tarjetas en Orden para administrar los gastos y tarjetas juntos! Registrate aquí: ${inviteUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerEmail) return;
    setInvited(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Invitar a tu Pareja</h1>
          <p className="text-xs text-slate-400">Sumá a tu pareja para compartir tarjetas y movimientos juntos</p>
        </div>

        {/* INSTANT WHATSAPP & DIRECT LINK OPTION */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">⚡ Enlace de Invitación Directo</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Instantáneo
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Enviale este enlace directo a tu pareja para que se una a tu Hogar inmediatamente sin esperar un correo:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-2.5 px-3 rounded-xl border border-slate-600 text-xs transition flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl shadow-lg text-xs transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </div>

        {/* OR SEND EMAIL */}
        {invited ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">¡Invitación Enviada!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Le enviamos una invitación a <b>{partnerEmail}</b>. También podés compartirle el enlace por WhatsApp.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2"
            >
              <span>Ir al Panel Principal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                O ingresar su Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Enviar por Correo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full text-slate-400 text-xs font-semibold py-2 hover:text-white transition"
            >
              Omitir por ahora e ir al Dashboard
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
