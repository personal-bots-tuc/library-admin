import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient, getHookWrapper } from '../../../test/utils';
import * as productsApi from '../../../api/products';
import { useLowStockPage } from './use-low-stock-page';

vi.mock('../../../api/products');

const mockListProducts = vi.mocked(productsApi.listProducts);

const page = (pageNumber: number, total = 15) => ({
  items: [
    {
      id: `p${pageNumber}`,
      name: `Producto ${pageNumber}`,
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

describe('useLowStockPage', () => {
  beforeEach(() => {
    mockListProducts.mockReset();
  });

  it('debería pedir productos activos con stock bajo de la primera página cuando se monta', async () => {
    mockListProducts.mockResolvedValue(page(1));

    const { result } = renderHook(() => useLowStockPage(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockListProducts).toHaveBeenCalledWith({
      lowStock: true,
      active: true,
      type: 'product',
      page: 1,
      limit: 10,
      sortBy: 'stock',
      sortOrder: 'asc',
    });
  });

  it('debería exponer las filas y el total cuando la API responde', async () => {
    mockListProducts.mockResolvedValue(page(1));

    const { result } = renderHook(() => useLowStockPage(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([{ id: 'p1', name: 'Producto 1', stock: 1, minStock: 5 }]);
    expect(result.current.total).toBe(15);
  });

  it('debería pedir la página nueva cuando cambia la página', async () => {
    mockListProducts.mockImplementation(async params => page(params.page ?? 1));
    const { result } = renderHook(() => useLowStockPage(), { wrapper: getHookWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() => expect(result.current.rows[0]?.id).toBe('p2'));
  });

  it('debería volver a la última página válida cuando el total se achica', async () => {
    mockListProducts.mockImplementation(async params =>
      params.page === 3 ? { ...page(3, 15), items: [] } : page(params.page ?? 1, 25)
    );
    const { result } = renderHook(() => useLowStockPage(), { wrapper: getHookWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(3));

    await waitFor(() => expect(result.current.page).toBe(2));
    expect(mockListProducts).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('debería volver a pedir la lista cuando el modal se reabre aunque el caché siga fresco', async () => {
    mockListProducts.mockResolvedValue(page(1));
    const client = createTestQueryClient();
    client.setDefaultOptions({
      queries: { ...client.getDefaultOptions().queries, staleTime: 60_000 },
    });
    const first = renderHook(() => useLowStockPage(), { wrapper: getHookWrapper(client) });
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    first.unmount();

    renderHook(() => useLowStockPage(), { wrapper: getHookWrapper(client) });

    await waitFor(() => expect(mockListProducts).toHaveBeenCalledTimes(2));
  });

  it('debería exponer el mensaje del backend cuando la API falla', async () => {
    mockListProducts.mockRejectedValue({ response: { data: { message: 'Sin permisos' } } });

    const { result } = renderHook(() => useLowStockPage(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.error).toBe('Sin permisos'));
  });

  it('debería usar un mensaje genérico cuando el error no trae mensaje del backend', async () => {
    mockListProducts.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useLowStockPage(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.error).toBe('No se pudo cargar la lista'));
  });
});
