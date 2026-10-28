import { formatCurrency } from '../../../../lib/format';
import { CATEGORY_BY_VALUE } from './constants';
import type {
  AmountCellProps,
  CategoryBadgeProps,
  DiffCellProps,
  StatusBadgeProps,
  TypeBadgeProps,
} from './types';

export const StatusBadge = ({ status, difference }: StatusBadgeProps) => {
  if (status === 'open') {
    return (
      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-700 tracking-wide">
        Abierto
      </span>
    );
  }
  if (difference !== undefined && difference !== 0) {
    return (
      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-danger-100 text-danger-700 tracking-wide">
        Diferencia
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-success-100 text-success-700 tracking-wide">
      Cerrado
    </span>
  );
};

export const DiffCell = ({ value }: DiffCellProps) => {
  const diff = value ?? 0;
  if (diff === 0) {
    return (
      <span className="text-success-600 font-semibold flex items-center gap-1">
        $0 <span className="material-icons text-base">check_circle</span>
      </span>
    );
  }
  return (
    <span className="text-danger-600 font-semibold flex items-center gap-1">
      {diff > 0 ? '+' : ''}
      {formatCurrency(diff)}
      <span className="material-icons text-base">cancel</span>
    </span>
  );
};

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const { label, badgeClass } = CATEGORY_BY_VALUE[category];
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass}`}>{label}</span>
  );
};

export const TypeBadge = ({ type }: TypeBadgeProps) =>
  type === 'in' ? (
    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-success-100 text-success-700">
      Entrada
    </span>
  ) : (
    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-danger-100 text-danger-700">
      Salida
    </span>
  );

export const AmountCell = ({ amount, type }: AmountCellProps) => (
  <span className={`font-semibold ${type === 'in' ? 'text-success-600' : 'text-danger-600'}`}>
    {type === 'in' ? '+' : '−'}
    {formatCurrency(amount)}
  </span>
);
export { CATEGORY_BY_VALUE, CATEGORY_OPTIONS } from './constants';
