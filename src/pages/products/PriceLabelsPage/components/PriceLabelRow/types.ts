import type { PriceLabelProduct } from '../../types';

export interface PriceLabelRowProps {
  product: PriceLabelProduct;
  selected: boolean;
  qty: number;
  onToggle: () => void;
  onQtyChange: (qty: number) => void;
}
