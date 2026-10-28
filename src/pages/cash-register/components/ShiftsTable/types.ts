import type { CashShiftItem } from '../../../../api/cashShifts';
import type { CloseTarget } from '../../types';

export interface ShiftsTableProps {
  shifts: CashShiftItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onCloseShift: (target: CloseTarget) => void;
  onViewShift: (shiftId: string) => void;
}
