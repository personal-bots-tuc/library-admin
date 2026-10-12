import type { Product } from "../../api/products";

export interface UseAllProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export interface UseAllProductsActions {
  refetch: () => Promise<void>;
}

export type UseAllProductsReturn = UseAllProductsState & UseAllProductsActions;

// Tipos internos del hook
export interface FetchError {
  response?: { data?: { message?: string } };
  message?: string;
  name?: string;
}