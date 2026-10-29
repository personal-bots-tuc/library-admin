import { money } from '../../../../lib/format';
import { LIST_SCROLL_CLASSES } from '../../constants';
import { ViewAllButton } from '../view-all-button';
import type { CreditSummaryProps } from './types';

export const CreditSummary = ({
  totalOutstanding,
  clientsWithDebt,
  clients,
  onViewAll,
}: CreditSummaryProps) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col">
    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
      CRÉDITOS PENDIENTES
    </h3>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-700">Clientes con deuda</span>
        <span className="font-semibold text-neutral-900">{clientsWithDebt}</span>
      </div>
      <div className="flex justify-between text-sm pt-2 border-t border-neutral-100">
        <span className="text-neutral-500">TOTAL PENDIENTE</span>
        <span className="font-bold text-danger-600">−{money(totalOutstanding)}</span>
      </div>
      {clients.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs text-neutral-500">Principales deudores:</p>
          <ul
            aria-label="Principales deudores"
            tabIndex={0}
            className={`space-y-1.5 ${LIST_SCROLL_CLASSES}`}
          >
            {clients.map(client => (
              <li key={client.id} className="flex justify-between text-xs">
                <span className="text-neutral-700 truncate pr-2">{client.fullName}</span>
                <span className="font-medium text-danger-600">{money(client.balance)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
    {clientsWithDebt > clients.length && (
      <ViewAllButton count={clientsWithDebt} subject="clientes con deuda" onClick={onViewAll} />
    )}
  </div>
);
