import { listCredits } from '../../../api/credits';
import { MODAL_PAGE_SIZE } from '../constants';
import type { DebtorRow, PagedRows } from './types';
import { usePagedQuery } from './use-paged-query';

export function useDebtorsPage(): PagedRows<DebtorRow> {
  return usePagedQuery(
    'debtors',
    page => listCredits({ page, limit: MODAL_PAGE_SIZE, sortBy: 'balance', sortOrder: 'desc' }),
    ({ client, balance }) => ({
      id: client.id,
      fullName: client.fullName,
      dni: client.dni,
      balance,
    })
  );
}
