import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsListPage from './ProductsListPage';
import { renderWithAdminProviders } from '../../test/utils';

vi.mock('../../api/products', () => ({
  listProducts: vi
    .fn()
    .mockResolvedValue({ items: [], total: 0, page: 1, limit: 8, totalPages: 1 }),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

describe('ProductsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('expone el botón "Nuevo producto" (regresión ADMIN-112)', () => {
    renderWithAdminProviders(<ProductsListPage />);

    expect(screen.getByRole('button', { name: /nuevo producto/i })).toBeInTheDocument();
  });

  it('abrir el modal de creación al hacer clic', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<ProductsListPage />);

    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));

    // El modal de creación queda visible (header del Modal + submit)
    expect(await screen.findAllByText('Crear producto')).toHaveLength(2);
  });
});
