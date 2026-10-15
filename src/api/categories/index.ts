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
