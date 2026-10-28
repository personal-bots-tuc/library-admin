import type { DailySummary } from '../../../api/cashShifts';

const num = (value: number | null | undefined) => value ?? 0;

/** Completa los campos que el backend puede omitir para que la UI nunca tenga `undefined`. */
export const normalizeDailySummary = (raw: Partial<DailySummary>): DailySummary => ({
  date: raw.date ?? '',
  totalOpening: num(raw.totalOpening),
  inheritedOpening: num(raw.inheritedOpening),
  cashSales: num(raw.cashSales),
  transferSales: num(raw.transferSales),
  returns: num(raw.returns),
  creditPayments: num(raw.creditPayments),
  cashInTotal: num(raw.cashInTotal),
  cashOutTotal: num(raw.cashOutTotal),
  netMovements: num(raw.netMovements),
  totalExpected: num(raw.totalExpected),
  finalCount: num(raw.finalCount),
  salesInOpenShifts: num(raw.salesInOpenShifts),
  difference: num(raw.difference),
  shiftsWithDifference: num(raw.shiftsWithDifference),
  totalShifts: num(raw.totalShifts),
  pendingShifts: raw.pendingShifts ?? [],
});
