import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, waitFor } from '../../test/utils';
import { getDailySummary, listCashShifts, type CashShiftItem } from '../../api/cashShifts';
import { listCashMovements } from '../../api/cashMovements';
import { listUsers } from '../../api/users';
import { CashRegisterPage } from './index';

vi.mock('../../api/cashShifts', () => ({
  listCashShifts: vi.fn(),
  getDailySummary: vi.fn(),
  getCashShiftDetail: vi.fn(),
  closeCashShift: vi.fn(),
}));

vi.mock('../../api/cashMovements', () => ({
  listCashMovements: vi.fn(),
  getCashMovementsAggregated: vi.fn(),
  deleteCashMovement: vi.fn(),
}));

vi.mock('../../api/users', () => ({
  listUsers: vi.fn(),
}));

const closedShift: CashShiftItem = {
  id: 'c1',
  shiftNumber: 1,
  sellerName: 'Ana',
  status: 'closed',
  openedAt: '2026-10-28T12:00:00.000Z',
  openingAmount: 500,
  closingAmount: 3500,
  expectedAmount: 3500,
  difference: 0,
};

const summary = {
  date: '2026-10-28',
  totalOpening: 500,
  inheritedOpening: 0,
  cashSales: 3000,
  transferSales: 0,
  returns: 0,
  creditPayments: 0,
  cashInTotal: 0,
  cashOutTotal: 0,
  netMovements: 0,
  totalExpected: 3500,
  finalCount: 3500,
  salesInOpenShifts: 0,
  difference: 0,
  shiftsWithDifference: 0,
  totalShifts: 1,
  pendingShifts: [{ id: 'o1', sellerName: 'Juan' }],
};

describe('CashRegisterPage', () => {
  beforeEach(() => {
    vi.mocked(listCashShifts).mockReset();
    vi.mocked(listCashShifts).mockResolvedValue({
      items: [closedShift],
      total: 45,
      page: 1,
      limit: 20,
      totalPages: 3,
    });
    vi.mocked(getDailySummary).mockReset();
    vi.mocked(getDailySummary).mockResolvedValue(summary as never);
    vi.mocked(listCashMovements).mockReset();
    vi.mocked(listCashMovements).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    vi.mocked(listUsers).mockReset();
    vi.mocked(listUsers).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 1,
    } as never);
  });

  it('debería mostrar el resumen diario y el banner de turnos abiertos', async () => {
    renderWithAdminProviders(<CashRegisterPage />);

    expect(await screen.findByTestId('total-operation')).toHaveTextContent('$3.500');
    expect(screen.getByText('1 turno abierto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar turno de Juan' })).toBeInTheDocument();
  });

  it('debería pedir la página siguiente desde la paginación de turnos', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<CashRegisterPage />);
    await screen.findByText('Ana');

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() =>
      expect(listCashShifts).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
    );
  });

  it('debería ocultar el resumen diario en la pestaña Movimientos', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<CashRegisterPage />);
    await screen.findByTestId('total-operation');

    await user.click(screen.getByRole('tab', { name: 'Movimientos' }));

    expect(screen.queryByTestId('total-operation')).not.toBeInTheDocument();
    expect(await screen.findByText('No hay movimientos para mostrar')).toBeInTheDocument();
  });
});
