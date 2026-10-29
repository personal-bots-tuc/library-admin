export interface LowStockRow {
  id: string;
  name: string;
  stock: number;
  minStock?: number | undefined;
}

export interface DebtorRow {
  id: string;
  fullName: string;
  dni: string;
  balance: number;
}

export interface PagedRows<T> {
  rows: T[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  loading: boolean;
  error: string | null;
  retry: () => void;
}
