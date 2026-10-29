import { SELECT_CLASS } from '../../styles';
import type { SortOption, TypeFilter } from '../../types';
import { CategorySelect } from '../CategorySelect';
import type { ProductsToolbarProps } from './types';

const SORT_LABELS: Record<SortOption, string> = {
  'name-asc': 'Nombre A-Z',
  'name-desc': 'Nombre Z-A',
  'price-asc': 'Precio (menor)',
  'price-desc': 'Precio (mayor)',
  'stock-asc': 'Stock (menor)',
  'stock-desc': 'Stock (mayor)',
};

const TYPE_TABS: TypeFilter[] = ['all', 'product', 'service'];

const TYPE_TAB_LABELS: Record<TypeFilter, string> = {
  all: 'Todos',
  product: 'Productos',
  service: 'Servicios',
};

const BUTTON_BASE =
  'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1.5';

export const ProductsToolbar = ({
  typeFilter,
  onTypeFilterChange,
  lowStockOnly,
  onLowStockChange,
  categoryId,
  categories,
  onCategoryChange,
  sort,
  onSortChange,
  onResetFilters,
  onOpenCategories,
  onCreateProduct,
  onPrint,
  printDisabled,
}: ProductsToolbarProps) => (
  <div className="flex flex-wrap items-center gap-2 text-sm">
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
        {TYPE_TABS.map(t => (
          <button
            key={t}
            onClick={() => onTypeFilterChange(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              typeFilter === t
                ? 'bg-white shadow border border-neutral-200 text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {TYPE_TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <select
        value={lowStockOnly ? 'true' : 'false'}
        onChange={e => onLowStockChange(e.target.value === 'true')}
        aria-label="Estado de stock"
        className={SELECT_CLASS}
      >
        <option value="false">Estado de Stock</option>
        <option value="true">Solo stock bajo</option>
      </select>

      <CategorySelect
        value={categoryId}
        onChange={onCategoryChange}
        categories={categories}
        ariaLabel="Filtrar por categoría"
      />

      <select
        value={sort}
        onChange={e => onSortChange(e.target.value as SortOption)}
        aria-label="Ordenar por"
        className={SELECT_CLASS}
      >
        {Object.entries(SORT_LABELS).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>

      <button onClick={onResetFilters} className="text-xs text-neutral-500 hover:text-neutral-700">
        Limpiar filtros
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
      <button
        onClick={onOpenCategories}
        className={`${BUTTON_BASE} text-neutral-700 bg-neutral-100 hover:bg-neutral-200`}
        aria-label="Gestionar categorías"
      >
        <span className="material-icons text-sm">category</span>
        Categorías
      </button>

      <button
        onClick={onCreateProduct}
        className={`${BUTTON_BASE} font-semibold text-white bg-emerald-600 hover:bg-emerald-700`}
        aria-label="Crear nuevo producto"
      >
        <span className="material-icons text-sm">add</span>
        Nuevo producto
      </button>

      <button
        onClick={onPrint}
        disabled={printDisabled}
        className={`${BUTTON_BASE} text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Imprimir listado de productos"
      >
        <span className="material-icons text-sm">print</span>
        Imprimir listado
      </button>
    </div>
  </div>
);
