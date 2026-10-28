import type { SellerOption, ShiftFilters } from '../../types';

export interface ShiftsFiltersProps {
  filters: ShiftFilters;
  onFiltersChange: (patch: Partial<ShiftFilters>) => void;
  sellers: SellerOption[];
}
