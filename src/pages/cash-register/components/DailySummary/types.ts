import type { DailySummary } from '../../../../api/cashShifts';

export interface DailySummaryProps {
  summary: DailySummary;
}

export interface SummaryLineProps {
  label: string;
  value: string;
  valueClass?: string;
}
