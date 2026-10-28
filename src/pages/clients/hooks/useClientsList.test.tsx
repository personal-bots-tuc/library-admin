import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, act, waitFor, screen } from '../../../test/utils';
import { ToastProvider } from '../../../components/Toast/useToast';
import { listClients, type Client, type ClientListResponse } from '../../../api/clients';
import { useClientsList } from './useClientsList';

vi.mock('../../../api/clients', () => ({
  listClients: vi.fn(),
}));

const makeClient = (id: string): Client => ({
  id,
  fullName: `Cliente ${id}`,
  dni: `3000${id}`,
  isDefault: false,
  balance: 0,
  active: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
});

const makePage = (items: Client[], total = items.length): ClientListResponse => ({
  items,
  total,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(total / 10) || 1,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

const lastCallParams = () => vi.mocked(listClients).mock.calls.at(-1)?.[0];

describe('useClientsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(listClients).mockResolvedValue(makePage([makeClient('1')], 1));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debería pedir la primera página con 10 elementos al montar', async () => {
    renderHook(() => useClientsList(), { wrapper });

    await waitFor(() => expect(listClients).toHaveBeenCalledWith({ page: 1, limit: 10 }));
  });

  it('debería exponer los clientes y el total devueltos por el servidor', async () => {
    vi.mocked(listClients).mockResolvedValue(makePage([makeClient('1'), makeClient('2')], 25));

    const { result } = renderHook(() => useClientsList(), { wrapper });

    await waitFor(() => expect(result.current.clients).toHaveLength(2));
    expect(result.current.total).toBe(25);
    expect(result.current.totalPages).toBe(3);
  });

  it('debería pedir la página indicada cuando cambia la página', async () => {
    const { result } = renderHook(() => useClientsList(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() => expect(listClients).toHaveBeenLastCalledWith({ page: 2, limit: 10 }));
  });

  it('debería esperar 300 ms antes de buscar y volver a la página 1', async () => {
    const { result } = renderHook(() => useClientsList(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPage(3));

    act(() => result.current.setSearch('ana'));

    expect(lastCallParams()).not.toMatchObject({ search: 'ana' });
    await waitFor(() =>
      expect(listClients).toHaveBeenLastCalledWith({ page: 1, limit: 10, search: 'ana' })
    );
  });

  it('debería enviar hasDebt solo cuando el filtro de deudores está activo', async () => {
    const { result } = renderHook(() => useClientsList(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(lastCallParams()).not.toHaveProperty('hasDebt');

    act(() => result.current.setHasDebt(true));

    await waitFor(() => expect(lastCallParams()).toMatchObject({ hasDebt: true, page: 1 }));
  });

  it('debería descartar la respuesta de una búsqueda anterior que llega tarde', async () => {
    let resolveFirst: (value: ClientListResponse) => void = () => {};
    vi.mocked(listClients)
      .mockReturnValueOnce(new Promise(resolve => (resolveFirst = resolve)))
      .mockResolvedValueOnce(makePage([makeClient('2')], 1));

    const { result } = renderHook(() => useClientsList(), { wrapper });
    act(() => result.current.setSearch('a'));
    await waitFor(() => expect(listClients).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.clients[0]?.id).toBe('2'));

    await act(async () => resolveFirst(makePage([makeClient('1')], 1)));

    expect(result.current.clients[0]?.id).toBe('2');
  });

  it('debería volver a pedir la lista actual cuando se llama refetch', async () => {
    const { result } = renderHook(() => useClientsList(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = vi.mocked(listClients).mock.calls.length;

    act(() => result.current.refetch());

    await waitFor(() => expect(vi.mocked(listClients).mock.calls.length).toBe(callsBefore + 1));
  });

  it('debería mostrar un toast de error y no volver a pedir la lista cuando la carga falla', async () => {
    vi.mocked(listClients).mockRejectedValueOnce(new Error('network down'));

    renderHook(() => useClientsList(), { wrapper });

    expect(await screen.findByText('No se pudieron cargar los clientes')).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(50));
    expect(listClients).toHaveBeenCalledTimes(1);
  });
});
