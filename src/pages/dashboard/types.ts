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

export interface LowStockListProps {
  items: { id: string; name: string; stock: number; minStock?: number }[];
}

export interface ClientDebt {
  id: string;
  fullName: string;
  balance: number;
}

export interface CreditSummaryProps {
  totalOutstanding: number;
  clientsWithDebt: number;
  clients: ClientDebt[];
}

export interface SkeletonKpiProps {}
export interface SkeletonChartProps {}
export interface SkeletonTableProps {}
export interface SkeletonCardProps {}