import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useProducts } from './index';
import { getHookWrapper } from '../../test/utils';
import * as productsApi from '../../api/products';

vi.mock('../../api/products');

const mockListProducts = vi.mocked(productsApi.listProducts);

import type { Product } from '../../api/products';

const createMockResponse = (
  overrides: Partial<{
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> = {}
) =>
  Promise.resolve({
    items: [
      {
        id: '1',
        name: 'Producto A',
        type: 'product' as const,
        price: 100,
        stock: 10,
        active: true,
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        name: 'Producto B',
        type: 'service' as const,
        price: 200,
        stock: 0,
        active: true,
        createdAt: '',
        updatedAt: '',
      },
    ],
    total: 20,
    page: 1,
    limit: 8,
    totalPages: 3,
    ...overrides,
  });

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListProducts.mockImplementation(() => createMockResponse());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('debería cargar productos iniciales al montar', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(2);
    expect(result.current.total).toBe(20);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.error).toBeNull();
    expect(productsApi.listProducts).toHaveBeenCalledWith(
      expect.objectContaining({ active: true, page: 1, limit: 8 })
    );
  });

  it('debería cambiar página y recargar', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setPage(2);
    });

    // Dar tiempo al debounce (300ms) + fetch
    await act(async () => {
      await new Promise(r => setTimeout(r, 500));
    });

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 1000 });
    await waitFor(() => expect(result.current.page).toBe(2), { timeout: 1000 });

    expect(productsApi.listProducts).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
  });

  it('debería debouncear búsqueda (300ms)', async () => {
    const { result } = renderHook(() => useProducts({ debounceMs: 300 }), {
      wrapper: getHookWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearch('test');
    });

    // Dar tiempo al debounce + fetch
    await act(async () => {
      await new Promise(r => setTimeout(r, 500));
    });

    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 1000 });

    expect(productsApi.listProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test', page: 1 })
    );
  });

  it('debería resetear página a 1 al cambiar filtros', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setPage(3);
    });

    await waitFor(() => expect(result.current.page).toBe(3));

    act(() => {
      result.current.setSearch('nuevo');
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.page).toBe(1);
  });

  it('debería manejar errores de API', async () => {
    mockListProducts.mockRejectedValueOnce({
      response: { data: { message: 'Error de servidor' } },
    });

    const { result } = renderHook(() => useProducts(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Error de servidor');
    expect(result.current.products).toHaveLength(0);
  });

  it('debería limpiar búsqueda y resetear página', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearch('algo');
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearch('');
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.page).toBe(1);
  });

  it('debería permitir refetch manual', async () => {
    const { result } = renderHook(() => useProducts(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialCallCount = mockListProducts.mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockListProducts.mock.calls.length).toBe(initialCallCount + 1);
  });
});
