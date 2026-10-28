import { formatCurrency, formatSignedCurrency } from '../../../../lib/format';
import type { DailySummaryProps, SummaryLineProps } from './types';

const SummaryLine = ({ label, value, valueClass = 'text-neutral-800' }: SummaryLineProps) => (
  <div className="flex flex-col gap-0.5 rounded-lg bg-neutral-50 px-4 py-3">
    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
    <span className={`text-base font-bold ${valueClass}`}>{value}</span>
  </div>
);

const formatDateLabel = (isoDate: string) => {
  if (!isoDate) return '—';
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const DailySummarySkeleton = () => (
  <div
    className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6 animate-pulse space-y-4"
    data-testid="daily-summary-skeleton"
  >
    <div className="h-5 bg-neutral-100 rounded w-64" />
    <div className="h-16 bg-neutral-100 rounded-xl" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-14 bg-neutral-100 rounded-lg" />
      ))}
    </div>
  </div>
);

interface DailySummarySectionProps {
  summary: DailySummaryProps['summary'] | null;
  loading: boolean;
}

/** Resumen, o su skeleton mientras no hay datos todavía. */
export const DailySummarySection = ({ summary, loading }: DailySummarySectionProps) => {
  if (summary) return <DailySummary summary={summary} />;
  return loading ? <DailySummarySkeleton /> : null;
};

export const DailySummary = ({ summary }: DailySummaryProps) => {
  const netPositive = summary.netMovements >= 0;
  const hasDifference = summary.difference !== 0;
  const hasInherited = summary.inheritedOpening > 0;
  const hasSalesOpen = summary.salesInOpenShifts > 0;
  const hasCreditPayments = summary.creditPayments > 0;

  return (
    <section
      className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden"
      aria-labelledby="daily-summary-title"
    >
      <header className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
        <span className="material-icons text-primary-600 text-xl">point_of_sale</span>
        <h2 id="daily-summary-title" className="font-bold text-neutral-900 text-base">
          Resumen diario {formatDateLabel(summary.date)}
        </h2>
      </header>

      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl bg-primary-50 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-600">
              Total operación
            </p>
            <p className="text-xs text-neutral-500">
              Apertura + ventas − devoluciones ± movimientos + créditos
            </p>
          </div>
          <p className="text-3xl font-bold text-primary-700" data-testid="total-operation">
            {formatCurrency(summary.totalExpected)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryLine label="Apertura" value={formatCurrency(summary.totalOpening)} />
          <SummaryLine
            label="Ventas efectivo"
            value={formatSignedCurrency(summary.cashSales)}
            valueClass="text-success-600"
          />
          <SummaryLine
            label="Devoluciones (efectivo)"
            value={formatSignedCurrency(-summary.returns)}
            valueClass="text-danger-600"
          />
          <SummaryLine
            label="Entradas movimientos"
            value={formatSignedCurrency(summary.cashInTotal)}
            valueClass="text-success-600"
          />
          <SummaryLine
            label="Salidas movimientos"
            value={formatSignedCurrency(-summary.cashOutTotal)}
            valueClass="text-danger-600"
          />
          <SummaryLine
            label="Neto movimientos"
            value={formatSignedCurrency(summary.netMovements)}
            valueClass={netPositive ? 'text-success-600' : 'text-danger-600'}
          />
          <SummaryLine
            label="Pagos créditos"
            value={
              hasCreditPayments ? formatSignedCurrency(summary.creditPayments) : formatCurrency(0)
            }
            valueClass={hasCreditPayments ? 'text-success-600' : 'text-neutral-600'}
          />
          <SummaryLine
            label="Ventas transferencia"
            value={formatCurrency(summary.transferSales)}
            valueClass="text-primary-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-5 md:grid-cols-4 xl:grid-cols-6">
          <SummaryLine label="Conteo final (cerrados)" value={formatCurrency(summary.finalCount)} />
          <SummaryLine
            label="En caja, pendiente de conteo"
            value={formatCurrency(summary.salesInOpenShifts)}
            valueClass={hasSalesOpen ? 'text-amber-600' : 'text-neutral-800'}
          />
          <SummaryLine
            label="Diferencia real"
            value={hasDifference ? formatSignedCurrency(summary.difference) : formatCurrency(0)}
            valueClass={hasDifference ? 'text-danger-600' : 'text-success-600'}
          />
          <SummaryLine
            label="Turnos con diferencia"
            value={`${summary.shiftsWithDifference} de ${summary.totalShifts}`}
            valueClass={summary.shiftsWithDifference > 0 ? 'text-amber-600' : 'text-neutral-800'}
          />
          {hasInherited && (
            <SummaryLine
              label="Apertura heredada (no es de hoy)"
              value={formatSignedCurrency(-summary.inheritedOpening)}
              valueClass="text-neutral-500"
            />
          )}
        </div>
      </div>
    </section>
  );
};
