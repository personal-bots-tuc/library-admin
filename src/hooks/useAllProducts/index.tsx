import { useState, useEffect, useCallback, useRef } from "react";
import { listProducts, type ListProductsParams, type Product, type ProductListResponse } from "../../api/products";
import type { UseAllProductsReturn, FetchError } from "./types";

const MAX_LIMIT = 100;

function isFetchError(err: unknown): err is FetchError {
  return typeof err === "object" && err !== null;
}

function isAbortError(err: unknown): boolean {
  return isFetchError(err) && err.name === "AbortError";
}

function getErrorMessage(err: unknown): string {
  if (isFetchError(err)) {
    return err.response?.data?.message || err.message || "Error cargando catálogo completo";
  }
  return "Error cargando catálogo completo";
}

export function useAllProducts(): UseAllProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMountRef = useRef(true);

  const fetchPage = useCallback(
    async (page: number): Promise<{ items: Product[]; totalPages: number }> => {
      const params: ListProductsParams = {
        active: true,
        page,
        limit: MAX_LIMIT,
        sortBy: "name",
        sortOrder: "asc",
      };
      const data: ProductListResponse = await listProducts(params);
      return { items: data.items, totalPages: data.totalPages };
    },
    []
  );

  const fetchAll = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    cancelledRef.current = false;
    setLoading(true);
    setError(null);
    setProducts([]);

    try {
      let page = 1;
      let totalPages = 1;
      const allProducts: Product[] = [];

      do {
        if (cancelledRef.current) break;

        const { items, totalPages: pages } = await fetchPage(page);

        if (cancelledRef.current) break;

        allProducts.push(...items);
        totalPages = pages;
        page++;
      } while (page <= totalPages);

      if (!cancelledRef.current) {
        setProducts(allProducts);
      }
    } catch (err: unknown) {
      if (!cancelledRef.current && !isAbortError(err)) {
        setError(getErrorMessage(err));
        setProducts([]);
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  }, [fetchPage]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      fetchAll();
    }

    return () => {
      cancelledRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAll]);

  const refetch = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  return {
    products,
    loading,
    error,
    refetch,
  };
}