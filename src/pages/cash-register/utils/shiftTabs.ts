import type { ListCashShiftsParams } from '../../../api/cashShifts';
import type { CashRegisterTab } from '../types';

export const SHIFT_TABS: { id: CashRegisterTab; label: string }[] = [
  { id: 'closed', label: 'Cerrados' },
  { id: 'open', label: 'Abiertos' },
  { id: 'difference', label: 'Con diferencia' },
  { id: 'movements', label: 'Movimientos' },
];

/**
 * Filtros de estado por pestaña. "Con diferencia" incluye `status: closed` porque el
 * backend, sin ese filtro, devuelve también los turnos abiertos (su `difference` es null).
 */
export const getShiftStatusParams = (
  tab: CashRegisterTab
): Pick<ListCashShiftsParams, 'status' | 'hasDifference'> => {
  switch (tab) {
    case 'open':
      return { status: 'open' };
    case 'closed':
      return { status: 'closed' };
    case 'difference':
      return { status: 'closed', hasDifference: true };
    case 'movements':
      return {};
  }
};
