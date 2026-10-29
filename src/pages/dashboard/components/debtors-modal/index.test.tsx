import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithAdminProviders, screen } from '../../../../test/utils';
import * as creditsApi from '../../../../api/credits';
import { money } from '../../../../lib/format';
import { DebtorsModal } from './index';

vi.mock('../../../../api/credits');

const mockListCredits = vi.mocked(creditsApi.listCredits);

const response = (items: { id: string; fullName: string; dni: string; balance: number }[]) => ({
  items: items.map(client => ({ client, balance: client.balance })),
  total: items.length,
  page: 1,
  limit: 10,
  totalPages: 1,
  summary: { totalOutstanding: 0, overdueCount: 0, overdueAmount: 0 },
});

describe('DebtorsModal', () => {
  beforeEach(() => {
    mockListCredits.mockReset();
  });

  it('debería mostrar el título y cada deudor con DNI y saldo cuando la API responde', async () => {
    mockListCredits.mockResolvedValue(
      response([{ id: 'c1', fullName: 'Ana Pérez', dni: '30111222', balance: 900 }])
    );
    renderWithAdminProviders(<DebtorsModal onClose={vi.fn()} />);

    expect(screen.getByText('Deudores')).toBeInTheDocument();
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('30111222')).toBeInTheDocument();
    expect(screen.getByText(money(900), { normalizer: text => text })).toBeInTheDocument();
  });

  it('debería mostrar el mensaje de vacío cuando no hay deudores', async () => {
    mockListCredits.mockResolvedValue(response([]));
    renderWithAdminProviders(<DebtorsModal onClose={vi.fn()} />);

    expect(await screen.findByText('No hay clientes con deuda')).toBeInTheDocument();
  });
});
