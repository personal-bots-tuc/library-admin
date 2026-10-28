import type {
  CashMovementCategory,
  CashMovementType,
  ListCashMovementsParams,
} from '../../../api/cashMovements';
import { endOfDayIso, startOfDayIso } from './dateRange';

export interface MovementsQuery {
  page: number;
  pageSize: number;
  cashShiftId?: string;
  type?: CashMovementType;
  category?: CashMovementCategory;
  fromDate: string;
  toDate: string;
}

/** Arma los query params del listado de movimientos a partir del estado de filtros. */
export const buildMovementsParams = (query: MovementsQuery): ListCashMovementsParams => {
  const params: ListCashMovementsParams = {
    page: query.page,
    limit: query.pageSize,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };
  if (query.cashShiftId) params.cashShiftId = query.cashShiftId;
  if (query.type) params.type = query.type;
  if (query.category) params.category = query.category;
  const fromDate = startOfDayIso(query.fromDate);
  const toDate = endOfDayIso(query.toDate);
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  return params;
};
