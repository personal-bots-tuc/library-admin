import type { CashShiftItem } from '../../api/cashShifts';

/** Pestañas de la página: los tres primeros listan turnos, `movements` lista movimientos. */
export type CashRegisterTab = 'closed' | 'open' | 'difference' | 'movements';

export interface ShiftFilters {
  /** Fecha local `YYYY-MM-DD` o vacío. */
  fromDate: string;
  toDate: string;
  sellerId: string;
}

export interface SellerOption {
  id: string;
  name: string;
}

/** Turno que se va a cerrar. El modal de cierre carga el resto del detalle. */
export interface CloseTarget {
  id: string;
  sellerName: string;
}

export type ShiftRow = CashShiftItem;
