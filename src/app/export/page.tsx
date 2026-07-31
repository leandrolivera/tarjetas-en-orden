'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { DataStore } from '@/lib/data-store';
import { exportExpensesToCSV, downloadCSV, parseAndValidateExpensesCSV, CSVImportRow } from '@/lib/csv';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function ExportPage() {
  const [store, setStore] = useState(DataStore.getStore());
  const [importRows, setImportRows] = useState<CSVImportRow[]>([]);
  const [importedSuccess, setImportedSuccess] = useState(false);

  const handleExportExpenses = () => {
    const csv = exportExpensesToCSV(store.expenses);
    downloadCSV(`gastos_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseAndValidateExpensesCSV(content);
      setImportRows(parsed);
      setImportedSuccess(false);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validRows = importRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const currentStore = DataStore.getStore();
    validRows.forEach((row, idx) => {
      const newExp = {
        id: 'exp-imp-' + Date.now() + '-' + idx,
        household_id: 'household-hogar-999',
        card_id: currentStore.cards[0]?.id || '',
        category_id: currentStore.categories[0]?.id || '',
        purchaser_id: currentStore.people[0]?.id || '',
        description: row.descripcion,
        merchant: row.comercio || 'Importado CSV',
        total_amount: row.importe,
        currency: (row.moneda as 'ARS' | 'USD') || 'ARS',
        purchase_date: row.fecha,
        installments_count: row.cuotas,
        distribution_type: 'shared_equal' as const,
        notes: 'Importado desde CSV',
        created_by: currentStore.currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      currentStore.expenses.unshift(newExp);
    });

    DataStore.saveStore(currentStore);
    DataStore.addAuditLog('household-hogar-999', 'Importó gastos desde CSV', 'csv_import', 'sys', null, { count: validRows.length });

    setImportedSuccess(true);
    setImportRows([]);
  };

  return (
    <Navigation>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Exportación e Importación CSV</h1>
          <p className="text-xs text-slate-400">
            Descargá reportes compatibles con Excel o prepará la importación masiva de gastos
          </p>
        </div>

        {/* EXPORT SECTION */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-sky-400" />
            Exportar Información a CSV / Excel
          </h3>
          <p className="text-xs text-slate-300">
            Exportá todos tus gastos, cuotas y tarjetas en formato normalizado CSV para abrir en Microsoft Excel o Google Sheets.
          </p>

          <button
            onClick={handleExportExpenses}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-2xl shadow-lg transition flex items-center gap-2 text-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Gastos en CSV</span>
          </button>
        </div>

        {/* IMPORT PREPARATION SECTION (Section 19 compliance) */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-sky-400" />
              Importación Masiva desde CSV
            </h3>

            <a
              href="/ejemplo_importacion_gastos.csv"
              download
              className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <FileText className="w-3.5 h-3.5" />
              Descargar CSV de Ejemplo
            </a>
          </div>

          <p className="text-xs text-slate-300">
            Seleccioná un archivo CSV para validar sus filas antes de confirmar la importación.
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-sky-400 hover:file:bg-slate-700 cursor-pointer"
          />

          {importedSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Gastos importados con éxito e integrados al sistema.</span>
            </div>
          )}

          {/* PREVIEW TABLE */}
          {importRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">
                  Vista Previa ({importRows.filter((r) => r.isValid).length} filas válidas de {importRows.length})
                </span>
                <button
                  onClick={handleConfirmImport}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs"
                >
                  Confirmar e Importar
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto bg-slate-900 rounded-2xl p-2 border border-slate-800">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="text-slate-500 font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-2">Fecha</th>
                      <th className="py-2 px-2">Descripción</th>
                      <th className="py-2 px-2">Importe</th>
                      <th className="py-2 px-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {importRows.map((r, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-2">{r.fecha}</td>
                        <td className="py-2 px-2 font-bold text-white">{r.descripcion}</td>
                        <td className="py-2 px-2 font-mono">{r.moneda} {r.importe}</td>
                        <td className="py-2 px-2">
                          {r.isValid ? (
                            <span className="text-emerald-400 font-semibold">✓ Válido</span>
                          ) : (
                            <span className="text-rose-400 font-semibold">{r.errors.join(', ')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Navigation>
  );
}
