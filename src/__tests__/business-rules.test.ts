import { describe, it, expect } from 'vitest';
import { calculateInstallments } from '../lib/installments';
import { formatCurrency } from '../lib/currency';
import { calculateStatementPeriod } from '../lib/closing-dates';

describe('Tarjetas en Orden - Core Business Rules', () => {
  it('should correctly divide installments with penny rounding adding up to exact total', () => {
    // Test case: $100 in 3 installments
    const installments = calculateInstallments(100, 3, 'ARS', '2026-08-01');

    expect(installments).toHaveLength(3);
    expect(installments[0].amount).toBe(33.34);
    expect(installments[1].amount).toBe(33.33);
    expect(installments[2].amount).toBe(33.33);

    const sum = installments.reduce((acc, curr) => acc + curr.amount, 0);
    expect(Number(sum.toFixed(2))).toBe(100.00);
  });

  it('should format ARS and USD distinctly using Argentine locale', () => {
    const ars = formatCurrency(450000, 'ARS');
    const usd = formatCurrency(120, 'USD');

    expect(ars).toContain('$');
    expect(usd).toContain('USD');
    expect(ars).not.toContain('USD');
  });

  it('should assign purchases on or before closing date to current statement period', () => {
    // Closing day: 25, Due day: 5
    const period = calculateStatementPeriod('2026-07-20', 25, 5);

    expect(period.period_month).toBe(7);
    expect(period.period_year).toBe(2026);
    expect(period.closing_date).toBe('2026-07-25');
    expect(period.due_date).toBe('2026-08-05');
  });

  it('should assign purchases after closing date to next statement period', () => {
    // Closing day: 25, Due day: 5
    const period = calculateStatementPeriod('2026-07-26', 25, 5);

    expect(period.period_month).toBe(8);
    expect(period.period_year).toBe(2026);
    expect(period.closing_date).toBe('2026-08-25');
    expect(period.due_date).toBe('2026-09-05');
  });
});
