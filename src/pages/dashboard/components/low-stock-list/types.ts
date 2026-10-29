export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  minStock?: number | undefined;
}

export interface LowStockListProps {
  items: LowStockItem[];
  total: number;
  onViewAll: () => void;
}
