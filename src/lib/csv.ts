import { Expense, Card, Statement, Reimbursement, RecurringExpense } from './types';

/**
 * Downloads a CSV string as a file in the user's browser.
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportExpensesToCSV(expenses: Expense[]): string {
  const headers = [
    'ID',
    'Fecha Compra',
    'Descripción',
    'Comercio',
    'Importe Total',
    'Moneda',
    'Tarjeta',
    'Categoría',
    'Cuotas',
    'Comprador',
    'Tipo Distribución',
    'Fecha Creación',
  ];

  const rows = expenses.map((e) => [
    e.id,
    e.purchase_date,
    `"${e.description.replace(/"/g, '""')}"`,
    `"${e.merchant.replace(/"/g, '""')}"`,
    e.total_amount,
    e.currency,
    `"${e.card?.name || e.card_id}"`,
    `"${e.category?.name || e.category_id}"`,
    e.installments_count,
    `"${e.purchaser?.name || e.purchaser_id}"`,
    e.distribution_type,
    e.created_at,
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

export interface CSVImportRow {
  fecha: string;
  descripcion: string;
  comercio: string;
  importe: number;
  moneda: string;
  tarjeta: string;
  categoria: string;
  cuotas: number;
  responsable: string;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export function parseAndValidateExpensesCSV(csvText: string): CSVImportRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: CSVImportRow[] = [];
  const dataLines = lines.slice(1);

  for (let i = 0; i < dataLines.length; i++) {
    const cols = dataLines[i].split(/[;,]/).map((c) => c.replace(/^"|"$/g, '').trim());
    const [fecha, descripcion, comercio, importeStr, moneda, tarjeta, categoria, cuotasStr, responsable] = cols;

    const errors: string[] = [];
    const amount = parseFloat(importeStr?.replace(',', '.') || '0');
    const cuotas = parseInt(cuotasStr || '1', 10);

    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      errors.push('Fecha inválida (usar YYYY-MM-DD)');
    }
    if (!descripcion || descripcion.length === 0) {
      errors.push('Descripción obligatoria');
    }
    if (isNaN(amount) || amount <= 0) {
      errors.push('Importe debe ser un número positivo');
    }
    if (!['ARS', 'USD'].includes(moneda?.toUpperCase())) {
      errors.push('Moneda debe ser ARS o USD');
    }

    results.push({
      fecha: fecha || '',
      descripcion: descripcion || '',
      comercio: comercio || '',
      importe: isNaN(amount) ? 0 : amount,
      moneda: (moneda?.toUpperCase() as 'ARS' | 'USD') || 'ARS',
      tarjeta: tarjeta || '',
      categoria: categoria || '',
      cuotas: isNaN(cuotas) || cuotas < 1 ? 1 : cuotas,
      responsable: responsable || '',
      isValid: errors.length === 0,
      errors,
    });
  }

  return results;
}
