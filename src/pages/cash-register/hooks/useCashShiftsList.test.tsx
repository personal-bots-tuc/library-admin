import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '../../../test/utils';
import { ToastProvider } from '../../../components/Toast/useToast';
import {
  listCashShifts,
  type CashShiftItem,
  type CashShiftListResult,
} from '../../../api/cashShifts';
import { CASH_SHIFTS_PAGE_SIZE, useCashShiftsList } from './useCashShiftsList';

vi.mock('../../../api/cashShifts', () => ({
  listCashShifts: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const shift = (id: string): CashShiftItem => ({
  id,
  shiftNumber: Number(id),
  sellerName: `Vendedor ${id}`,
  status: 'closed',
  openedAt: '2026-10-28T12:00:00.000Z',
  openingAmount: 500,
});

const page = (items: CashShiftItem[], total = items.length): CashShiftListResult => ({
  items,
  total,
  page: 1,
  limit: CASH_SHIFTS_PAGE_SIZE,
  totalPages: Math.ceil(total / CASH_SHIFTS_PAGE_SIZE) || 1,
});

describe('useCashShiftsList', () => {
  beforeEach(() => {
    vi.mocked(listCashShifts).mockReset();
    vi.mocked(listCashShifts).mockResolvedValue(page([shift('1')]));
  });

  it('debería pedir turnos cerrados paginados al cargar', async () => {
    const { result } = renderHook(() => useCashShiftsList(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listCashShifts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: CASH_SHIFTS_PAGE_SIZE, status: 'closed' })
    );
    expect(result.current.shifts).toHaveLength(1);
  });

  it('debería usar el total del servidor para calcular las páginas', async () => {
    vi.mocked(listCashShifts).mockResolvedValue(page([shift('1')], 45));
    const { result } = renderHook(() => useCashShiftsList(), { wrapper });

    await waitFor(() => expect(result.current.total).toBe(45));

    expect(result.current.totalPages).toBe(3);
  });

  it('debería volver a la página 1 cuando cambia la pestaña', async () => {
    const { result } = renderHook(() => useCashShiftsList(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));
    act(() => result.current.setTab('open'));

    await waitFor(() =>
      expect(listCashShifts).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, status: 'open' })
      )
    );
    expect(result.current.page).toBe(1);
  });

  it('debería descartar la respuesta anterior cuando cambian los filtros antes de que llegue', async () => {
    let resolveFirst: (value: CashShiftListResult) => void = () => {};
    vi.mocked(listCashShifts)
      .mockImplementationOnce(
        () => new Promise<CashShiftListResult>(resolve => (resolveFirst = resolve))
      )
      .mockResolvedValueOnce(page([shift('2')]));

    const { result } = renderHook(() => useCashShiftsList(), { wrapper });
    act(() => result.current.updateFilters({ sellerId: 'user-2' }));
    await waitFor(() => expect(result.current.shifts[0]?.id).toBe('2'));

    await act(async () => resolveFirst(page([shift('1')])));

    expect(result.current.shifts[0]?.id).toBe('2');
  });

  it('debería no pedir turnos cuando la pestaña es Movimientos', async () => {
    const { result } = renderHook(() => useCashShiftsList(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(listCashShifts).mockClear();

    act(() => result.current.setTab('movements'));

    expect(listCashShifts).not.toHaveBeenCalled();
  });

  it('debería vaciar la lista y mostrar el error cuando la carga falla', async () => {
    vi.mocked(listCashShifts).mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useCashShiftsList(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.shifts).toEqual([]);
    expect(result.current.total).toBe(0);
  });
});
