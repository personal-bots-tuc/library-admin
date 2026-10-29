import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getApiErrorMessage } from '../../../lib/apiError';
import { MODAL_PAGE_SIZE } from '../constants';
import type { PagedRows } from './types';

const LOAD_ERROR = 'No se pudo cargar la lista';

export function usePagedQuery<T, R>(
  key: string,
  fetchPage: (page: number) => Promise<{ items: T[]; total: number }>,
  toRow: (item: T) => R
): PagedRows<R> {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ['dashboard', key, page],
    queryFn: () => fetchPage(page),
    placeholderData: keepPreviousData,
    // El overview se pide fresco en cada carga; sin esto, reabrir el modal mostraría datos de hasta 60s atrás.
    staleTime: 0,
  });
  const total = query.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / MODAL_PAGE_SIZE));

  // Si el total se achicó (p. ej. refetch al volver a la pestaña), la página actual puede quedar vacía.
  if (query.isSuccess && !query.isPlaceholderData && page > lastPage) {
    setPage(lastPage);
  }

  return {
    rows: query.data?.items.map(toRow) ?? [],
    total,
    page,
    setPage,
    loading: query.isPending,
    error: query.error ? getApiErrorMessage(query.error, LOAD_ERROR) : null,
    retry: () => void query.refetch(),
  };
}
