import { useQuery } from '@tanstack/react-query';
import {
  listProducts,
  type ListProductsParams,
  type Product,
  type ProductListResponse,
} from '../../api/products';
import { useSyncGate } from '../useSyncGate';
import type { UseAllProductsReturn, FetchError } from './types';

const MAX_LIMIT = 100;
/** Catálogo completo: sync cada 10 min con compuertas abiertas (parámetro aprobado). */
export const ALL_PRODUCTS_SYNC_INTERVAL_MS = 10 * 60 * 1000;

export const ALL_PRODUCTS_QUERY_KEY = ['products', 'all'] as const;

function isFetchError(err: unknown): err is FetchError {
  return typeof err === 'object' && err !== null;
}

function getErrorMessage(err: unknown): string {
  if (isFetchError(err)) {
    return err.response?.data?.message || err.message || 'Error cargando catálogo completo';
  }
  return 'Error cargando catálogo completo';
}

async function fetchAllProducts(): Promise<Product[]> {
  let page = 1;
  let totalPages: number;
  const allProducts: Product[] = [];

  do {
    const params: ListProductsParams = {
      active: true,
      page,
      limit: MAX_LIMIT,
      sortBy: 'name',
      sortOrder: 'asc',
    };
    const data: ProductListResponse = await listProducts(params);
    allProducts.push(...data.items);
    totalPages = data.totalPages;
    page++;
  } while (page <= totalPages);

  return allProducts;
}

/**
 * Catálogo completo — query PERSISTIDA en IndexedDB (arranque instantáneo
 * aunque el backend esté dormido). La cancelación por desmontaje/cambio de
 * contexto la maneja React Query (AbortSignal): se eliminó el manejo manual
 * con refs que existía antes.
 */
export function useAllProducts(): UseAllProductsReturn {
  const syncAllowed = useSyncGate();

  const query = useQuery({
    queryKey: ALL_PRODUCTS_QUERY_KEY,
    queryFn: ({ signal }) => {
      void signal; // listProducts no acepta AbortSignal hoy; RQ igual deduplica y cancela observers
      return fetchAllProducts();
    },
    staleTime: 5 * 60_000,
    refetchInterval: syncAllowed ? ALL_PRODUCTS_SYNC_INTERVAL_MS : false,
    // refetchIntervalInBackground: false (default del client) — jamás en tab oculta.
  });

  return {
    products: query.data ?? [],
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error) : null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
