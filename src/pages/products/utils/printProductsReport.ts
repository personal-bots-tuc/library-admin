import { listProducts, type Product, type ListProductsParams } from '../../../api/products';
import { money } from '../../../lib/format';
import { unitMarginPercent, formatPercent } from '../../../lib/profit';

const PAGE_SIZE = 100;
const MAX_PAGES_SAFETY = 50;

export interface ProductsReportFilters {
  search: string;
  typeFilter: 'all' | 'product' | 'service';
  lowStockOnly: boolean;
  sort: string;
}

export interface ProductsReportOptions {
  products: Product[];
  businessName: string;
  filters: ProductsReportFilters;
  generatedAt?: Date;
}

/** Fetch all pages of products with the current filters (loop limit=100). */
export async function fetchAllProducts(
  filters: ProductsReportFilters,
  sortMap: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }>
): Promise<Product[]> {
  const base: ListProductsParams = {
    active: true,
    limit: PAGE_SIZE,
    ...sortMap[filters.sort],
  };
  if (filters.search.trim()) base.search = filters.search.trim();
  if (filters.typeFilter !== 'all') base.type = filters.typeFilter;
  if (filters.lowStockOnly) base.lowStock = true;

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

function rowHtml(p: Product): string {
  const typeBadge =
    p.type === 'service'
      ? '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#fee2e2;color:#991b1b;">SERVICIO</span>'
      : '<span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#dbeafe;color:#1e40af;">PRODUCTO</span>';
  return `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:6px 8px;font-size:11px;">${escapeHtml(p.name)}</td>
      <td style="padding:6px 8px;font-size:11px;font-family:monospace;">${escapeHtml(p.code ?? '—')}</td>
      <td style="padding:6px 8px;text-align:center;">${typeBadge}</td>
      <td style="padding:6px 8px;text-align:right;font-size:11px;">${money(p.price)}</td>
      <td style="padding:6px 8px;text-align:right;font-size:11px;">${p.cost ? money(p.cost) : '—'}</td>
      <td style="padding:6px 8px;text-align:right;font-size:11px;">${marginDisplay(p)}</td>
      <td style="padding:6px 8px;text-align:right;font-size:11px;">${stockDisplay(p)}</td>
    </tr>`;
}

export function generateProductsReportHtml(options: ProductsReportOptions): string {
  const { products, businessName, filters } = options;
  const generatedAt = options.generatedAt ?? new Date();
  const summary = filtersSummary(filters);

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
      <tr>
        <th style="width:28%;">Producto</th>
        <th style="width:12%;">Código</th>
        <th style="width:11%;">Tipo</th>
        <th style="width:12%;text-align:right;">Precio</th>
        <th style="width:12%;text-align:right;">Costo</th>
        <th style="width:11%;text-align:right;">Margen</th>
        <th style="width:14%;text-align:right;">Stock</th>
      </tr>
    </thead>
    <tbody>
      ${products.map(rowHtml).join('')}
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
