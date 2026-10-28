import { describe, it, expect } from 'vitest';
import { endOfDayIso, startOfDayIso } from './dateRange';
import { getShiftStatusParams } from './shiftTabs';
import { normalizeDailySummary } from './summary';
import { buildMovementsParams } from './movementsParams';
import { shiftsToCsvRows } from './csv';

describe('dateRange', () => {
  it('debería devolver el inicio del día en hora local cuando recibe YYYY-MM-DD', () => {
    expect(startOfDayIso('2026-10-28')).toBe(new Date(2026, 9, 28, 0, 0, 0, 0).toISOString());
  });

  it('debería devolver el fin del día en hora local cuando recibe YYYY-MM-DD', () => {
    expect(endOfDayIso('2026-10-28')).toBe(new Date(2026, 9, 28, 23, 59, 59, 999).toISOString());
  });

  it('debería devolver undefined cuando la fecha está vacía', () => {
    expect(startOfDayIso('')).toBeUndefined();
    expect(endOfDayIso('')).toBeUndefined();
  });
});

describe('getShiftStatusParams', () => {
  it('debería filtrar por turnos abiertos cuando la pestaña es Abiertos', () => {
    expect(getShiftStatusParams('open')).toEqual({ status: 'open' });
  });

  it('debería pedir solo turnos cerrados con diferencia cuando la pestaña es Con diferencia', () => {
    expect(getShiftStatusParams('difference')).toEqual({ status: 'closed', hasDifference: true });
  });

  it('debería no aplicar filtros de estado cuando la pestaña es Movimientos', () => {
    expect(getShiftStatusParams('movements')).toEqual({});
  });
});

describe('normalizeDailySummary', () => {
  it('debería completar en cero los montos que el backend omite', () => {
    const summary = normalizeDailySummary({ date: '2026-10-28', totalExpected: 3500 });

    expect(summary.totalExpected).toBe(3500);
    expect(summary.returns).toBe(0);
    expect(summary.difference).toBe(0);
    expect(summary.pendingShifts).toEqual([]);
  });
});

describe('buildMovementsParams', () => {
  it('debería enviar solo los filtros que tienen valor', () => {
    const params = buildMovementsParams({ page: 2, pageSize: 20, fromDate: '', toDate: '' });

    expect(params).toEqual({ page: 2, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  });

  it('debería incluir tipo, categoría y rango de fechas cuando están definidos', () => {
    const params = buildMovementsParams({
      page: 1,
      pageSize: 20,
      type: 'out',
      category: 'lunch',
      fromDate: '2026-10-28',
      toDate: '2026-10-28',
    });

    expect(params.type).toBe('out');
    expect(params.category).toBe('lunch');
    expect(params.fromDate).toBe(new Date(2026, 9, 28, 0, 0, 0, 0).toISOString());
    expect(params.toDate).toBe(new Date(2026, 9, 28, 23, 59, 59, 999).toISOString());
  });
});

describe('shiftsToCsvRows', () => {
  it('debería exportar los turnos abiertos con estado ABIERTO y montos vacíos', () => {
    const [row] = shiftsToCsvRows([
      {
        id: '1',
        shiftNumber: 3,
        sellerName: 'Ana',
        status: 'open',
        openedAt: '2026-10-28T12:00:00.000Z',
        openingAmount: 500,
      },
    ]);

    expect(row.Turno).toBe('#3');
    expect(row.Estado).toBe('ABIERTO');
    expect(row['Monto Esperado']).toBe('');
    expect(row['Monto Real']).toBe('');
  });
});
