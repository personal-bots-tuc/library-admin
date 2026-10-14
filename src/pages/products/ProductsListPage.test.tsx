import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsListPage from './ProductsListPage';
import { SearchProvider } from './SearchContext';
import { renderWithAdminProviders } from '../../test/utils';

vi.mock('../../api/products', () => ({
  listProducts: vi
    .fn()
    .mockResolvedValue({ items: [], total: 0, page: 1, limit: 8, totalPages: 1 }),
  getProductCounts: vi
    .fn()
    .mockResolvedValue({ productCount: 0, serviceCount: 0, lowStockCount: 0 }),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

function renderProductsListPage() {
  return renderWithAdminProviders(
    <SearchProvider>
      <ProductsListPage />
    </SearchProvider>
  );
}

describe('ProductsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('expone el botón "Nuevo producto" (regresión ADMIN-112)', async () => {
    renderProductsListPage();

    // Esperar a que termine el loading
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /imprimir listado/i })).not.toBeDisabled();
    });

    expect(screen.getByRole('button', { name: /nuevo producto/i })).toBeInTheDocument();
  });

  it('abrir el modal de creación al hacer clic', async () => {
    const user = userEvent.setup();
    renderProductsListPage();

    // Esperar a que termine el loading
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /imprimir listado/i })).not.toBeDisabled();
    });

    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));

    // El modal de creación queda visible (header del Modal + submit)
    expect(await screen.findAllByText('Crear producto')).toHaveLength(2);
  });
});
