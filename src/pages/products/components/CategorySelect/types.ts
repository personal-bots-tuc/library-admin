import type { CategoryOption } from '../../types';

export interface CategorySelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  categories: CategoryOption[];
  ariaLabel: string;
}
