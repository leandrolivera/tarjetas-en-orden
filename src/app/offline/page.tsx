import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-sky-500/20 text-sky-400 rounded-2xl flex items-center justify-center mb-4 text-3xl">
        📡
      </div>
      <h1 className="text-2xl font-bold mb-2">Sin conexión a internet</h1>
      <p className="text-slate-400 max-w-md mb-6 text-sm">
        Estás viendo la versión sin conexión de Tarjetas en Orden. Cuando recuperes la conectividad, tus datos se actualizarán automáticamente.
      </p>
      <Link
        href="/"
        className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition"
      >
        Reintentar cargar
      </Link>
    </div>
  );
}
