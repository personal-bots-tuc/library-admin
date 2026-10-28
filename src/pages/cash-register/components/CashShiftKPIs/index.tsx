import { formatCurrency, formatSignedCurrency } from '../../../../lib/format';
import type { CashShiftKPIsProps, KPICardProps } from './types';

const KPICard = ({
  label,
  value,
  sub,
  icon,
  iconColor,
  valueClass = 'text-neutral-900',
}: KPICardProps) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col gap-2">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
      <span className="material-icons text-xl text-white">{icon}</span>
    </div>
    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mt-1">{label}</p>
    <p className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</p>
    {sub && <p className="text-xs text-neutral-500">{sub}</p>}
  </div>
);

const KPISkeleton = () => (
  <div className="bg-white border border-neutral-200 rounded-xl p-5 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-neutral-100 mb-3" />
    <div className="h-3 bg-neutral-100 rounded w-24 mb-2" />
    <div className="h-7 bg-neutral-100 rounded w-32 mb-1" />
    <div className="h-3 bg-neutral-100 rounded w-20" />
  </div>
);

export const CashShiftKPIs = ({ summary, loading }: CashShiftKPIsProps) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4" data-testid="kpis-skeleton">
        {[...Array(4)].map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>
    );
  }

  const hasDifference = summary.difference !== 0;
  const shiftsLabel = summary.totalShifts === 1 ? '1 turno' : `${summary.totalShifts} turnos`;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <KPICard
        label="Efectivo en caja"
        value={formatCurrency(summary.finalCount)}
        sub={`esperado ${formatCurrency(summary.totalExpected)}`}
        icon="payments"
        iconColor="bg-success-500"
        valueClass="text-success-600"
      />
      <KPICard
        label="Ventas efectivo"
        value={formatCurrency(summary.cashSales)}
        sub={summary.totalShifts > 0 ? `en ${shiftsLabel}` : 'Sin ventas'}
        icon="receipt"
        iconColor="bg-amber-500"
      />
      <KPICard
        label="Ventas por transferencia"
        value={formatCurrency(summary.transferSales)}
        sub={summary.totalShifts > 0 ? 'ventas digitales del día' : 'Sin ventas'}
        icon="account_balance"
        iconColor="bg-primary-500"
        valueClass="text-primary-600"
      />
      <KPICard
        label="Diferencia"
        value={hasDifference ? formatSignedCurrency(summary.difference) : formatCurrency(0)}
        sub={hasDifference ? 'Revisar arqueo' : 'Cuadrado'}
        icon="warning"
        iconColor={hasDifference ? 'bg-danger-500' : 'bg-success-500'}
        valueClass={hasDifference ? 'text-danger-600' : 'text-success-600'}
      />
    </div>
  );
};
