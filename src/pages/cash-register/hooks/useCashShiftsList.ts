import { useCallback, useEffect, useState } from 'react';
import {
  listCashShifts,
  type CashShiftItem,
  type ListCashShiftsParams,
} from '../../../api/cashShifts';
import { useToast } from '../../../components/Toast/useToast';
import { endOfDayIso, startOfDayIso } from '../utils/dateRange';
import { getShiftStatusParams } from '../utils/shiftTabs';
import type { CashRegisterTab, ShiftFilters } from '../types';

export const CASH_SHIFTS_PAGE_SIZE = 20;

export const EMPTY_SHIFT_FILTERS: ShiftFilters = { fromDate: '', toDate: '', sellerId: '' };

export const buildShiftsListParams = (
  tab: CashRegisterTab,
  filters: ShiftFilters,
  page: number
): ListCashShiftsParams => {
  const params: ListCashShiftsParams = {
    page,
    limit: CASH_SHIFTS_PAGE_SIZE,
    sortBy: 'openedAt',
    sortOrder: 'desc',
    ...getShiftStatusParams(tab),
  };
  const fromDate = startOfDayIso(filters.fromDate);
  const toDate = endOfDayIso(filters.toDate);
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (filters.sellerId) params.sellerId = filters.sellerId;
  return params;
};

export const useCashShiftsList = () => {
  const { error: showError } = useToast();
  const [tab, setTabValue] = useState<CashRegisterTab>('closed');
  const [filters, setFilters] = useState<ShiftFilters>(EMPTY_SHIFT_FILTERS);
  const [page, setPage] = useState(1);
  const [shifts, setShifts] = useState<CashShiftItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const isShiftsTab = tab !== 'movements';

  useEffect(() => {
    if (!isShiftsTab) return;
    let stale = false;

    async function fetchShifts() {
      setLoading(true);
      try {
        const result = await listCashShifts(buildShiftsListParams(tab, filters, page));
        if (stale) return;
        setShifts(result.items ?? []);
        setTotal(result.total ?? 0);
      } catch {
        if (stale) return;
        setShifts([]);
        setTotal(0);
        showError('No se pudieron cargar los turnos');
      } finally {
        if (!stale) setLoading(false);
      }
    }

    fetchShifts();
    return () => {
      stale = true;
    };
  }, [isShiftsTab, tab, filters, page, reloadKey, showError]);

  const setTab = useCallback((value: CashRegisterTab) => {
    setTabValue(value);
    setPage(1);
  }, []);

  const updateFilters = useCallback((patch: Partial<ShiftFilters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const refetch = useCallback(() => setReloadKey(key => key + 1), []);

  return {
    tab,
    setTab,
    filters,
    updateFilters,
    shifts,
    total,
    totalPages: Math.max(1, Math.ceil(total / CASH_SHIFTS_PAGE_SIZE)),
    page,
    setPage,
    pageSize: CASH_SHIFTS_PAGE_SIZE,
    loading,
    refetch,
  };
};
