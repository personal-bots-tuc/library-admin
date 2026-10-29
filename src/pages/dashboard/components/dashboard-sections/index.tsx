import { money } from '../../../../lib/format';
import { formatPercent } from '../../../../lib/profit';
import { CreditSummary } from '../credit-summary';
import { KpiCard } from '../kpi-card';
import { LowStockList } from '../low-stock-list';
import { ProfitabilityCard } from '../profitability-card';
import { TopProductsTable } from '../top-products-table';
import type { DashboardSectionsProps } from './types';

export const DashboardSections = ({ data, onViewAll }: DashboardSectionsProps) => {
  const { sales, returns, profitability, credit } = data;
  const margin = profitability.grossMarginPercent;

  return (
    <>
      <section className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Ventas del período"
          value={money(sales.total)}
          hint={`${sales.count} ventas`}
        />
        <KpiCard
          title="Ticket promedio"
          value={money(sales.avgTicket)}
          hint={`${sales.productsSold} unidades`}
        />
        <KpiCard
          title="Ganancia bruta"
          value={money(profitability.grossProfit)}
          hint={formatPercent(margin)}
          hintColor={margin !== null && margin < 0 ? 'danger' : 'success'}
        />
        <KpiCard
          title="Devoluciones"
          value={`−${money(returns.amount)}`}
          hint={`${returns.count}`}
          hintColor="danger"
        />
      </section>

      <div className="grid grid-cols-1 gap-6">
        <ProfitabilityCard {...profitability} />
      </div>

      <div className="grid grid-cols-3 gap-6 items-start">
        <TopProductsTable products={data.topProducts} className="col-span-2" />
        <div className="flex flex-col gap-6">
          <LowStockList
            items={data.lowStock}
            total={data.lowStockTotal ?? data.lowStock.length}
            onViewAll={() => onViewAll('lowStock')}
          />
          <CreditSummary
            totalOutstanding={credit.totalOutstanding}
            clientsWithDebt={credit.clientsWithDebt}
            clients={credit.clients}
            onViewAll={() => onViewAll('debtors')}
          />
        </div>
      </div>
    </>
  );
};
