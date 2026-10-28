import type { CashMovementItem } from '../../../api/cashMovements';
import type { CashShiftItem } from '../../../api/cashShifts';
import { formatShortDateTime, formatTime } from '../../../lib/format';

export const shiftsToCsvRows = (shifts: CashShiftItem[]) =>
  shifts.map(s => ({
    Turno: `#${s.shiftNumber}`,
    Vendedor: s.sellerName,
    Estado: s.status === 'open' ? 'ABIERTO' : 'CERRADO',
    Apertura: formatTime(s.openedAt),
    Cierre: formatTime(s.closedAt),
    'Monto Apertura': s.openingAmount,
    'Monto Esperado': s.expectedAmount ?? '',
    'Monto Real': s.closingAmount ?? '',
    Diferencia: s.difference ?? '',
  }));

export const movementsToCsvRows = (movements: CashMovementItem[]) =>
  movements.map(m => ({
    Turno: `#${m.shiftNumber}`,
    Vendedor: m.sellerName,
    Tipo: m.type === 'in' ? 'Entrada' : 'Salida',
    Categoría: m.category,
    Monto: m.amount,
    Descripción: m.description,
    Fecha: formatShortDateTime(m.createdAt),
  }));
