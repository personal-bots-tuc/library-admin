export interface ClientDebt {
  id: string;
  fullName: string;
  balance: number;
}

export interface DashboardOverview {
  range: { from: string; to: string; days: number };
  sales: {
    count: number;
    total: number;
    cash: number;
    transfer: number;
    credit: number;
    avgTicket: number;
    productsSold: number;
  };
  returns: { count: number; amount: number };
  profitability: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMarginPercent: number | null;
  };
  series: { labels: string[]; total: number[] };
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; minStock?: number }[];
  /** Ausente en versiones de la API anteriores a API-201. */
  lowStockTotal?: number;
  credit: { totalOutstanding: number; clientsWithDebt: number; clients: ClientDebt[] };
}

export interface GetOverviewParams {
  from?: string;
  to?: string;
}
