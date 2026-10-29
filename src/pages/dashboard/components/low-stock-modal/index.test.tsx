import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen } from '../../../../test/utils';
import * as productsApi from '../../../../api/products';
import { LowStockModal } from './index';

vi.mock('../../../../api/products');

const mockListProducts = vi.mocked(productsApi.listProducts);

const page = (pageNumber: number, total = 15) => ({
  items:
    total === 0
      ? []
      : [
          {
            id: `p${pageNumber}`,
            name: `Producto página ${pageNumber}`,
            type: 'product' as const,
            price: 100,
            stock: 1,
            minStock: 5,
            active: true,
            createdAt: '',
            updatedAt: '',
          },
        ],
  total,
  page: pageNumber,
  limit: 10,
  totalPages: Math.ceil(total / 10),
});

describe('LowStockModal', () => {
  beforeEach(() => {
    mockListProducts.mockReset();
    mockListProducts.mockImplementation(async params => page(params.page ?? 1));
  });

  it('debería mostrar el título y la primera página cuando se abre', async () => {
    renderWithAdminProviders(<LowStockModal onClose={vi.fn()} />);

    expect(screen.getByText('Productos con stock bajo')).toBeInTheDocument();
    expect(await screen.findByText('Producto página 1')).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('debería mostrar la segunda página cuando se toca "Siguiente"', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<LowStockModal onClose={vi.fn()} />);
    await screen.findByText('Producto página 1');

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(await screen.findByText('Producto página 2')).toBeInTheDocument();
  });

  it('debería mostrar el mensaje de vacío cuando no hay productos con stock bajo', async () => {
    mockListProducts.mockResolvedValue(page(1, 0));
    renderWithAdminProviders(<LowStockModal onClose={vi.fn()} />);

    expect(await screen.findByText('No hay productos con stock bajo')).toBeInTheDocument();
  });

  it('debería mostrar el error sin el mensaje de vacío cuando la carga falla', async () => {
    mockListProducts.mockRejectedValue({ response: { data: { message: 'Sin permisos' } } });
    renderWithAdminProviders(<LowStockModal onClose={vi.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Sin permisos');
    expect(screen.queryByText('No hay productos con stock bajo')).not.toBeInTheDocument();
  });

  it('debería volver a pedir la página cuando se toca "Reintentar" tras un error', async () => {
    const user = userEvent.setup();
    mockListProducts.mockRejectedValueOnce(new Error('Network Error'));
    renderWithAdminProviders(<LowStockModal onClose={vi.fn()} />);

    await user.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Producto página 1')).toBeInTheDocument();
  });

  it('debería llamar onClose cuando se toca el botón Cerrar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithAdminProviders(<LowStockModal onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debería llamar onClose cuando se presiona Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithAdminProviders(<LowStockModal onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
