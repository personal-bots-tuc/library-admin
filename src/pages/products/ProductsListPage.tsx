import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../../components/Modal';
import CreateProductModal from '../../components/CreateProductModal';
import CategoriesManagerModal from '../../components/CategoriesManagerModal';
import { money } from '../../lib/format';
import { unitMarginPercent, formatPercent } from '../../lib/profit';
import { getProductCounts, deleteProduct, type Product } from '../../api/products';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useSchool } from '../../hooks/useSchool';
import {
  fetchAllProducts,
  generateProductsReportHtml,
  printProductsReport,
  type ReportColumnKey,
} from './utils/printProductsReport';
import PrintReportModal from './components/PrintReportModal';
import { ProductsToolbar } from './components/ProductsToolbar';
import type { SortOption, TypeFilter } from './types';
import { useSearchContext } from './SearchContext';

const SORT_MAP: Record<SortOption, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
  'name-asc': { sortBy: 'name', sortOrder: 'asc' },
  'name-desc': { sortBy: 'name', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
  'stock-asc': { sortBy: 'stock', sortOrder: 'asc' },
  'stock-desc': { sortBy: 'stock', sortOrder: 'desc' },
};

export default function ProductsListPage() {
  const {
    products,
    total,
    totalPages,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    setTypeFilter,
    setLowStockOnly,
    setCategoryId,
    setSort,
    setSearch: setSearchProducts,
  } = useProducts();

  const { search, setSearch: _setSearch } = useSearchContext();

  // Sincronizar search del context (header) con useProducts (API)
  // Usamos ref para evitar loop infinito porque setSearchProducts es nueva cada render
  const prevSearchRef = useRef(search);
  useEffect(() => {
    if (prevSearchRef.current !== search) {
      prevSearchRef.current = search;
      setSearchProducts(search);
    }
  }, [search, setSearchProducts]);

  const [productCount, setProductCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [typeFilter, setTypeFilterState] = useState<TypeFilter>('all');
  const [lowStockOnly, setLowStockOnlyState] = useState(false);
  const [categoryId, setCategoryIdState] = useState<string | null>(null);
  const [sort, setSortState] = useState<SortOption>('name-asc');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const isInitialMountRef = useRef(true);
  const { schoolName } = useSchool();
  const { categories } = useCategories();
  const queryClient = useQueryClient();
  const categoryNameById = useMemo(
    () => new Map(categories.map(c => [c.id, c.name])),
    [categories]
  );

  // Fetch summary counts
  const fetchSummaryCounts = useCallback(async () => {
    try {
      const { productCount, serviceCount, lowStockCount } = await getProductCounts();
      setProductCount(productCount);
      setServiceCount(serviceCount);
      setLowStockCount(lowStockCount);
    } catch {
      setProductCount(0);
      setServiceCount(0);
      setLowStockCount(0);
    }
  }, []);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      fetchSummaryCounts();
    } else {
      fetchSummaryCounts();
    }
  }, [fetchSummaryCounts, refreshTrigger]);

  const handleTypeFilterChange = useCallback(
    (value: TypeFilter) => {
      setTypeFilterState(value);
      setTypeFilter(value);
    },
    [setTypeFilter]
  );

  const handleLowStockChange = useCallback(
    (value: boolean) => {
      setLowStockOnlyState(value);
      setLowStockOnly(value);
    },
    [setLowStockOnly]
  );

  const handleCategoryChange = useCallback(
    (value: string | null) => {
      setCategoryIdState(value);
      setCategoryId(value);
    },
    [setCategoryId]
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortState(value);
      const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
      setSort(sortBy, sortOrder);
    },
    [setSort]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
    },
    [setLimit]
  );

  const handlePrintReport = useCallback(
    async (columns: ReportColumnKey[]) => {
      setGenerating(true);
      const filters = { search: '', typeFilter, lowStockOnly, sort, categoryId };
      try {
        const items = await fetchAllProducts(filters, SORT_MAP);
        const html = generateProductsReportHtml({
          products: items,
          businessName: schoolName,
          filters,
          columns,
        });
        printProductsReport(html);
        setPrintModalOpen(false);
      } catch {
        // Error surfaceado por hook de listado en próximo refetch; sin crash en print
      } finally {
        setGenerating(false);
      }
    },
    [typeFilter, lowStockOnly, sort, categoryId, schoolName]
  );

  // Tras crear/editar, invalidar todas las listas de productos: el cache de
  // React Query (staleTime 60 s, persistido) no se entera del cambio solo.
  const handleProductSaved = useCallback(() => {
    handlePageChange(1);
    setRefreshTrigger(t => t + 1);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [handlePageChange, queryClient]);

  const handleResetFilters = useCallback(() => {
    handleLowStockChange(false);
    handleTypeFilterChange('all');
    handleCategoryChange(null);
    handleSortChange('name-asc');
    handlePageChange(1);
  }, [
    handleLowStockChange,
    handleTypeFilterChange,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
  ]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  async function handleDelete(product: Product) {
    try {
      await deleteProduct(product.id);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setRefreshTrigger(t => t + 1);
    } catch {
      // Error handled by hook
    } finally {
      setDeleteTarget(null);
    }
  }

  function stockLabel(p: Product) {
    if (p.type === 'service') return { text: '∞ Ilimitado', cls: 'text-success-600' };
    if (p.stock === 0) return { text: 'Sin stock', cls: 'text-danger-600' };
    if (p.stock <= (p.minStock ?? 10))
      return { text: `${p.stock} en stock`, cls: 'text-warning-600' };
    return { text: `${p.stock} en stock`, cls: 'text-neutral-600' };
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-danger-600">{error}</p>}

      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          handleProductSaved();
          setCreateModalOpen(false);
        }}
      />

      <Modal
        title="Editar producto"
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        size="md"
      >
        {editTarget && (
          <CreateProductModal
            isOpen={true}
            onClose={() => setEditTarget(null)}
            onSuccess={() => {
              handleProductSaved();
              setEditTarget(null);
            }}
            initialData={editTarget}
          />
        )}
      </Modal>

      <CategoriesManagerModal
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          icon="inventory_2"
          iconColor="bg-primary-100 text-primary-700"
          title="PRODUCTOS"
          value={productCount}
        />
        <SummaryCard
          icon="block"
          iconColor="bg-danger-100 text-danger-700"
          title="SERVICIOS"
          value={serviceCount}
        />
        <SummaryCard
          icon="warning"
          iconColor="bg-danger-100 text-danger-700"
          title="STOCK BAJO"
          value={lowStockCount}
        />
      </div>

      <ProductsToolbar
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeFilterChange}
        lowStockOnly={lowStockOnly}
        onLowStockChange={handleLowStockChange}
        categoryId={categoryId}
        categories={categories}
        onCategoryChange={handleCategoryChange}
        sort={sort}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        onOpenCategories={() => setCategoriesModalOpen(true)}
        onCreateProduct={() => setCreateModalOpen(true)}
        onPrint={() => setPrintModalOpen(true)}
        printDisabled={loading}
      />

      <div className="bg-white border border-neutral-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase">
              <th className="px-3 py-2 text-left">Producto</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-right">Costo</th>
              <th className="px-3 py-2 text-right">Margen</th>
              <th className="px-3 py-2 text-right">Stock</th>
              <th className="px-3 py-2 center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map(p => {
              const s = stockLabel(p);
              const categoryLabel =
                (p.categoryId && categoryNameById.get(p.categoryId)) || 'Sin categoría';
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3">
                    <div className="font-medium text-neutral-900">{p.name}</div>
                    {p.code && <span className="text-xs text-neutral-400">({p.code})</span>}
                    <div className="text-xs text-neutral-500">{categoryLabel}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.type === 'service'
                          ? 'bg-danger-100 text-danger-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {p.type === 'service' ? 'SERVICIO' : 'PRODUCTO'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">{money(p.price)}</td>
                  <td className="px-3 py-3 text-right">{p.cost ? money(p.cost) : '—'}</td>
                  <td className="px-3 py-3 text-right">
                    {p.cost !== undefined && p.cost > 0 ? (
                      <span className="text-sm text-neutral-600">
                        {formatPercent(unitMarginPercent(p.price, p.cost))}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right font-medium">{s.text}</td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => setEditTarget(p)}
                      className="ml-1 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 p-1 rounded-lg"
                      aria-label={`Editar ${p.name}`}
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="ml-1 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 p-1 rounded-lg"
                      aria-label={`Eliminar ${p.name}`}
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-400 text-sm">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-600">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Mostrando {from}-{to} de {total}
          </span>
          <select
            value={limit}
            onChange={e => handleLimitChange(Number(e.target.value))}
            className="border border-neutral-300 rounded px-1.5 py-0.5 text-sm"
          >
            {[8, 16, 32].map(n => (
              <option key={n} value={n}>
                {n} por página
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-icons text-sm">chevron_left</span>
          </button>
          {renderPageNumbers(totalPages, page, handlePageChange)}
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
            className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-icons text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {deleteTarget && (
        <Modal title="Confirmar eliminación" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              ¿Estás seguro de eliminar el producto{' '}
              <span className="font-semibold">"{deleteTarget.name}"</span>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 py-2.5 rounded-lg bg-danger-600 text-white font-medium hover:bg-danger-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

      <PrintReportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        onPrint={handlePrintReport}
        totalFiltered={total}
        generating={generating}
      />
    </div>
  );
}

function SummaryCard({
  icon,
  iconColor,
  title,
  value,
}: {
  icon: string;
  iconColor: string;
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-4">
      <span className={`material-icons text-2xl ${iconColor} rounded-lg p-1.5`}>{icon}</span>
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

type PageClickHandler = (_p: number) => void;

function shouldShowPage(n: number, totalPages: number, currentPage: number): boolean {
  if (totalPages <= 7) return true;
  if (n === 1 || n === totalPages) return true;
  if (n >= currentPage - 2 && n <= currentPage + 2) return true;
  return false;
}

function shouldShowStartEllipsis(n: number, totalPages: number, currentPage: number): boolean {
  return totalPages > 7 && n === currentPage - 2 && n !== 1;
}

function shouldShowEndEllipsis(n: number, totalPages: number, currentPage: number): boolean {
  return totalPages > 7 && n === currentPage + 2 && n !== totalPages;
}

function renderPageNumbers(
  totalPages: number,
  currentPage: number,
  onPageClick: PageClickHandler
): React.ReactNode {
  if (totalPages <= 1) return null;

  const pages: React.ReactNode[] = [];

  for (let n = 1; n <= totalPages; n++) {
    if (!shouldShowPage(n, totalPages, currentPage)) continue;

    if (shouldShowStartEllipsis(n, totalPages, currentPage)) {
      pages.push(
        <span key="start-ellipsis" className="px-1">
          …
        </span>
      );
      continue;
    }
    if (shouldShowEndEllipsis(n, totalPages, currentPage)) {
      pages.push(
        <span key="end-ellipsis" className="px-1">
          …
        </span>
      );
      continue;
    }
    pages.push(<PageBtn key={n} n={n} current={currentPage} onClick={() => onPageClick(n)} />);
  }

  return pages;
}

function PageBtn({ n, current, onClick }: { n: number; current: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
        n === current
          ? 'bg-primary-600 text-white border-primary-600'
          : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      {n}
    </button>
  );
}
