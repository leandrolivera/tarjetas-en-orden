import { Currency } from './types';
import { addMonths, format, parseISO } from 'date-fns';

export interface CalculatedInstallment {
  installment_number: number;
  total_installments: number;
  amount: number;
  currency: Currency;
  due_date: string; // YYYY-MM-DD
}

/**
 * Calculates installment amounts with exact penny/cent rounding distribution.
 * Ensures sum(installment amounts) === totalAmount exactly.
 */
export function calculateInstallments(
  totalAmount: number,
  installmentsCount: number,
  currency: Currency,
  firstDueDate: string // YYYY-MM-DD
): CalculatedInstallment[] {
  if (installmentsCount < 1) {
    throw new Error('Installments count must be at least 1');
  }

  // Multiply by 100 to work strictly in integer cents/centavos
  const totalCents = Math.round(totalAmount * 100);
  const baseCentsPerInstallment = Math.floor(totalCents / installmentsCount);
  const remainderCents = totalCents - baseCentsPerInstallment * installmentsCount;

  const result: CalculatedInstallment[] = [];
  const initialDate = parseISO(firstDueDate);

  for (let i = 1; i <= installmentsCount; i++) {
    // Add 1 cent to the first N installments that cover the remainder
    const extraCent = i <= remainderCents ? 1 : 0;
    const cents = baseCentsPerInstallment + extraCent;
    const amount = cents / 100;

    const installmentDueDate = format(addMonths(initialDate, i - 1), 'yyyy-MM-dd');

    result.push({
      installment_number: i,
      total_installments: installmentsCount,
      amount,
      currency,
      due_date: installmentDueDate,
    });
  }

  return result;
}
