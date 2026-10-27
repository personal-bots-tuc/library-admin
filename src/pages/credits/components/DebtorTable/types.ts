import type { DebtorItem } from '../../../../api/credits';

export interface DebtorTableProps {
  debtors: DebtorItem[];
  loading: boolean;
  search: string;
  error?: string;
  onSearchChange: (value: string) => void;
  onSettle: (item: DebtorItem) => void;
  onViewDetail: (item: DebtorItem) => void;
}
