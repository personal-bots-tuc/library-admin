import type { CategoryOption, SortOption, TypeFilter } from '../../types';

export interface ProductsToolbarProps {
  typeFilter: TypeFilter;
  onTypeFilterChange: (value: TypeFilter) => void;
  lowStockOnly: boolean;
  onLowStockChange: (value: boolean) => void;
  categoryId: string | null;
  categories: CategoryOption[];
  onCategoryChange: (value: string | null) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onResetFilters: () => void;
  onOpenCategories: () => void;
  onCreateProduct: () => void;
  onPrint: () => void;
  printDisabled: boolean;
}
