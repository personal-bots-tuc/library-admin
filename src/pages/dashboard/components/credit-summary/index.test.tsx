import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen } from '../../../../test/utils';
import { money } from '../../../../lib/format';
import { CreditSummary } from './index';

const clients = Array.from({ length: 5 }, (_, i) => ({
  id: `c${i}`,
  fullName: `Cliente ${i}`,
  balance: (5 - i) * 100,
}));

describe('CreditSummary', () => {
  it('debería mostrar el total pendiente cuando hay deuda', () => {
    renderWithAdminProviders(
      <CreditSummary
        totalOutstanding={1500}
        clientsWithDebt={5}
        clients={clients}
        onViewAll={vi.fn()}
      />
    );

    expect(screen.getByText(`−${money(1500)}`, { normalizer: text => text })).toBeInTheDocument();
  });

  it('debería mostrar todos los deudores recibidos cuando son más de 3', () => {
    renderWithAdminProviders(
      <CreditSummary
        totalOutstanding={1500}
        clientsWithDebt={5}
        clients={clients}
        onViewAll={vi.fn()}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Cliente 4')).toBeInTheDocument();
  });

  it('debería limitar la altura de la lista de deudores con scroll interno', () => {
    renderWithAdminProviders(
      <CreditSummary
        totalOutstanding={1500}
        clientsWithDebt={5}
        clients={clients}
        onViewAll={vi.fn()}
      />
    );

    expect(screen.getByRole('list', { name: 'Principales deudores' })).toHaveClass(
      'max-h-64',
      'overflow-y-auto'
    );
  });

  it('debería llamar onViewAll desde "Ver todos (N)" cuando hay más deudores que los mostrados', async () => {
    const user = userEvent.setup();
    const onViewAll = vi.fn();
    renderWithAdminProviders(
      <CreditSummary
        totalOutstanding={1500}
        clientsWithDebt={12}
        clients={clients}
        onViewAll={onViewAll}
      />
    );

    await user.click(screen.getByRole('button', { name: /^Ver todos \(12\)/ }));

    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('debería ocultar "Ver todos" cuando se muestran todos los deudores', () => {
    renderWithAdminProviders(
      <CreditSummary
        totalOutstanding={1500}
        clientsWithDebt={5}
        clients={clients}
        onViewAll={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Ver todos/ })).not.toBeInTheDocument();
  });
});
