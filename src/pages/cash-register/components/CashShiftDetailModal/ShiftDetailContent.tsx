import type { CashMovementCategory } from '../../../../api/cashMovements';
import type { CashShiftDetail } from '../../../../api/cashShifts';
import { formatCurrency, formatShortDateTime, formatSignedCurrency } from '../../../../lib/format';
import { AmountCell, CategoryBadge, StatusBadge, TypeBadge } from '../shared';
import { CATEGORY_OPTIONS } from '../shared/constants';

const formatOptional = (value: number | undefined) => (value == null ? '—' : formatCurrency(value));

const MetricCard = ({
  label,
  value,
  valueClass = 'text-neutral-800',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="bg-neutral-50 rounded-xl p-4">
    <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
    <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
  </div>
);

const ResultRow = ({
  label,
  value,
  valueClass = 'text-neutral-800',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) => (
  <div className="flex items-center justify-between p-4">
    <span className="text-sm text-neutral-600">{label}</span>
    <span className={`text-lg font-bold ${valueClass}`}>{value}</span>
  </div>
);

const CategorySummary = ({ detail }: { detail: CashShiftDetail }) => {
  const { byCategory } = detail.movements.aggregated;
  const withActivity = CATEGORY_OPTIONS.filter(({ value }) => {
    const vals = byCategory?.[value as CashMovementCategory];
    return vals && (vals.in > 0 || vals.out > 0);
  });

  if (withActivity.length === 0) {
    return <p className="text-sm text-neutral-500">Sin movimientos por categoría</p>;
  }

  return (
    <ul className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
      {withActivity.map(({ value }) => {
        const category = value as CashMovementCategory;
        const vals = byCategory[category];
        return (
          <li key={value} className="flex justify-between items-center">
            <CategoryBadge category={category} />
            <span className="font-medium">
              +{formatCurrency(vals.in)} / −{formatCurrency(vals.out)} ({vals.count})
            </span>
          </li>
        );
      })}
    </ul>
  );
};

const MovementsTable = ({ detail }: { detail: CashShiftDetail }) => (
  <div className="border border-neutral-200 rounded-xl overflow-hidden">
    <table className="w-full text-sm text-left">
      <thead className="bg-neutral-50 border-b border-neutral-200">
        <tr>
          {['Fecha', 'Tipo', 'Categoría', 'Monto', 'Descripción'].map(h => (
            <th
              key={h}
              className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-100">
        {detail.movements.items.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">
              Sin movimientos registrados
            </td>
          </tr>
        ) : (
          detail.movements.items.map(m => (
            <tr key={m.id} className="hover:bg-neutral-50/60 transition-colors">
              <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                {formatShortDateTime(m.createdAt)}
              </td>
              <td className="px-4 py-3">
                <TypeBadge type={m.type} />
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={m.category} />
              </td>
              <td className="px-4 py-3">
                <AmountCell amount={m.amount} type={m.type} />
              </td>
              <td className="px-4 py-3 text-neutral-600 max-w-xs truncate" title={m.description}>
                {m.description}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export const ShiftDetailContent = ({ detail }: { detail: CashShiftDetail }) => {
  const { shift, sales, movements } = detail;
  const { aggregated } = movements;
  const hasDifference = shift.difference !== undefined && shift.difference !== 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">
          Turno #{shift.shiftNumber} · {shift.sellerName}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
          <StatusBadge status={shift.status} difference={shift.difference} />
          <span>
            {formatShortDateTime(shift.openedAt)}
            {shift.closedAt ? ` → ${formatShortDateTime(shift.closedAt)}` : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Apertura" value={formatOptional(shift.openingAmount)} />
        <MetricCard
          label="Ventas efectivo"
          value={formatSignedCurrency(sales.cashTotal)}
          valueClass="text-success-600"
        />
        <MetricCard
          label="Transferencias"
          value={formatSignedCurrency(sales.transferTotal)}
          valueClass="text-primary-600"
        />
        <MetricCard
          label="Crédito"
          value={formatSignedCurrency(sales.creditTotal)}
          valueClass="text-purple-600"
        />
        <MetricCard
          label="Devoluciones"
          value={formatSignedCurrency(-sales.returnsTotal)}
          valueClass="text-danger-600"
        />
        <MetricCard
          label="Entradas movimientos"
          value={formatSignedCurrency(aggregated.cashInTotal)}
          valueClass="text-success-600"
        />
        <MetricCard
          label="Salidas movimientos"
          value={formatSignedCurrency(-aggregated.cashOutTotal)}
          valueClass="text-danger-600"
        />
        <MetricCard
          label="Neto movimientos"
          value={formatSignedCurrency(aggregated.netMovements)}
          valueClass={aggregated.netMovements >= 0 ? 'text-success-600' : 'text-danger-600'}
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
        <ResultRow
          label="Total esperado"
          value={formatOptional(shift.expectedAmount)}
          valueClass="text-primary-600"
        />
        <ResultRow label="Conteo real" value={formatOptional(shift.closingAmount)} />
        <ResultRow
          label="Diferencia"
          value={shift.difference !== undefined ? formatSignedCurrency(shift.difference) : '—'}
          valueClass={hasDifference ? 'text-danger-600' : 'text-success-600'}
        />
        {shift.note && (
          <div className="flex items-start justify-between p-4">
            <span className="text-sm text-neutral-600">Nota</span>
            <span className="text-sm text-neutral-800 text-right max-w-[60%]">{shift.note}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2">Movimientos por categoría</h3>
        <CategorySummary detail={detail} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-2">Movimientos registrados</h3>
        <MovementsTable detail={detail} />
      </div>
    </div>
  );
};
