import type { Product, ListProductsParams } from "../../api/products";

/** Filter type for product listing */
export type TypeFilter = "all" | "product" | "service";

/** State returned by useProducts hook */
export interface UseProductsState {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

/** Actions returned by useProducts hook */
export interface UseProductsActions {
  setPage: (_page: number) => void;
  setLimit: (_limit: number) => void;
  setSearch: (_search: string) => void;
  setTypeFilter: (_type: TypeFilter) => void;
  setLowStockOnly: (_lowStock: boolean) => void;
  setCategoryId: (_categoryId: string | null) => void;
  setSort: (_sortBy: string, _sortOrder: "asc" | "desc") => void;
  refetch: () => Promise<void>;
}

/** Combined return type for useProducts hook */
export type UseProductsReturn = UseProductsState & UseProductsActions;

/** Configuration options for useProducts hook */
export interface UseProductsOptions {
  initialParams?: Partial<Omit<ListProductsParams, "type">> & { type?: TypeFilter };
  debounceMs?: number;
}

/** Internal state type for useProducts hook (not exported publicly) */
export interface ProductsState {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

/** Internal filter state type for useProducts hook (not exported publicly) */
export interface FilterState {
  search: string;
  typeFilter: TypeFilter;
  lowStockOnly: boolean;
  categoryId?: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}