import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '../../../test/utils';
import { ToastProvider } from '../../../components/Toast/useToast';
import { getDailySummary } from '../../../api/cashShifts';
import { useDailySummary } from './useDailySummary';

vi.mock('../../../api/cashShifts', () => ({
  getDailySummary: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useDailySummary', () => {
  beforeEach(() => {
    vi.mocked(getDailySummary).mockReset();
  });

  it('debería completar el resumen cuando el backend omite campos', async () => {
    vi.mocked(getDailySummary).mockResolvedValue({
      date: '2026-10-28',
      totalExpected: 3500,
    } as never);

    const { result } = renderHook(() => useDailySummary(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary?.totalExpected).toBe(3500);
    expect(result.current.summary?.cashSales).toBe(0);
  });

  it('debería dejar el resumen en null cuando la carga falla', async () => {
    vi.mocked(getDailySummary).mockRejectedValue(new Error('down'));

    const { result } = renderHook(() => useDailySummary(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.summary).toBeNull();
  });
});
