import { useState, useCallback, useMemo } from "react";
import type { Product } from "../../../../api/products";
import type { UsePriceLabelsSelectionReturn } from "../types";

export type { UsePriceLabelsSelectionReturn } from "../types";

export function usePriceLabelsSelection(): UsePriceLabelsSelectionReturn {
  const [selected, setSelected] = useState<Map<string, number>>(new Map());

  const totalLabels = useMemo(() => {
    let total = 0;
    selected.forEach((qty) => { total += qty; });
    return total;
  }, [selected]);

  const toggleProduct = useCallback((product: Product) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, 1);
      }
      return next;
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(productId);
      } else {
        next.set(productId, qty);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Map());
  }, []);

  const isSelected = useCallback((productId: string) => {
    return selected.has(productId);
  }, [selected]);

  const getQty = useCallback((productId: string) => {
    return selected.get(productId) ?? 1;
  }, [selected]);

  return {
    selected,
    totalLabels,
    toggleProduct,
    setQty,
    clearSelection,
    isSelected,
    getQty,
  };
}