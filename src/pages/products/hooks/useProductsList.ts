import { useEffect, useState, useCallback } from 'react';
import { listProducts, getProductCounts, type Product } from '../../../api/products';

export type TypeFilter = 'all' | 'product' | 'service';
export type SortOption =
  'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

export const SORT_MAP: Record<SortOption, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
  'name-asc': { sortBy: 'name', sortOrder: 'asc' },
  'name-desc': { sortBy: 'name', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
  'stock-asc': { sortBy: 'stock', sortOrder: 'asc' },
  'stock-desc': { sortBy: 'stock', sortOrder: 'desc' },
};

export const SORT_LABELS: Record<SortOption, string> = {
  'name-asc': 'Nombre A-Z',
  'name-desc': 'Nombre Z-A',
  'price-asc': 'Precio (menor)',
  'price-desc': 'Precio (mayor)',
  'stock-asc': 'Stock (menor)',
  'stock-desc': 'Stock (mayor)',
};

export interface ProductsSummary {
  productCount: number;
  serviceCount: number;
  lowStockCount: number;
}

/**
 * useProductsList: encapsula el fetch paginado server-side y los contadores de resumen.
 * Evita setState sincrónico dentro de efectos (regla react-hooks/set-state-in-effect)
 * usando microtasks para el arranque y debounce para el listado.
 */
export function useProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<ProductsSummary>({
    productCount: 0,
    serviceCount: 0,
    lowStockCount: 0,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('name-asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshSummary = useCallback(() => setRefreshTrigger(t => t + 1), []);

  // Summary counts (startup + refresh). queueMicrotask evita setState sincrónico en efecto.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      void getProductCounts()
        .then(counts => {
          if (!cancelled) setSummary(counts);
        })
        .catch(() => {
          if (!cancelled) setSummary({ productCount: 0, serviceCount: 0, lowStockCount: 0 });
        });
    });
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  // Products list (debounced 300ms)
  useEffect(() => {
    const params: Record<string, unknown> = {
      active: true,
      page,
      limit,
      ...SORT_MAP[sort],
    };
    if (search.trim()) params.search = search.trim();
    if (typeFilter !== 'all') params.type = typeFilter;
    if (lowStockOnly) params.lowStock = true;

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      listProducts(params)
        .then(data => {
          if (!cancelled) {
            setProducts(data.items);
            setTotal(data.total);
            setTotalPages(data.totalPages);
            setLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            const message =
              err instanceof Error
                ? `Error cargando productos: ${err.message}`
                : 'Error cargando productos';
            setError(message);
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [page, limit, search, typeFilter, lowStockOnly, sort]);

  const removeProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setTotal(prev => prev - 1);
  }, []);

  return {
    products,
    total,
    totalPages,
    summary,
    page,
    limit,
    search,
    typeFilter,
    lowStockOnly,
    sort,
    loading,
    error,
    setPage,
    setLimit,
    setSearch,
    setTypeFilter,
    setLowStockOnly,
    setSort,
    setError,
    removeProduct,
    refreshSummary,
  };
}
