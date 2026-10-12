import { useState, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import CreateProductModal from '../../components/CreateProductModal';
import { money } from '../../lib/format';
import { unitMarginPercent, formatPercent } from '../../lib/profit';
import { deleteProduct, type Product } from '../../api/products';
import { useSchool } from '../../hooks/useSchool';
import {
  useProductsList,
  SORT_MAP,
  SORT_LABELS,
  type TypeFilter,
  type SortOption,
} from './hooks/useProductsList';
import Pagination from './components/Pagination';
import {
  fetchAllProducts,
  generateProductsReportHtml,
  printProductsReport,
} from './utils/printProductsReport';

export default function ProductsPage() {
  const {
    products,
    total,
    totalPages,
    summary,
    page,
    limit,
    search,
    typeFilter,
    lowStockOnly,
    sort,
    loading,
    error,
    setPage,
    setLimit,
    setSearch,
    setTypeFilter,
    setLowStockOnly,
    setSort,
    setError,
    removeProduct,
    refreshSummary,
  } = useProductsList();

  const { schoolName } = useSchool();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [printing, setPrinting] = useState(false);

  const handlePrintReport = useCallback(async () => {
    setPrinting(true);
    try {
      const allItems = await fetchAllProducts({ search, typeFilter, lowStockOnly, sort }, SORT_MAP);
      const html = generateProductsReportHtml({
        products: allItems,
        businessName: schoolName,
        filters: { search, typeFilter, lowStockOnly, sort },
      });
      printProductsReport(html);
    } catch {
      setError('Error al generar el reporte de productos');
    } finally {
      setPrinting(false);
    }
  }, [search, typeFilter, lowStockOnly, sort, schoolName, setError]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(prev =>
      prev.size === products.length ? new Set() : new Set(products.map(p => p.id))
    );
  }, [products]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setLowStockOnly(false);
    setTypeFilter('all');
    setSort('name-asc');
    setPage(1);
  }, [setSearch, setLowStockOnly, setTypeFilter, setSort, setPage]);

  const onMutationSuccess = useCallback(() => {
    setPage(1);
    refreshSummary();
  }, [setPage, refreshSummary]);

  async function handleDelete(product: Product) {
    try {
      await deleteProduct(product.id);
      removeProduct(product.id);
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      refreshSummary();
    } catch {
      setError('Error al eliminar el producto');
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
    <div className="p-6 space-y-6">
      <PageHeader
        title="Productos"
        subtitle={`Gestión de productos y servicios - ${summary.productCount + summary.serviceCount} activos`}
        searchPlaceholder="Buscar... (/)"
        searchValue={search}
        onSearchChange={value => {
          setSearch(value);
          setPage(1);
        }}
        primaryAction={{
          label: 'Nuevo producto',
          icon: 'add',
          onClick: () => setCreateModalOpen(true),
        }}
      />

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <CreateProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          onMutationSuccess();
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
              onMutationSuccess();
              setEditTarget(null);
            }}
            initialData={editTarget}
          />
        )}
      </Modal>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          icon="inventory_2"
          iconColor="bg-primary-100 text-primary-700"
          title="PRODUCTOS"
          value={summary.productCount}
        />
        <SummaryCard
          icon="block"
          iconColor="bg-danger-100 text-danger-700"
          title="SERVICIOS"
          value={summary.serviceCount}
        />
        <SummaryCard
          icon="warning"
          iconColor="bg-danger-100 text-danger-700"
          title="STOCK BAJO"
          value={summary.lowStockCount}
        />
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
          {(['all', 'product', 'service'] as TypeFilter[]).map(t => (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(t);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-white shadow border border-neutral-200 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {t === 'all' ? 'Todos' : t === 'product' ? 'Productos' : 'Servicios'}
            </button>
          ))}
        </div>

        <select
          value={lowStockOnly ? 'true' : 'false'}
          onChange={e => {
            setLowStockOnly(e.target.value === 'true');
            setPage(1);
          }}
          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700 focus:border-primary-500 focus:outline-none"
        >
          <option value="false">Estado de Stock</option>
          <option value="true">Solo stock bajo</option>
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-700 focus:border-primary-500 focus:outline-none"
        >
          {Object.entries(SORT_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <button onClick={clearFilters} className="text-xs text-neutral-500 hover:text-neutral-700">
          Limpiar filtros
        </button>

        <button
          onClick={handlePrintReport}
          disabled={printing || loading}
          className="ml-auto px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          aria-label="Imprimir listado de productos"
        >
          <span className="material-icons text-sm">print</span>
          {printing ? 'Generando…' : 'Imprimir listado'}
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase">
              <th className="px-3 py-2 text-left w-8">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selected.size === products.length}
                  onChange={toggleAll}
                />
              </th>
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
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-neutral-900">{p.name}</div>
                    {p.code && <span className="text-xs text-neutral-400">({p.code})</span>}
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
                <td colSpan={8} className="py-8 text-center text-neutral-400 text-sm">
                  No se encontraron productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        total={total}
        totalPages={totalPages}
        page={page}
        limit={limit}
        loading={loading}
        onPageChange={setPage}
        onLimitChange={newLimit => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

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
