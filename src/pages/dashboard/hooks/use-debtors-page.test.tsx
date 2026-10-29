import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { getHookWrapper } from '../../../test/utils';
import * as creditsApi from '../../../api/credits';
import { useDebtorsPage } from './use-debtors-page';

vi.mock('../../../api/credits');

const mockListCredits = vi.mocked(creditsApi.listCredits);

const response = (pageNumber: number) => ({
  items: [
    {
      client: { id: `c${pageNumber}`, fullName: 'Ana Pérez', dni: '30111222', balance: 900 },
      balance: 900,
    },
  ],
  total: 12,
  page: pageNumber,
  limit: 10,
  totalPages: 2,
  summary: { totalOutstanding: 5000, overdueCount: 0, overdueAmount: 0 },
});

describe('useDebtorsPage', () => {
  beforeEach(() => {
    mockListCredits.mockReset();
  });

  it('debería pedir los deudores por saldo descendente de la primera página cuando se monta', async () => {
    mockListCredits.mockResolvedValue(response(1));

    const { result } = renderHook(() => useDebtorsPage(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockListCredits).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      sortBy: 'balance',
      sortOrder: 'desc',
    });
  });

  it('debería exponer las filas y el total cuando la API responde', async () => {
    mockListCredits.mockResolvedValue(response(1));

    const { result } = renderHook(() => useDebtorsPage(), { wrapper: getHookWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.rows).toEqual([
      { id: 'c1', fullName: 'Ana Pérez', dni: '30111222', balance: 900 },
    ]);
    expect(result.current.total).toBe(12);
  });

  it('debería pedir la página nueva cuando cambia la página', async () => {
    mockListCredits.mockImplementation(async params => response(params?.page ?? 1));
    const { result } = renderHook(() => useDebtorsPage(), { wrapper: getHookWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setPage(2));

    await waitFor(() => expect(result.current.rows[0]?.id).toBe('c2'));
  });
});
