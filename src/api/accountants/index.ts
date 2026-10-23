import api from '../client';
import type { Accountant, CreateAccountantPayload, UpdateAccountantPayload } from './types';

export async function listAccountants(): Promise<Accountant[]> {
  const { data } = await api.get<{ items: Accountant[] }>('/contaflow/superadmin/accountants');
  return data.items;
}

export async function createAccountant(
  payload: CreateAccountantPayload
): Promise<{ user: Accountant }> {
  const { data } = await api.post('/contaflow/superadmin/accountants', payload);
  return data;
}

export async function updateAccountant(
  id: string,
  changes: UpdateAccountantPayload
): Promise<{ user: Accountant }> {
  const { data } = await api.put(`/contaflow/superadmin/accountants/${id}`, changes);
  return data;
}

export async function deactivateAccountant(id: string): Promise<{ deleted: boolean }> {
  const { data } = await api.delete(`/contaflow/superadmin/accountants/${id}`);
  return data;
}

export async function assignSchool(
  id: string,
  schoolId: string
): Promise<{ assignment: { schoolId: string; name: string; active: boolean } }> {
  const { data } = await api.post(`/contaflow/superadmin/accountants/${id}/assignments`, {
    schoolId,
  });
  return data;
}

export async function unassignSchool(id: string, schoolId: string): Promise<{ removed: boolean }> {
  const { data } = await api.delete(
    `/contaflow/superadmin/accountants/${id}/assignments/${schoolId}`
  );
  return data;
}

export type * from './types';
