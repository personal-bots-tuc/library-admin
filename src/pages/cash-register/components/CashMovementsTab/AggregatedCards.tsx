import type { ReactNode } from 'react';

import type { CashMovementAggregated, CashMovementCategory } from '../../../../api/cashMovements';
import { formatCurrency, formatSignedCurrency } from '../../../../lib/format';
import { CATEGORY_OPTIONS } from '../shared/constants';

interface AggregatedCardsProps {
  aggregated: CashMovementAggregated;
}

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</p>
    {children}
  </div>
);

export const AggregatedCards = ({ aggregated }: AggregatedCardsProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <Card title="Entradas">
      <p className="text-2xl font-bold text-success-600 mt-1">
        {formatSignedCurrency(aggregated.cashInTotal)}
      </p>
      {aggregated.byCategory?.change?.in > 0 && (
        <p className="text-xs text-neutral-400 mt-1">
          Cambio: {formatSignedCurrency(aggregated.byCategory.change.in)}
        </p>
      )}
    </Card>
    <Card title="Salidas">
      <p className="text-2xl font-bold text-danger-600 mt-1">
        {formatSignedCurrency(-aggregated.cashOutTotal)}
      </p>
      {aggregated.byCategory?.lunch?.out > 0 && (
        <p className="text-xs text-neutral-400 mt-1">
          Almuerzo: {formatSignedCurrency(-aggregated.byCategory.lunch.out)}
        </p>
      )}
    </Card>
    <Card title="Neto">
      <p
        className={`text-2xl font-bold mt-1 ${aggregated.netMovements >= 0 ? 'text-primary-600' : 'text-danger-600'}`}
      >
        {formatSignedCurrency(aggregated.netMovements)}
      </p>
      <p className="text-xs text-neutral-400 mt-1">{aggregated.movementsCount} movimientos</p>
    </Card>
    <Card title="Por categoría">
      <ul className="mt-2 space-y-1 text-xs text-neutral-600">
        {CATEGORY_OPTIONS.map(({ value, label }) => {
          const vals = aggregated.byCategory?.[value as CashMovementCategory];
          if (!vals || (vals.in === 0 && vals.out === 0)) return null;
          return (
            <li key={value} className="flex justify-between gap-2">
              <span>{label}</span>
              <span className="font-medium">
                +{formatCurrency(vals.in)} / −{formatCurrency(vals.out)} ({vals.count})
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  </div>
);
