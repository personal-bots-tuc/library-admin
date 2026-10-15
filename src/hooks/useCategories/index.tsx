import { useQuery } from '@tanstack/react-query';
import { listCategories } from '../../api/categories';

export function useCategories() {
  const query = useQuery({
    queryKey: ['categories', 'list'],
    queryFn: () => listCategories(),
    staleTime: 60_000,
  });
  return {
    categories: query.data ?? [],
    loading: query.isPending,
    error: query.error ? String(query.error) : null,
  };
}
