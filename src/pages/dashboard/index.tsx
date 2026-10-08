import { money } from '../../lib/format';
import { formatPercent } from '../../lib/profit';
import { useDashboard } from './hooks';
import {
  KpiCard,
  ProfitabilityCard,
  TopProductsTable,
  LowStockList,
  CreditSummary,
  SkeletonKpi,
  SkeletonTable,
  SkeletonCard,
} from './components';

export default function DashboardPage() {
  const { from, setFrom, to, setTo, data, loading, error, empty } = useDashboard();

  if (loading) {
    return (
      <div className="p-6">
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <input type="date" className="px-3 py-2 border border-neutral-300 rounded-lg w-40 bg-neutral-100" disabled />
            <span className="self-center text-neutral-400">–</span>
            <input type="date" className="px-3 py-2 border border-neutral-300 rounded-lg w-40 bg-neutral-100" disabled />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonKpi key={i} />)}
          </div>
          <div className="grid grid-cols-1 gap-6">
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><SkeletonTable /></div>
            <div className="flex flex-col gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="mt-4 text-sm text-danger-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm text-neutral-600">Desde</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg w-40" />
        <label className="text-sm text-neutral-600">Hasta</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 border border-neutral-300 rounded-lg w-40" />
      </div>

      {error && <p className="text-sm text-danger-600">{error}</p>}

      {!empty && (
        <section className="grid grid-cols-4 gap-4">
          <KpiCard title="Ventas del período" value={money(data?.sales.total ?? 0)} hint={`${data?.sales.count ?? 0} ventas`} />
          <KpiCard title="Ticket promedio" value={money(data?.sales.avgTicket ?? 0)} hint={`${data?.sales.productsSold ?? 0} unidades`} />
          <KpiCard
            title="Ganancia bruta"
            value={money(data?.profitability.grossProfit ?? 0)}
            hint={formatPercent(data?.profitability.grossMarginPercent ?? null)}
            hintColor={data?.profitability.grossMarginPercent !== undefined && data?.profitability.grossMarginPercent !== null && data?.profitability.grossMarginPercent < 0 ? 'danger' : 'success'}
          />
          <KpiCard title="Devoluciones" value={`−${money(data?.returns.amount ?? 0)}`} hint={`${data?.returns.count ?? 0}`} hintColor="danger" />
        </section>
      )}

      {!empty && (
        <div className="grid grid-cols-1 gap-6">
          <ProfitabilityCard
            revenue={data?.profitability.revenue ?? 0}
            cogs={data?.profitability.cogs ?? 0}
            grossProfit={data?.profitability.grossProfit ?? 0}
            grossMarginPercent={data?.profitability.grossMarginPercent ?? null}
          />
        </div>
      )}

      {!empty && (
        <div className="grid grid-cols-3 gap-6">
          <TopProductsTable products={data?.topProducts ?? []} className="col-span-2" />
          <div className="flex flex-col gap-6">
            <LowStockList items={data?.lowStock ?? []} />
            <CreditSummary
              totalOutstanding={data?.credit.totalOutstanding ?? 0}
              clientsWithDebt={data?.credit.clientsWithDebt ?? 0}
              clients={data?.credit.clients ?? []}
            />
          </div>
        </div>
      )}

      {empty && (
        <div className="text-center py-12 text-neutral-400">
          <span className="material-icons text-6xl mb-2 block">inbox</span>
          <p className="text-lg">Sin datos para el rango seleccionado</p>
        </div>
      )}
    </div>
  );
}