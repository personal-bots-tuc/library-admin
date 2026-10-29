export type DashboardModal = 'lowStock' | 'debtors';

export interface KpiCardProps {
  title: string;
  value: string;
  hint?: string;
  hintColor?: 'success' | 'danger' | 'warning' | 'neutral';
}

export interface BarChartProps {
  labels: string[];
  values: number[];
  maxValue: number;
  title: string;
  className?: string;
}

export interface ProfitabilityCardProps {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number | null;
}

export interface TopProductsTableProps {
  products: { productId: string; name: string; quantity: number; revenue: number }[];
  className?: string;
}
