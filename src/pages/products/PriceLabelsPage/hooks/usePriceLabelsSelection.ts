import { useState, useCallback, useMemo } from 'react';
import type { SelectableItem, UsePriceLabelsSelectionReturn } from '../types';

const MAX_QTY_PER_PRODUCT = 999;

export type { UsePriceLabelsSelectionReturn } from '../types';

export function usePriceLabelsSelection(): UsePriceLabelsSelectionReturn {
  const [selected, setSelected] = useState<Map<string, number>>(new Map());

  const totalLabels = useMemo(() => {
    let total = 0;
    selected.forEach(qty => {
      total += qty;
    });
    return total;
  }, [selected]);

  const toggleProduct = useCallback((item: SelectableItem) => {
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.set(item.id, 1);
      }
      return next;
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setSelected(prev => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(productId);
      } else {
        next.set(productId, Math.min(qty, MAX_QTY_PER_PRODUCT));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Map());
  }, []);

  const selectMany = useCallback((items: SelectableItem[]) => {
    setSelected(prev => {
      const next = new Map(prev);
      for (const item of items) {
        if (!next.has(item.id)) next.set(item.id, 1);
      }
      return next;
    });
  }, []);

  const deselectMany = useCallback((ids: string[]) => {
    setSelected(prev => {
      const next = new Map(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  const pruneTo = useCallback((ids: string[]) => {
    setSelected(prev => {
      const keep = new Set(ids);
      const hasStale = [...prev.keys()].some(id => !keep.has(id));
      if (!hasStale) return prev;
      return new Map([...prev].filter(([id]) => keep.has(id)));
    });
  }, []);

  const isSelected = useCallback(
    (productId: string) => {
      return selected.has(productId);
    },
    [selected]
  );

  const getQty = useCallback(
    (productId: string) => {
      return selected.get(productId) ?? 1;
    },
    [selected]
  );

  return {
    selected,
    totalLabels,
    toggleProduct,
    setQty,
    clearSelection,
    selectMany,
    deselectMany,
    pruneTo,
    isSelected,
    getQty,
  };
}
