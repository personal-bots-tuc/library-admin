import api from '../client';
import type {
  Client,
  ClientListResponse,
  ClientSortField,
  CreateClientPayload,
  UpdateClientPayload,
} from './types';

export interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  hasDebt?: boolean;
  active?: boolean;
  sortBy?: ClientSortField;
  sortOrder?: 'asc' | 'desc';
}

export async function listClients(params: ListClientsParams): Promise<ClientListResponse> {
  const { data } = await api.get('/clients', { params });
  return data;
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get(`/clients/${id}`);
  return data;
}

export async function createClient(payload: CreateClientPayload): Promise<Client> {
  const { data } = await api.post('/clients', payload);
  return data;
}

export async function updateClient(id: string, payload: UpdateClientPayload): Promise<Client> {
  const { data } = await api.patch(`/clients/${id}`, payload);
  return data;
}

export type * from './types';
