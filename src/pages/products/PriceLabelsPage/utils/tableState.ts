import type { CategoryOption } from '../../types';

export interface ScopeFlags {
  pageAll: boolean;
  scopeAll: boolean;
  scopeIsMultiPage: boolean;
}

/**
 * Qué banner de selección mostrar:
 * - "offer": la página está completa y hay más resultados fuera de ella.
 * - "selected": todo el alcance (filtrado) ya está marcado y ocupa varias páginas.
 */
export function getScopeBannerState({ pageAll, scopeAll, scopeIsMultiPage }: ScopeFlags) {
  if (!scopeIsMultiPage) return null;
  if (scopeAll) return 'selected' as const;
  return pageAll ? ('offer' as const) : null;
}

export function findCategoryName(categories: CategoryOption[], categoryId: string | null) {
  return categories.find(c => c.id === categoryId)?.name ?? null;
}

export function emptyStateMessage(
  search: string,
  categoryId: string | null,
  onlySelected: boolean
) {
  return search.trim() || categoryId || onlySelected
    ? 'No se encontraron productos con ese criterio'
    : 'No hay productos disponibles';
}

/** Alcance que nombra el banner: categoría, filtros activos o todo el catálogo. */
export function buildScopeSuffix(categoryName: string | null, hasFilters: boolean): string {
  if (categoryName) return ` de «${categoryName}»`;
  return hasFilters ? ' de los filtrados' : ' del catálogo';
}
