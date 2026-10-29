export type TypeFilter = 'all' | 'product' | 'service';

export type SortOption =
  'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

export interface CategoryOption {
  id: string;
  name: string;
}
