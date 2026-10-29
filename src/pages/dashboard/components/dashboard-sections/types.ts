export type DashboardList = 'lowStock' | 'debtors';

export interface DashboardSectionsData {
  sales: { count: number; total: number; avgTicket: number; productsSold: number };
  returns: { count: number; amount: number };
  profitability: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    grossMarginPercent: number | null;
  };
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
  lowStock: { id: string; name: string; stock: number; minStock?: number | undefined }[];
  lowStockTotal?: number | undefined;
  credit: {
    totalOutstanding: number;
    clientsWithDebt: number;
    clients: { id: string; fullName: string; balance: number }[];
  };
}

export interface DashboardSectionsProps {
  data: DashboardSectionsData;
  onViewAll: (list: DashboardList) => void;
}
