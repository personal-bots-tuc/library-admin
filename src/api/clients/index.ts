import api from '../client';
import type { Client, ClientListResponse, CreateClientPayload } from './types';

export interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  hasBalance?: boolean;
  sortBy?: string;
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

export async function updateClient(id: string, payload: Partial<Client>): Promise<Client> {
  const { data } = await api.patch(`/clients/${id}`, payload);
  return data;
}

export type * from './types';
