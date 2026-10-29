import { listProducts, type Product, type ListProductsParams } from '../../../api/products';
import { money } from '../../../lib/format';
import { unitMarginPercent, formatPercent } from '../../../lib/profit';

const PAGE_SIZE = 100;
const MAX_PAGES_SAFETY = 50;

export type ReportColumnKey =
  'producto' | 'codigo' | 'tipo' | 'precio' | 'costo' | 'margen' | 'stock';

export interface ReportColumnDef {
  key: ReportColumnKey;
  label: string;
  align: 'left' | 'center' | 'right';
  width: string;
  render: (p: Product) => string;
}

export const REPORT_COLUMNS: Record<ReportColumnKey, ReportColumnDef> = {
  producto: {
    key: 'producto',
    label: 'Producto',
    align: 'left',
    width: '30%',
    render: p => escapeHtml(p.name),
  },
  codigo: {
    key: 'codigo',
    label: 'Código',
    align: 'left',
    width: '14%',
    render: p => `<span style="font-family:monospace;">${escapeHtml(p.code ?? '—')}</span>`,
  },
  tipo: {
    key: 'tipo',
    label: 'Tipo',
    align: 'center',
    width: '12%',
    render: p => typeBadge(p),
  },
  precio: {
    key: 'precio',
    label: 'Precio',
    align: 'right',
    width: '14%',
    render: p => money(p.price),
  },
  costo: {
    key: 'costo',
    label: 'Costo',
    align: 'right',
    width: '12%',
    render: p => (p.cost ? money(p.cost) : '—'),
  },
  margen: {
    key: 'margen',
    label: 'Margen',
    align: 'right',
    width: '10%',
    render: p => marginDisplay(p),
  },
  stock: {
    key: 'stock',
    label: 'Stock',
    align: 'right',
    width: '14%',
    render: p => stockDisplay(p),
  },
};

/** Default: columnas de control de stock (sin costo/margen). */
export const DEFAULT_REPORT_COLUMNS: ReportColumnKey[] = [
  'producto',
  'codigo',
  'tipo',
  'precio',
  'stock',
];

export interface ProductsReportFilters {
  search: string;
  typeFilter: 'all' | 'product' | 'service';
  lowStockOnly: boolean;
  sort: string;
  categoryId?: string | null;
}

export interface ProductsReportOptions {
  products: Product[];
  businessName: string;
  filters: ProductsReportFilters;
  columns?: ReportColumnKey[];
  generatedAt?: Date;
}

/** Parámetros de listado que usa el reporte (sin paginación). Compartido por la impresión y el conteo. */
export function buildReportListParams(
  filters: ProductsReportFilters,
  sortMap: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }>
): ListProductsParams {
  const base: ListProductsParams = {
    active: true,
    limit: PAGE_SIZE,
    ...sortMap[filters.sort],
  };
  if (filters.search.trim()) base.search = filters.search.trim();
  if (filters.typeFilter !== 'all') base.type = filters.typeFilter;
  if (filters.lowStockOnly) base.lowStock = true;
  if (filters.categoryId) base.categoryId = filters.categoryId;
  return base;
}

/** Fetch all pages of products with the current filters (loop limit=100). */
export async function fetchAllProducts(
  filters: ProductsReportFilters,
  sortMap: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }>
): Promise<Product[]> {
  const base = buildReportListParams(filters, sortMap);

  const items: Product[] = [];
  let page = 1;
  let totalPages: number;
  do {
    const data = await listProducts({ ...base, page });
    items.push(...data.items);
    totalPages = data.totalPages;
    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES_SAFETY);

  return items;
}

export function stockDisplay(p: Product): string {
  if (p.type === 'service') return '∞ Ilimitado';
  if (p.stock === 0) return 'Sin stock';
  if (p.stock <= (p.minStock ?? 10)) return `${p.stock} (BAJO)`;
  return String(p.stock);
}

export function marginDisplay(p: Product): string {
  if (p.cost !== undefined && p.cost > 0) {
    return formatPercent(unitMarginPercent(p.price, p.cost));
  }
  return '—';
}

function typeBadge(p: Product): string {
  return p.type === 'service'
    ? '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#fee2e2;color:#991b1b;">SERVICIO</span>'
    : '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#dbeafe;color:#1e40af;">PRODUCTO</span>';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function filtersSummary(filters: ProductsReportFilters): string {
  const parts = [
    filters.search.trim() && `Búsqueda: "${filters.search.trim()}"`,
    filters.typeFilter !== 'all' &&
      `Tipo: ${filters.typeFilter === 'product' ? 'Productos' : 'Servicios'}`,
    filters.lowStockOnly && 'Solo stock bajo',
  ].filter(Boolean);
  return parts.join(' · ');
}

function headerHtml(columns: ReportColumnDef[]): string {
  return columns
    .map(c => `<th style="width:${c.width};text-align:${c.align};">${escapeHtml(c.label)}</th>`)
    .join('');
}

function rowHtml(p: Product, columns: ReportColumnDef[]): string {
  const cells = columns
    .map(
      c => `<td style="padding:6px 8px;font-size:11px;text-align:${c.align};">${c.render(p)}</td>`
    )
    .join('');
  return `<tr style="border-bottom:1px solid #e5e7eb;">${cells}</tr>`;
}

export function generateProductsReportHtml(options: ProductsReportOptions): string {
  const { products, businessName, filters } = options;
  const generatedAt = options.generatedAt ?? new Date();
  const summary = filtersSummary(filters);
  const columns = (options.columns ?? DEFAULT_REPORT_COLUMNS).map(k => REPORT_COLUMNS[k]);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Listado de Productos - ${escapeHtml(businessName)}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.4; color: #1f2937; }
    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1f2937; padding-bottom: 10px; }
    .business-name { font-size: 18px; font-weight: 700; }
    .report-title { font-size: 16px; font-weight: 600; color: #374151; margin-top: 4px; }
    .meta { font-size: 10px; color: #6b7280; margin-top: 8px; }
    .filters { font-size: 9px; color: #9ca3af; margin-top: 4px; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background: #f3f4f6; text-align: left; padding: 8px; font-weight: 600; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #d1d5db; }
    @media print {
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body onload="window.print(); setTimeout(function(){ window.close(); }, 500);">
  <div class="header">
    <div class="business-name">${escapeHtml(businessName)}</div>
    <div class="report-title">Listado de Productos</div>
    <div class="meta">Generado: ${generatedAt.toLocaleString('es-AR')} · ${products.length} ítems</div>
    ${summary ? `<div class="filters">Filtros: ${escapeHtml(summary)}</div>` : ''}
  </div>
  <table>
    <thead>
      <tr>${headerHtml(columns)}</tr>
    </thead>
    <tbody>
      ${products.map(p => rowHtml(p, columns)).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

/** Opens a print window with the generated report. */
export function printProductsReport(html: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
}
