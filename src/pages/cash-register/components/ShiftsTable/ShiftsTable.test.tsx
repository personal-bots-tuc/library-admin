import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, within } from '../../../../test/utils';
import type { CashShiftItem } from '../../../../api/cashShifts';
import { ShiftsTable } from './index';

const closed: CashShiftItem = {
  id: 'c1',
  shiftNumber: 1,
  sellerName: 'Ana',
  status: 'closed',
  openedAt: '2026-10-28T12:00:00.000Z',
  closedAt: '2026-10-28T20:00:00.000Z',
  openingAmount: 500,
  expectedAmount: 3500,
  closingAmount: 3400,
  difference: -100,
};

const open: CashShiftItem = {
  id: 'o1',
  shiftNumber: 2,
  sellerName: 'Juan',
  status: 'open',
  openedAt: '2026-10-28T14:00:00.000Z',
  openingAmount: 300,
};

const baseProps = {
  total: 2,
  page: 1,
  pageSize: 20,
  loading: false,
  onPageChange: vi.fn(),
  onCloseShift: vi.fn(),
  onViewShift: vi.fn(),
};

describe('ShiftsTable', () => {
  it('debería ofrecer cerrar solo los turnos abiertos', () => {
    renderWithAdminProviders(<ShiftsTable {...baseProps} shifts={[closed, open]} />);

    const openRow = screen.getByText('Juan').closest('tr')!;
    const closedRow = screen.getByText('Ana').closest('tr')!;
    expect(within(openRow).getByRole('button', { name: 'Cerrar turno' })).toBeInTheDocument();
    expect(
      within(closedRow).queryByRole('button', { name: 'Cerrar turno' })
    ).not.toBeInTheDocument();
  });

  it('debería mostrar un guion en esperado y real cuando el turno abierto aún no tiene montos', () => {
    renderWithAdminProviders(<ShiftsTable {...baseProps} shifts={[open]} />);

    const row = screen.getByText('Juan').closest('tr')!;
    expect(within(row).getAllByText('—')).toHaveLength(2);
  });

  it('debería llamar onCloseShift con el turno al pulsar Cerrar turno', async () => {
    const user = userEvent.setup();
    const onCloseShift = vi.fn();
    renderWithAdminProviders(
      <ShiftsTable {...baseProps} shifts={[open]} onCloseShift={onCloseShift} />
    );

    await user.click(screen.getByRole('button', { name: 'Cerrar turno' }));

    expect(onCloseShift).toHaveBeenCalledWith({ id: 'o1', sellerName: 'Juan' });
  });

  it('debería mostrar la paginación del servidor cuando el total supera una página', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithAdminProviders(
      <ShiftsTable {...baseProps} shifts={[closed]} total={45} onPageChange={onPageChange} />
    );

    expect(screen.getByText('Mostrando 1 a 20 de 45')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
