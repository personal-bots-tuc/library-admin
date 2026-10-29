import api from '../client';
import type {
  ClientCreditResult,
  CreditsListResult,
  CreditsSummary,
  RecentMovement,
  SettleDebtApiResponse,
  SettleDebtPayload,
  SettleDebtResponse,
} from './types';

export async function getCreditsSummary(): Promise<CreditsSummary> {
  const { data } = await api.get('/credits/summary');
  return data;
}

export async function listCredits(params?: {
  search?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'balance' | 'fullName' | 'lastPaymentAt';
  sortOrder?: 'asc' | 'desc';
}): Promise<CreditsListResult> {
  const { data } = await api.get('/credits', { params });
  return data;
}

export async function getRecentHistory(limit = 5): Promise<RecentMovement[]> {
  const { data } = await api.get('/credits/history', { params: { limit } });
  return data;
}

export async function getClientCredit(
  clientId: string,
  params?: { page?: number; limit?: number }
): Promise<ClientCreditResult> {
  const { data } = await api.get(`/credits/client/${clientId}`, { params });
  return data;
}

export async function settleDebt(
  clientId: string,
  payload: SettleDebtPayload
): Promise<SettleDebtResponse> {
  const { data } = await api.post<SettleDebtApiResponse>(
    `/credits/client/${clientId}/settle`,
    payload
  );
  return data.data;
}

export type * from './types';
