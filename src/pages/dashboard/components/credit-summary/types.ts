export interface CreditSummaryClient {
  id: string;
  fullName: string;
  balance: number;
}

export interface CreditSummaryProps {
  totalOutstanding: number;
  clientsWithDebt: number;
  clients: CreditSummaryClient[];
  onViewAll: () => void;
}
