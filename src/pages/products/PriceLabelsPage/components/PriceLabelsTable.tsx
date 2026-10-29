import { useEffect, useMemo, useRef, useState } from 'react';
import { CategorySelect } from '../../components/CategorySelect';
import { PaginationFooter } from '../../../../components/DataTable/PaginationFooter';
import { SelectionBanner } from './SelectionBanner';
import { PriceLabelRow } from './PriceLabelRow';
import { filterPriceLabelProducts, paginate } from '../utils/filterProducts';
import {
  buildScopeSuffix,
  emptyStateMessage,
  findCategoryName,
  getScopeBannerState,
} from '../utils/tableState';
import type { PriceLabelsTableProps } from '../types';

const PAGE_SIZES = [25, 50, 100];

export default function PriceLabelsTable({
  products,
  categories,
  selection,
}: PriceLabelsTableProps) {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [onlySelected, setOnlySelected] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const headerRef = useRef<HTMLInputElement>(null);

  // Cualquier cambio de filtro vuelve a la página 1.
  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const changeCategory = (value: string | null) => {
    setCategoryId(value);
    setPage(1);
  };
  const toggleOnlySelected = () => {
    setOnlySelected(v => !v);
    setPage(1);
  };
  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const filtered = useMemo(
    () =>
      filterPriceLabelProducts(products, {
        search,
        categoryId,
        onlySelected,
        selected: selection.selected,
      }),
    [products, search, categoryId, onlySelected, selection.selected]
  );
  const {
    pageItems,
    page: currentPage,
    totalPages,
  } = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize]);

  const pageSelected = pageItems.filter(p => selection.isSelected(p.id)).length;
  const pageAll = pageItems.length > 0 && pageSelected === pageItems.length;
  const scopeAll = filtered.length > 0 && filtered.every(p => selection.isSelected(p.id));
  const scopeIsMultiPage = filtered.length > pageItems.length;
  const bannerState = getScopeBannerState({ pageAll, scopeAll, scopeIsMultiPage });
  const categoryName = findCategoryName(categories, categoryId);
  const scopeSuffix = buildScopeSuffix(categoryName, Boolean(search.trim() || onlySelected));
  const selectedCount = selection.selected.size;

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.indeterminate = pageSelected > 0 && !pageAll;
    }
  }, [pageSelected, pageAll]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="pricelabels-search" className="sr-only">
            Buscar productos
          </label>
          <input
            id="pricelabels-search"
            type="text"
            value={search}
            onChange={e => changeSearch(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <CategorySelect
          value={categoryId}
          onChange={changeCategory}
          categories={categories}
          ariaLabel="Filtrar por categoría"
        />
        <button
          type="button"
          aria-pressed={onlySelected}
          onClick={toggleOnlySelected}
          className={`px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap ${
            onlySelected
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          Solo seleccionados
        </button>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>{filtered.length} productos</span>
          <span className="px-2 py-1 bg-neutral-100 rounded-full font-medium">
            {selectedCount} seleccionados
          </span>
          {selection.totalLabels > 0 && (
            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
              {selection.totalLabels} etiquetas
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {bannerState && (
          <SelectionBanner
            state={bannerState}
            pageCount={pageItems.length}
            scopeCount={filtered.length}
            scopeSuffix={scopeSuffix}
            onSelectScope={() => selection.selectMany(filtered)}
            onDeselectScope={() => selection.deselectMany(filtered.map(p => p.id))}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase">
                <th className="px-3 py-2 text-left w-10">
                  <input
                    ref={headerRef}
                    type="checkbox"
                    aria-label="Seleccionar página"
                    checked={pageAll}
                    disabled={pageItems.length === 0}
                    onChange={() =>
                      pageAll
                        ? selection.deselectMany(pageItems.map(p => p.id))
                        : selection.selectMany(pageItems)
                    }
                  />
                </th>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-right">Precio</th>
                <th className="px-3 py-2 text-right w-24">Cantidad</th>
                <th className="px-3 py-2 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pageItems.map(p => (
                <PriceLabelRow
                  key={p.id}
                  product={p}
                  selected={selection.isSelected(p.id)}
                  qty={selection.getQty(p.id)}
                  onToggle={() => selection.toggleProduct(p)}
                  onQtyChange={qty => selection.setQty(p.id, qty)}
                />
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400 text-sm">
                    {emptyStateMessage(search, categoryId, onlySelected)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-neutral-200 text-sm text-neutral-600">
          <label htmlFor="pricelabels-page-size">Filas por página</label>
          <select
            id="pricelabels-page-size"
            value={pageSize}
            onChange={e => changePageSize(Number(e.target.value))}
            className="border border-neutral-300 rounded px-1.5 py-0.5"
          >
            {PAGE_SIZES.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <PaginationFooter
          page={currentPage}
          pageSize={pageSize}
          total={filtered.length}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
