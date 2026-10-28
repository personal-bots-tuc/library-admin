import { useCallback, useEffect, useState } from 'react';
import {
  getCashMovementsAggregated,
  listCashMovements,
  type CashMovementAggregated,
  type CashMovementCategory,
  type CashMovementItem,
  type CashMovementType,
} from '../../../api/cashMovements';
import { useToast } from '../../../components/Toast/useToast';
import { buildMovementsParams } from '../utils/movementsParams';

export const CASH_MOVEMENTS_PAGE_SIZE = 20;

interface UseCashMovementsListOptions {
  cashShiftId?: string;
}

export const useCashMovementsList = ({ cashShiftId }: UseCashMovementsListOptions = {}) => {
  const { error: showError } = useToast();
  const [type, setType] = useState<CashMovementType | undefined>(undefined);
  const [category, setCategory] = useState<CashMovementCategory | undefined>(undefined);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [movements, setMovements] = useState<CashMovementItem[]>([]);
  const [total, setTotal] = useState(0);
  const [aggregated, setAggregated] = useState<CashMovementAggregated | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let stale = false;

    async function fetchMovements() {
      setLoading(true);
      const params = buildMovementsParams({
        page,
        pageSize: CASH_MOVEMENTS_PAGE_SIZE,
        cashShiftId,
        type,
        category,
        fromDate,
        toDate,
      });
      try {
        const result = await listCashMovements(params);
        if (stale) return;
        setMovements(result.items ?? []);
        setTotal(result.total ?? 0);
      } catch {
        if (stale) return;
        setMovements([]);
        setTotal(0);
        showError('No se pudieron cargar los movimientos');
      } finally {
        if (!stale) setLoading(false);
      }
    }

    fetchMovements();
    return () => {
      stale = true;
    };
  }, [cashShiftId, type, category, fromDate, toDate, page, reloadKey, showError]);

  useEffect(() => {
    if (!cashShiftId) return;
    let stale = false;

    getCashMovementsAggregated(cashShiftId)
      .then(result => {
        if (!stale) setAggregated(result);
      })
      .catch(() => {
        if (!stale) setAggregated(null);
      });

    return () => {
      stale = true;
    };
  }, [cashShiftId, reloadKey]);

  const setTypeFilter = useCallback((value: CashMovementType | undefined) => {
    setType(value);
    setPage(1);
  }, []);

  const setCategoryFilter = useCallback((value: CashMovementCategory | undefined) => {
    setCategory(value);
    setPage(1);
  }, []);

  const setDateRange = useCallback((from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    setPage(1);
  }, []);

  const refetch = useCallback(() => setReloadKey(key => key + 1), []);

  return {
    movements,
    total,
    totalPages: Math.max(1, Math.ceil(total / CASH_MOVEMENTS_PAGE_SIZE)),
    page,
    setPage,
    pageSize: CASH_MOVEMENTS_PAGE_SIZE,
    loading,
    aggregated,
    type,
    setTypeFilter,
    category,
    setCategoryFilter,
    fromDate,
    toDate,
    setDateRange,
    refetch,
  };
};
