import type { DailySummary } from '../../../../api/cashShifts';

export interface CashShiftKPIsProps {
  summary: DailySummary | null;
  loading: boolean;
}

export interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  iconColor: string;
  valueClass?: string;
}
