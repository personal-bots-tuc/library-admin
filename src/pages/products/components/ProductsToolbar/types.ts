import type { Category } from '../../../../api/categories';

export type TypeFilter = 'all' | 'product' | 'service';

export type SortOption =
  'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

export interface ProductsToolbarProps {
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  lowStockOnly: boolean;
  onLowStockChange: (value: boolean) => void;
  categoryId: string | null;
  categories: Category[];
  onCategoryChange: (value: string | null) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onResetFilters: () => void;
  onOpenCategories: () => void;
  onCreateProduct: () => void;
  onPrint: () => void;
  printDisabled: boolean;
}
