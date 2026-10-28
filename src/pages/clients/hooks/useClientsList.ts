import { useCallback, useEffect, useRef, useState } from 'react';
import { listClients, type Client, type ListClientsParams } from '../../../api/clients';
import { useToast } from '../../../components/Toast/useToast';

export const CLIENTS_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export const useClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [hasDebt, setHasDebtValue] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { error: showError } = useToast();

  useEffect(() => {
    let stale = false;

    async function fetchClients() {
      setLoading(true);
      const params: ListClientsParams = { page, limit: CLIENTS_PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      if (hasDebt) params.hasDebt = true;

      try {
        const result = await listClients(params);
        if (stale) return;
        setClients(result.items || []);
        setTotal(result.total);
      } catch {
        if (!stale) showError('No se pudieron cargar los clientes');
      } finally {
        if (!stale) setLoading(false);
      }
    }

    fetchClients();
    return () => {
      stale = true;
    };
  }, [page, debouncedSearch, hasDebt, reloadKey, showError]);

  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const setHasDebt = useCallback((value: boolean) => {
    setHasDebtValue(value);
    setPage(1);
  }, []);

  const refetch = useCallback(() => setReloadKey(key => key + 1), []);

  return {
    clients,
    total,
    totalPages: Math.max(1, Math.ceil(total / CLIENTS_PAGE_SIZE)),
    page,
    pageSize: CLIENTS_PAGE_SIZE,
    loading,
    search,
    setSearch,
    hasDebt,
    setHasDebt,
    setPage,
    refetch,
  };
};
