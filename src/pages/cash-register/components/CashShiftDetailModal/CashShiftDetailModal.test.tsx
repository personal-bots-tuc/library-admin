import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithAdminProviders, screen } from '../../../../test/utils';
import { getCashShiftDetail } from '../../../../api/cashShifts';
import { CashShiftDetailModal } from './index';

vi.mock('../../../../api/cashShifts', () => ({
  getCashShiftDetail: vi.fn(),
}));

describe('CashShiftDetailModal', () => {
  beforeEach(() => {
    vi.mocked(getCashShiftDetail).mockReset();
  });

  it('debería mostrar el error cuando falla la carga del detalle', async () => {
    vi.mocked(getCashShiftDetail).mockRejectedValue(new Error('No encontrado'));

    renderWithAdminProviders(<CashShiftDetailModal shiftId="s1" onClose={vi.fn()} />);

    expect(await screen.findByText('Error: No encontrado')).toBeInTheDocument();
  });

  it('debería mostrar el estado de carga mientras espera el detalle', () => {
    vi.mocked(getCashShiftDetail).mockReturnValue(new Promise(() => {}));

    renderWithAdminProviders(<CashShiftDetailModal shiftId="s1" onClose={vi.fn()} />);

    expect(screen.getByText('Cargando detalle del turno...')).toBeInTheDocument();
  });

  it('debería mostrar el turno y sus movimientos cuando el detalle carga', async () => {
    vi.mocked(getCashShiftDetail).mockResolvedValue({
      shift: {
        id: 's1',
        shiftNumber: 7,
        sellerName: 'Ana',
        status: 'closed',
        openedAt: '2026-10-28T12:00:00.000Z',
        openingAmount: 500,
        difference: 0,
      },
      sales: {
        cashTotal: 3000,
        transferTotal: 0,
        creditTotal: 0,
        salesCount: 2,
        returnsTotal: 0,
        returnsCashTotal: 0,
        returnsTransferTotal: 0,
        returnsCreditTotal: 0,
      },
      movements: {
        items: [],
        aggregated: {
          cashInTotal: 0,
          cashOutTotal: 0,
          netMovements: 0,
          movementsCount: 0,
          byCategory: {
            lunch: { in: 0, out: 0, count: 0 },
            supplies: { in: 0, out: 0, count: 0 },
            personal_withdrawal: { in: 0, out: 0, count: 0 },
            change: { in: 0, out: 0, count: 0 },
            expense: { in: 0, out: 0, count: 0 },
            other: { in: 0, out: 0, count: 0 },
          },
        },
      },
    } as never);

    renderWithAdminProviders(<CashShiftDetailModal shiftId="s1" onClose={vi.fn()} />);

    expect(await screen.findByText('Turno #7 · Ana')).toBeInTheDocument();
    expect(screen.getByText('Sin movimientos por categoría')).toBeInTheDocument();
    expect(screen.getByText('Sin movimientos registrados')).toBeInTheDocument();
  });
});
