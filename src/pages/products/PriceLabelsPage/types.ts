import type { CategoryOption } from '../types';

export type PresetOption = '10' | '20' | '30';

export interface LabelPreset {
  cols: number;
  rows: number;
  labelWidth: number; // mm
  labelHeight: number; // mm
}

/** Producto tal como lo necesita Preciero. Tipo local: no depende de api/. */
export interface PriceLabelProduct {
  id: string;
  name: string;
  code?: string | null;
  price: number;
  stock: number;
  type: 'product' | 'service';
  categoryId?: string | null;
}

export interface SelectableItem {
  id: string;
}

export interface PriceLabelsSelectionState {
  selected: Map<string, number>; // productId -> qty
  totalLabels: number;
}

export interface PriceLabelsActions {
  toggleProduct: (item: SelectableItem) => void;
  setQty: (productId: string, qty: number) => void;
  clearSelection: () => void;
  /** Marca todos los items sin tocar los ya seleccionados (ni su cantidad). */
  selectMany: (items: SelectableItem[]) => void;
  deselectMany: (ids: string[]) => void;
  /** Quita de la selección los ids que ya no existen en el catálogo. */
  pruneTo: (ids: string[]) => void;
  isSelected: (productId: string) => boolean;
  getQty: (productId: string) => number;
}

export type UsePriceLabelsSelectionReturn = PriceLabelsSelectionState & PriceLabelsActions;

export interface PriceLabelsTableProps {
  products: PriceLabelProduct[];
  categories: CategoryOption[];
  selection: UsePriceLabelsSelectionReturn;
}
