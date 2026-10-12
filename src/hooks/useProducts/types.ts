import type { Product, ListProductsParams } from "../../api/products";

export type TypeFilter = "all" | "product" | "service";

export interface UseProductsState {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UseProductsActions {
  setPage: (_page: number) => void;
  setLimit: (_limit: number) => void;
  setSearch: (_search: string) => void;
  setTypeFilter: (_type: TypeFilter) => void;
  setLowStockOnly: (_lowStock: boolean) => void;
  setSort: (_sortBy: string, _sortOrder: "asc" | "desc") => void;
  refetch: () => Promise<void>;
}

export type UseProductsReturn = UseProductsState & UseProductsActions;

export interface UseProductsOptions {
  initialParams?: Partial<Omit<ListProductsParams, "type">> & { type?: TypeFilter };
  debounceMs?: number;
}

// Tipos internos del hook (no exportados públicamente)
export interface ProductsState {
  products: Product[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
}

export interface FilterState {
  search: string;
  typeFilter: TypeFilter;
  lowStockOnly: boolean;
  sortBy: string;
  sortOrder: "asc" | "desc";
}