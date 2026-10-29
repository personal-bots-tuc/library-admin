import { listProducts } from '../../../api/products';
import { MODAL_PAGE_SIZE } from '../constants';
import type { LowStockRow, PagedRows } from './types';
import { usePagedQuery } from './use-paged-query';

export function useLowStockPage(): PagedRows<LowStockRow> {
  return usePagedQuery(
    'low-stock',
    // active + type replican el criterio de /dashboard/overview para que el total coincida con lowStockTotal.
    page =>
      listProducts({
        lowStock: true,
        active: true,
        type: 'product',
        page,
        limit: MODAL_PAGE_SIZE,
        sortBy: 'stock',
        sortOrder: 'asc',
      }),
    ({ id, name, stock, minStock }) => ({ id, name, stock, minStock })
  );
}
