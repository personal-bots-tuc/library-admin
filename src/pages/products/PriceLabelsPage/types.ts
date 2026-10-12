import type { Product } from "../../../api/products";

export interface PriceLabelsProduct extends Product {
  qty: number;
}

export interface PriceLabelsSelectionState {
  selected: Map<string, number>; // productId -> qty
  totalLabels: number;
}

export interface PriceLabelsActions {
  toggleProduct: (product: Product) => void;
  setQty: (productId: string, qty: number) => void;
  clearSelection: () => void;
  isSelected: (productId: string) => boolean;
  getQty: (productId: string) => number;
}

export type UsePriceLabelsSelectionReturn = PriceLabelsSelectionState & PriceLabelsActions;

export type PresetOption = "10" | "20" | "30";

export interface LabelPreset {
  cols: number;
  rows: number;
  labelWidth: number; // mm
  labelHeight: number; // mm
}

export const LABEL_PRESETS: Record<PresetOption, LabelPreset> = {
  "10": { cols: 2, rows: 5, labelWidth: 95, labelHeight: 50 },
  "20": { cols: 4, rows: 5, labelWidth: 47, labelHeight: 50 },
  "30": { cols: 3, rows: 10, labelWidth: 66, labelHeight: 25 },
};