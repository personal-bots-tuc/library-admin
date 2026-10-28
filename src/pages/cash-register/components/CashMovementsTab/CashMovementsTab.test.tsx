import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, waitFor, within } from '../../../../test/utils';
import {
  deleteCashMovement,
  getCashMovementsAggregated,
  listCashMovements,
  type CashMovementItem,
} from '../../../../api/cashMovements';
import { useAuth } from '../../../../hooks/useAuth';
import { CashMovementsTab } from './index';

vi.mock('../../../../api/cashMovements', () => ({
  listCashMovements: vi.fn(),
  getCashMovementsAggregated: vi.fn(),
  deleteCashMovement: vi.fn(),
}));

vi.mock('../../../../hooks/useAuth', async importOriginal => ({
  ...(await importOriginal<object>()),
  useAuth: vi.fn(),
}));

const movement: CashMovementItem = {
  id: 'm1',
  cashShiftId: 's1',
  shiftNumber: 4,
  sellerName: 'Ana',
  type: 'out',
  category: 'lunch',
  amount: 800,
  description: 'Almuerzo del equipo',
  createdAt: '2026-10-28T15:00:00.000Z',
};

const authAs = (role: { isAdmin: boolean; isSuperAdmin: boolean }) =>
  vi.mocked(useAuth).mockReturnValue({ ...role } as never);

describe('CashMovementsTab', () => {
  beforeEach(() => {
    vi.mocked(listCashMovements).mockReset();
    vi.mocked(listCashMovements).mockResolvedValue({
      items: [movement],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    vi.mocked(getCashMovementsAggregated).mockReset();
    vi.mocked(deleteCashMovement).mockReset();
    vi.mocked(deleteCashMovement).mockResolvedValue(undefined);
  });

  it('debería mostrar el botón eliminar solo a administradores', async () => {
    authAs({ isAdmin: false, isSuperAdmin: false });
    renderWithAdminProviders(<CashMovementsTab />);

    await screen.findByText('Almuerzo del equipo');
    expect(screen.queryByRole('button', { name: 'Eliminar movimiento' })).not.toBeInTheDocument();
  });

  it('debería pedir el listado con el filtro de tipo al elegir Salidas', async () => {
    const user = userEvent.setup();
    authAs({ isAdmin: false, isSuperAdmin: false });
    renderWithAdminProviders(<CashMovementsTab />);
    await screen.findByText('Almuerzo del equipo');

    await user.click(screen.getByRole('tab', { name: 'Salidas' }));

    await waitFor(() =>
      expect(listCashMovements).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'out', page: 1 })
      )
    );
    expect(screen.getByLabelText('Tipo')).toHaveValue('out');
  });

  it('debería eliminar el movimiento tras confirmar cuando el usuario es superadmin', async () => {
    const user = userEvent.setup();
    authAs({ isAdmin: false, isSuperAdmin: true });
    renderWithAdminProviders(<CashMovementsTab />);
    const row = (await screen.findByText('Almuerzo del equipo')).closest('tr')!;

    await user.click(within(row).getByRole('button', { name: 'Eliminar movimiento' }));
    const dialog = screen
      .getByText('Eliminar movimiento', { selector: 'h2' })
      .closest('div')!.parentElement!;
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(deleteCashMovement).toHaveBeenCalledWith('m1'));
  });
});
