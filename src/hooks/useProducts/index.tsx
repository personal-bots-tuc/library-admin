import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listProducts, type ListProductsParams } from '../../api/products';
import type { UseProductsReturn, UseProductsOptions, TypeFilter, FilterState } from './types';

const DEFAULT_LIMIT = 8;
const DEFAULT_DEBOUNCE = 300;

const initialFilterState: FilterState = {
  search: '',
  typeFilter: 'all',
  lowStockOnly: false,
  categoryId: null,
  sortBy: 'name',
  sortOrder: 'asc',
};

function buildApiParams(filter: FilterState, page: number, limit: number): ListProductsParams {
  const params: ListProductsParams = {
    active: true,
    page,
    limit,
    sortBy: filter.sortBy,
    sortOrder: filter.sortOrder,
  };

  if (filter.search.trim()) params.search = filter.search.trim();
  if (filter.typeFilter !== 'all') params.type = filter.typeFilter;
  if (filter.lowStockOnly) params.lowStock = true;
  if (filter.categoryId) params.categoryId = filter.categoryId;

  return params;
}

function createInitialFilter(initialParams: UseProductsOptions['initialParams']): FilterState {
  const p = initialParams ?? {};
  return {
    ...initialFilterState,
    search: p.search ?? '',
    typeFilter: p.type ?? 'all',
    lowStockOnly: p.lowStock ?? false,
    sortBy: p.sortBy ?? 'name',
    sortOrder: p.sortOrder ?? 'asc',
  };
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  } else if (err instanceof Error) {
    return err.message;
  }
  return 'Error cargando productos';
}

/** Estado de filtros + paginación con sus setters (extraído para mantener baja
 *  la complejidad del hook público). */
function useProductsState(initialParams: UseProductsOptions['initialParams']) {
  const [filter, setFilter] = useState<FilterState>(() => createInitialFilter(initialParams));
  const [page, setPage] = useState(initialParams?.page ?? 1);
  const [limit, setLimitState] = useState(initialParams?.limit ?? DEFAULT_LIMIT);

  const patchFilter = (patch: Partial<FilterState>) => {
    setFilter(prev => ({ ...prev, ...patch }));
    setPage(1);
  };

  return {
    filter,
    page,
    limit,
    goToPage: (newPage: number, totalPages: number) => {
      setPage(Math.max(1, Math.min(newPage, totalPages || 1)));
    },
    setLimit: (newLimit: number) => {
      setLimitState(newLimit);
      setPage(1);
    },
    setSearch: (search: string) => patchFilter({ search }),
    setTypeFilter: (typeFilter: TypeFilter) => patchFilter({ typeFilter }),
    setLowStockOnly: (lowStockOnly: boolean) => patchFilter({ lowStockOnly }),
    setCategoryId: (categoryId: string | null) => patchFilter({ categoryId }),
    setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => patchFilter({ sortBy, sortOrder }),
  };
}

/** Debounce del texto de búsqueda antes de componer la queryKey. */
function useDebouncedSearch(search: string, debounceMs: number): string {
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);
  return debouncedSearch;
}

/**
 * Listado paginado de productos — migrado a React Query:
 * - cache compartido por clave de parámetros (volver a un filtro ya visto es
 *   instantáneo y no repite request dentro del staleTime)
 * - la búsqueda mantiene su debounce antes de tocar el servidor
 * - placeholderData conserva la página anterior durante transiciones
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { initialParams, debounceMs } = options;
  const state = useProductsState(initialParams);
  const debouncedSearch = useDebouncedSearch(state.filter.search, debounceMs ?? DEFAULT_DEBOUNCE);

  const params = buildApiParams(
    { ...state.filter, search: debouncedSearch },
    state.page,
    state.limit
  );

  const query = useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () => listProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  const totalPages = query.data?.totalPages ?? 1;

  return {
    products: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages,
    page: state.page,
    limit: state.limit,
    loading: query.isPending,
    error: query.error ? extractErrorMessage(query.error) : null,
    setPage: (newPage: number) => state.goToPage(newPage, totalPages),
    setLimit: state.setLimit,
    setSearch: state.setSearch,
    setTypeFilter: state.setTypeFilter,
    setLowStockOnly: state.setLowStockOnly,
    setCategoryId: state.setCategoryId,
    setSort: state.setSort,
    refetch: async () => {
      await query.refetch();
    },
  };
}
