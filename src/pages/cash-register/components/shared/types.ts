import type { CashMovementCategory, CashMovementType } from '../../../../api/cashMovements';

export interface StatusBadgeProps {
  status: 'open' | 'closed';
  difference?: number;
}

export interface DiffCellProps {
  value?: number;
}

export interface CategoryBadgeProps {
  category: CashMovementCategory;
}

export interface TypeBadgeProps {
  type: CashMovementType;
}

export interface AmountCellProps {
  amount: number;
  type: CashMovementType;
}
