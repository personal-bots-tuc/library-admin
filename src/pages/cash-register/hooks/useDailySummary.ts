import { useCallback, useEffect, useState } from 'react';
import { getDailySummary, type DailySummary } from '../../../api/cashShifts';
import { useToast } from '../../../components/Toast/useToast';
import { normalizeDailySummary } from '../utils/summary';

export const useDailySummary = () => {
  const { error: showError } = useToast();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let stale = false;

    async function fetchSummary() {
      setLoading(true);
      try {
        const result = await getDailySummary();
        if (!stale) setSummary(normalizeDailySummary(result));
      } catch {
        if (!stale) showError('No se pudo cargar el resumen diario');
      } finally {
        if (!stale) setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      stale = true;
    };
  }, [reloadKey, showError]);

  const refetch = useCallback(() => setReloadKey(key => key + 1), []);

  return { summary, loading, refetch };
};
