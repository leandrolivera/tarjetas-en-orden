'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">Recuperar Contraseña</h1>
          <p className="text-xs text-slate-400">Ingresá tu correo para recibir las instrucciones de restablecimiento</p>
        </div>

        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">¡Enlace enviado!</h3>
            <p className="text-xs text-slate-300">
              Revisá la bandeja de entrada de <b>{email}</b>. Te enviamos los pasos para restablecer tu clave.
            </p>
            <Link
              href="/login"
              className="inline-block mt-2 bg-slate-800 text-sky-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-700 transition"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-sky-600/30 transition text-sm"
            >
              Enviar Enlace
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link href="/login" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
