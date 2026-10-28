import type { CashMovementCategory, CashMovementType } from '../../../../api/cashMovements';
import { CATEGORY_OPTIONS } from '../shared/constants';

const TYPE_TABS: { value: CashMovementType | undefined; label: string }[] = [
  { value: undefined, label: 'Todos' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Salidas' },
];

interface MovementsFiltersProps {
  fromDate: string;
  toDate: string;
  onDateRangeChange: (from: string, to: string) => void;
  category: CashMovementCategory | undefined;
  onCategoryChange: (value: CashMovementCategory | undefined) => void;
  type: CashMovementType | undefined;
  onTypeChange: (value: CashMovementType | undefined) => void;
}

/** El select de tipo y las pestañas Todos/Entradas/Salidas comparten el mismo estado. */
export const MovementsFilters = ({
  fromDate,
  toDate,
  onDateRangeChange,
  category,
  onCategoryChange,
  type,
  onTypeChange,
}: MovementsFiltersProps) => (
  <div className="px-5 py-4 border-b border-neutral-100 flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
      <span className="material-icons text-base text-neutral-400" aria-hidden="true">
        calendar_today
      </span>
      <label className="sr-only" htmlFor="movements-from-date">
        Desde
      </label>
      <input
        id="movements-from-date"
        type="date"
        value={fromDate}
        max={toDate || undefined}
        onChange={e => onDateRangeChange(e.target.value, toDate)}
        className="outline-none bg-transparent text-sm"
      />
      <span className="text-neutral-400" aria-hidden="true">
        -
      </span>
      <label className="sr-only" htmlFor="movements-to-date">
        Hasta
      </label>
      <input
        id="movements-to-date"
        type="date"
        value={toDate}
        min={fromDate || undefined}
        onChange={e => onDateRangeChange(fromDate, e.target.value)}
        className="outline-none bg-transparent text-sm"
      />
    </div>

    <label className="sr-only" htmlFor="movements-type">
      Tipo
    </label>
    <select
      id="movements-type"
      value={type ?? ''}
      onChange={e => onTypeChange((e.target.value || undefined) as CashMovementType | undefined)}
      className="px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none bg-neutral-50 text-neutral-700"
    >
      <option value="">Tipo: Todos</option>
      <option value="in">Entradas</option>
      <option value="out">Salidas</option>
    </select>

    <label className="sr-only" htmlFor="movements-category">
      Categoría
    </label>
    <select
      id="movements-category"
      value={category ?? ''}
      onChange={e =>
        onCategoryChange((e.target.value || undefined) as CashMovementCategory | undefined)
      }
      className="px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none bg-neutral-50 text-neutral-700"
    >
      <option value="">Categoría: Todas</option>
      {CATEGORY_OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>

    <div
      className="ml-auto flex items-center bg-neutral-100 rounded-lg p-1 gap-1"
      role="tablist"
      aria-label="Filtrar por tipo"
    >
      {TYPE_TABS.map(option => (
        <button
          key={option.label}
          type="button"
          role="tab"
          aria-selected={type === option.value}
          onClick={() => onTypeChange(option.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            type === option.value
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);
