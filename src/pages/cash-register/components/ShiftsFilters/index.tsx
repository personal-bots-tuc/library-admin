import type { ShiftsFiltersProps } from './types';

export const ShiftsFilters = ({ filters, onFiltersChange, sellers }: ShiftsFiltersProps) => (
  <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
      <span className="material-icons text-base text-neutral-400" aria-hidden="true">
        calendar_today
      </span>
      <label className="sr-only" htmlFor="shifts-from-date">
        Desde
      </label>
      <input
        id="shifts-from-date"
        type="date"
        value={filters.fromDate}
        max={filters.toDate || undefined}
        onChange={e => onFiltersChange({ fromDate: e.target.value })}
        className="outline-none bg-transparent text-sm"
      />
      <span className="text-neutral-400" aria-hidden="true">
        -
      </span>
      <label className="sr-only" htmlFor="shifts-to-date">
        Hasta
      </label>
      <input
        id="shifts-to-date"
        type="date"
        value={filters.toDate}
        min={filters.fromDate || undefined}
        onChange={e => onFiltersChange({ toDate: e.target.value })}
        className="outline-none bg-transparent text-sm"
      />
    </div>

    <label className="sr-only" htmlFor="shifts-seller">
      Vendedor
    </label>
    <select
      id="shifts-seller"
      value={filters.sellerId}
      onChange={e => onFiltersChange({ sellerId: e.target.value })}
      className="px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none bg-neutral-50 text-neutral-700"
    >
      <option value="">Vendedor: Todos</option>
      {sellers.map(seller => (
        <option key={seller.id} value={seller.id}>
          {seller.name}
        </option>
      ))}
    </select>
  </div>
);
