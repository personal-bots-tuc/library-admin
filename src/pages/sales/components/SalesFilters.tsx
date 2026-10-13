import type { ListSalesParams } from '../../../api/sales';

export type SalesTab = 'all' | 'sale' | 'return' | 'credit_note';

const TABS: { id: SalesTab; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'sale', label: 'Ventas' },
  { id: 'return', label: 'Devoluciones' },
  { id: 'credit_note', label: 'Notas de crédito' },
];

const toIsoOrUndefined = (value: string) => (value ? new Date(value).toISOString() : undefined);

export interface SalesFiltersProps {
  params: ListSalesParams;
  activeTab: SalesTab;
  onParamsChange: (patch: Partial<ListSalesParams>) => void;
  onTabChange: (tab: SalesTab) => void;
  onClear: () => void;
}

export default function SalesFilters({
  params,
  activeTab,
  onParamsChange,
  onTabChange,
  onClear,
}: SalesFiltersProps) {
  return (
    <>
      {/* Filters Bar 1: Search & Date */}
      <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px] max-w-sm">
          <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={params.search || ''}
            placeholder="Buscar comprobante..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-neutral-50"
            onChange={e => onParamsChange({ search: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-600">
          <span className="material-icons text-[16px] text-neutral-400">calendar_today</span>
          <input
            type="date"
            className="bg-transparent outline-none w-32"
            value={params.fromDate ? params.fromDate.split('T')[0] : ''}
            onChange={e => onParamsChange({ fromDate: toIsoOrUndefined(e.target.value) })}
          />
          <span className="text-neutral-400">-</span>
          <input
            type="date"
            className="bg-transparent outline-none w-32"
            value={params.toDate ? params.toDate.split('T')[0] : ''}
            onChange={e => onParamsChange({ toDate: toIsoOrUndefined(e.target.value) })}
          />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex bg-neutral-100 rounded-lg p-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClear}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Filters Bar 2: Selects */}
      <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap items-center gap-3 bg-neutral-50/50">
        <select
          className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg outline-none bg-white min-w-[160px] text-neutral-700"
          value={params.sellerId || ''}
          onChange={e => onParamsChange({ sellerId: e.target.value || undefined })}
        >
          <option value="">Vendedor: Todos</option>
        </select>

        <select
          className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg outline-none bg-white min-w-[160px] text-neutral-700"
          value={params.paymentMethod || ''}
          onChange={e =>
            onParamsChange({
              paymentMethod: (e.target.value || undefined) as ListSalesParams['paymentMethod'],
            })
          }
        >
          <option value="">Método: Todos</option>
          <option value="cash">Efectivo</option>
          <option value="transfer">Transferencia</option>
          <option value="credit">Crédito</option>
        </select>
      </div>
    </>
  );
}
