import type { SalesSummary } from '../../../api/sales';
import { money } from '../../../lib/format';

interface KPICardProps {
  title: string;
  value: string | number;
  badge?: string;
  badgeColor?: 'green' | 'red';
}

function KPICard({ title, value, badge, badgeColor = 'green' }: KPICardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col justify-center min-h-[100px]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-neutral-900 leading-none">{value}</p>
        </div>
        {badge && (
          <span
            className={`px-2 py-1 text-xs font-bold rounded-md flex items-center gap-1 ${
              badgeColor === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {badgeColor === 'green' ? (
              <span className="material-icons text-[12px]">trending_up</span>
            ) : null}
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

export interface SalesSummaryKPIsProps {
  summary: SalesSummary | null;
  loading: boolean;
}

export default function SalesSummaryKPIs({ summary, loading }: SalesSummaryKPIsProps) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[100px] bg-white border border-neutral-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Ventas Hoy"
        value={summary.salesToday}
        badge={summary.salesGrowth > 0 ? `+${summary.salesGrowth}%` : undefined}
      />
      <KPICard title="Total Facturado" value={money(summary.totalRevenue)} />
      <KPICard
        title="Devoluciones"
        value={summary.returnsCount}
        badge={summary.returnsAmount > 0 ? `-${money(summary.returnsAmount)}` : undefined}
        badgeColor="red"
      />
      <KPICard title="Ticket Promedio" value={money(summary.averageTicket)} />
    </div>
  );
}
