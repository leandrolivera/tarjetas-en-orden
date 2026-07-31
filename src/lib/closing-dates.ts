import {
  parseISO,
  getDate,
  getMonth,
  getYear,
  getDaysInMonth,
  addMonths,
  format,
  setMonth,
  setYear,
} from 'date-fns';

export interface StatementPeriodInfo {
  period_year: number;
  period_month: number; // 1-12
  closing_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
}

/**
 * Returns the last valid day of a given year and month (1-12) for a target day number.
 * e.g., target day 31 in Feb 2026 returns 28.
 */
export function getValidDayInMonth(year: number, month: number, targetDay: number): number {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1, 1));
  return Math.min(targetDay, daysInMonth);
}

/**
 * Determines which statement closing period an expense purchase date falls into,
 * and calculates the corresponding statement closing date and due date.
 */
export function calculateStatementPeriod(
  purchaseDateStr: string, // YYYY-MM-DD
  defaultClosingDay: number, // 1-31
  defaultDueDay: number // 1-31
): StatementPeriodInfo {
  const date = parseISO(purchaseDateStr);
  const pDay = getDate(date);
  let pMonth = getMonth(date) + 1; // 1-indexed
  let pYear = getYear(date);

  // If purchase day is after closing day, it enters NEXT month's closing cycle
  if (pDay > defaultClosingDay) {
    pMonth += 1;
    if (pMonth > 12) {
      pMonth = 1;
      pYear += 1;
    }
  }

  const validClosingDay = getValidDayInMonth(pYear, pMonth, defaultClosingDay);
  const closingDateObj = new Date(pYear, pMonth - 1, validClosingDay);
  const closing_date = format(closingDateObj, 'yyyy-MM-dd');

  // Due date is in the month FOLLOWING the closing date if due day <= closing day,
  // or in the SAME month if due day > closing day.
  let dueMonth = pMonth;
  let dueYear = pYear;
  if (defaultDueDay <= defaultClosingDay) {
    dueMonth += 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }
  }

  const validDueDay = getValidDayInMonth(dueYear, dueMonth, defaultDueDay);
  const dueDateObj = new Date(dueYear, dueMonth - 1, validDueDay);
  const due_date = format(dueDateObj, 'yyyy-MM-dd');

  return {
    period_year: pYear,
    period_month: pMonth,
    closing_date,
    due_date,
  };
}
