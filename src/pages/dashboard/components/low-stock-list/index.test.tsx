import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen } from '../../../../test/utils';
import { LowStockList } from './index';

const items = [
  { id: '1', name: 'Lápiz', stock: 2, minStock: 5 },
  { id: '2', name: 'Goma', stock: 1 },
];

describe('LowStockList', () => {
  it('debería mostrar "Todo el stock OK" cuando no hay productos', () => {
    renderWithAdminProviders(<LowStockList items={[]} total={0} onViewAll={vi.fn()} />);

    expect(screen.getByText('Todo el stock OK')).toBeInTheDocument();
  });

  it('debería mostrar stock/mínimo y usar 10 cuando el producto no define mínimo', () => {
    renderWithAdminProviders(<LowStockList items={items} total={2} onViewAll={vi.fn()} />);

    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByText('1/10')).toBeInTheDocument();
  });

  it('debería limitar la altura de la lista con scroll interno', () => {
    renderWithAdminProviders(<LowStockList items={items} total={2} onViewAll={vi.fn()} />);

    expect(screen.getByRole('list', { name: 'Productos con stock bajo' })).toHaveClass(
      'max-h-64',
      'overflow-y-auto'
    );
  });

  it('debería llamar onViewAll desde "Ver todos (N)" cuando el total supera lo mostrado', async () => {
    const user = userEvent.setup();
    const onViewAll = vi.fn();
    renderWithAdminProviders(<LowStockList items={items} total={15} onViewAll={onViewAll} />);

    await user.click(screen.getByRole('button', { name: /^Ver todos \(15\)/ }));

    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('debería ocultar "Ver todos" cuando el total no supera lo mostrado', () => {
    renderWithAdminProviders(<LowStockList items={items} total={2} onViewAll={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Ver todos/ })).not.toBeInTheDocument();
  });
});
