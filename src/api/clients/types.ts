export interface Client {
  id: string;
  fullName: string;
  phone?: string;
  dni: string;
  isDefault: boolean;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientPayload {
  fullName: string;
  dni: string;
  phone?: string;
}

export type UpdateClientPayload = Partial<Pick<Client, 'fullName' | 'phone' | 'dni' | 'active'>>;

export type ClientSortField = 'fullName' | 'dni' | 'balance' | 'createdAt';

export interface ClientListResponse {
  items: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
