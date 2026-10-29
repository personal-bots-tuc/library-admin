export interface PriceLabelFilterable {
  id: string;
  name: string;
  code?: string | null;
  categoryId?: string | null;
}

export interface PriceLabelFilters {
  search: string;
  categoryId: string | null;
  onlySelected: boolean;
  selected: Map<string, number>;
}

/** Filtra por búsqueda (nombre o código), categoría y "solo seleccionados". Pura. */
export function filterPriceLabelProducts<T extends PriceLabelFilterable>(
  products: readonly T[],
  filters: PriceLabelFilters
): T[] {
  const term = filters.search.trim().toLowerCase();
  return products.filter(
    p =>
      (!term ||
        p.name.toLowerCase().includes(term) ||
        (p.code ?? '').toLowerCase().includes(term)) &&
      (!filters.categoryId || p.categoryId === filters.categoryId) &&
      (!filters.onlySelected || filters.selected.has(p.id))
  );
}

/** Parte la lista en páginas; ajusta la página si queda fuera de rango. Pura. */
export function paginate<T>(items: readonly T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
  };
}
