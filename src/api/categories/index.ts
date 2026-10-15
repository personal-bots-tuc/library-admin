import { api } from '../client';

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  order?: number;
}

export const listCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>('/categories');
  return data;
};

export const createCategory = async (payload: { name: string; description?: string; order?: number }) => {
  const { data } = await api.post<Category>('/categories', payload);
  return data;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`);
};
