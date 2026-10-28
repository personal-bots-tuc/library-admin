import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsListPage from './ProductsListPage';
import { SearchProvider } from './SearchContext';
import { renderWithAdminProviders } from '../../test/utils';
import { listProducts } from '../../api/products';
import { listCategories } from '../../api/categories';

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

vi.mock('../../api/categories', () => ({
  listCategories: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
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

  it('el filtro de categorías lista las categorías y filtra por la elegida', async () => {
    vi.mocked(listCategories).mockResolvedValue([
      { id: 'cat-1', name: 'Útiles escolares', active: true },
    ]);
    const user = userEvent.setup();
    renderProductsListPage();

    const categorySelect = await screen.findByRole('combobox', { name: 'Filtrar por categoría' });
    expect(await screen.findByRole('option', { name: 'Útiles escolares' })).toBeInTheDocument();

    await user.selectOptions(categorySelect, 'cat-1');

    await waitFor(() => {
      expect(listProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ categoryId: 'cat-1' })
      );
    });
  });

  it('muestra el nombre de la categoría de cada producto en el listado', async () => {
    vi.mocked(listCategories).mockResolvedValue([
      { id: 'cat-1', name: 'Útiles escolares', active: true },
    ]);
    vi.mocked(listProducts).mockResolvedValue({
      items: [
        {
          id: 'p-1',
          name: 'Cuaderno',
          type: 'product',
          price: 1000,
          stock: 5,
          active: true,
          categoryId: 'cat-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      total: 1,
      page: 1,
      limit: 8,
      totalPages: 1,
    });
    renderProductsListPage();

    expect(await screen.findByText('Útiles escolares', { selector: 'div' })).toBeInTheDocument();
  });
});
