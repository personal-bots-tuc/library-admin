import { useState, useEffect, useCallback, useRef } from "react";
import { listProducts, type ListProductsParams, type ProductListResponse } from "../../api/products";
import type { UseProductsReturn, UseProductsOptions, TypeFilter, ProductsState, FilterState } from "./types";

const DEFAULT_LIMIT = 8;
const DEFAULT_DEBOUNCE = 300;

const initialFilterState: FilterState = {
  search: "",
  typeFilter: "all",
  lowStockOnly: false,
  sortBy: "name",
  sortOrder: "asc",
};

function buildApiParams(
  filter: FilterState,
  page: number,
  limit: number
): ListProductsParams {
  const params: ListProductsParams = {
    active: true,
    page,
    limit,
    sortBy: filter.sortBy,
    sortOrder: filter.sortOrder,
  };

  if (filter.search.trim()) params.search = filter.search.trim();
  if (filter.typeFilter !== "all") params.type = filter.typeFilter;
  if (filter.lowStockOnly) params.lowStock = true;

  return params;
}

function createInitialState(initialParams: UseProductsOptions["initialParams"]): ProductsState {
  return {
    products: [],
    total: 0,
    totalPages: 1,
    page: initialParams?.page ?? 1,
    limit: initialParams?.limit ?? DEFAULT_LIMIT,
    loading: true,
    error: null,
  };
}

function createInitialFilter(initialParams: UseProductsOptions["initialParams"]): FilterState {
  const p = initialParams ?? {};
  return {
    ...initialFilterState,
    search: p.search ?? "",
    typeFilter: p.type ?? "all",
    lowStockOnly: p.lowStock ?? false,
    sortBy: p.sortBy ?? "name",
    sortOrder: p.sortOrder ?? "asc",
  };
}

function extractErrorMessage(err: unknown): string {
  let message = "Error cargando productos";
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      message = response.data.message;
    }
  } else if (err instanceof Error) {
    message = err.message;
  }
  return message;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { initialParams = {}, debounceMs = DEFAULT_DEBOUNCE } = options;

  const [state, setState] = useState<ProductsState>(() => createInitialState(initialParams));
  const [filter, setFilter] = useState<FilterState>(() => createInitialFilter(initialParams));

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const fetchProducts = useCallback(async (params: ListProductsParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data: ProductListResponse = await listProducts(params);
      if (!cancelledRef.current) {
        setState(prev => ({
          ...prev,
          products: data.items,
          total: data.total,
          totalPages: data.totalPages,
          loading: false,
        }));
      }
    } catch (err: unknown) {
      if (!cancelledRef.current) {
        const message = extractErrorMessage(err);
        setState(prev => ({
          ...prev,
          error: message,
          products: [],
          total: 0,
          totalPages: 1,
          loading: false,
        }));
      }
    }
  }, []);

  // Efecto principal con debounce
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    cancelledRef.current = false;

    debounceTimerRef.current = setTimeout(() => {
      fetchProducts(buildApiParams(filter, state.page, state.limit));
    }, debounceMs);

    return () => {
      cancelledRef.current = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filter, state.page, state.limit, fetchProducts, debounceMs]);

  // Acciones
  const setPage = useCallback((newPage: number) => {
    setState(prev => ({
      ...prev,
      page: Math.max(1, Math.min(newPage, prev.totalPages || 1)),
    }));
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setState(prev => ({ ...prev, limit: newLimit, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilter(prev => ({ ...prev, search }));
    setState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setTypeFilter = useCallback((typeFilter: TypeFilter) => {
    setFilter(prev => ({ ...prev, typeFilter }));
    setState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setLowStockOnly = useCallback((lowStockOnly: boolean) => {
    setFilter(prev => ({ ...prev, lowStockOnly }));
    setState(prev => ({ ...prev, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: "asc" | "desc") => {
    setFilter(prev => ({ ...prev, sortBy, sortOrder }));
    setState(prev => ({ ...prev, page: 1 }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchProducts(buildApiParams(filter, state.page, state.limit));
  }, [fetchProducts, filter, state.page, state.limit]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    products: state.products,
    total: state.total,
    totalPages: state.totalPages,
    page: state.page,
    limit: state.limit,
    loading: state.loading,
    error: state.error,
    setPage,
    setLimit,
    setSearch,
    setTypeFilter,
    setLowStockOnly,
    setSort,
    refetch,
  };
}