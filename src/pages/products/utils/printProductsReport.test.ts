import { describe, it, expect, vi } from 'vitest';
import {
  fetchAllProducts,
  generateProductsReportHtml,
  stockDisplay,
  marginDisplay,
  type ProductsReportFilters,
} from './printProductsReport';
import { listProducts, type Product, type ProductListResponse } from '../../../api/products';

vi.mock('../../../api/products');

const mockListProducts = vi.mocked(listProducts);

const baseProduct: Product = {
  id: '1',
  name: 'Cuaderno A4',
  type: 'product',
  price: 1500,
  cost: 900,
  stock: 25,
  code: 'PRD-00001',
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const noFilters: ProductsReportFilters = {
  search: '',
  typeFilter: 'all',
  lowStockOnly: false,
  sort: 'name-asc',
};

const SORT_MAP: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
  'name-asc': { sortBy: 'name', sortOrder: 'asc' },
  'name-desc': { sortBy: 'name', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
  'stock-asc': { sortBy: 'stock', sortOrder: 'asc' },
  'stock-desc': { sortBy: 'stock', sortOrder: 'desc' },
};

describe('printProductsReport', () => {
  describe('stockDisplay', () => {
    it('muestra ilimitado para servicios', () => {
      expect(stockDisplay({ ...baseProduct, type: 'service', stock: 0 })).toBe('∞ Ilimitado');
    });
    it('marca sin stock cuando stock es 0', () => {
      expect(stockDisplay({ ...baseProduct, stock: 0 })).toBe('Sin stock');
    });
    it('marca BAJO cuando stock <= minStock', () => {
      expect(stockDisplay({ ...baseProduct, stock: 5, minStock: 10 })).toBe('5 (BAJO)');
    });
    it('muestra stock normal por defecto', () => {
      expect(stockDisplay(baseProduct)).toBe('25');
    });
  });

  describe('marginDisplay', () => {
    it('calcula margen cuando hay costo', () => {
      // (1500 - 900) / 1500 = 40%
      expect(marginDisplay(baseProduct)).toBe('40.0%');
    });
    it('devuelve — cuando no hay costo', () => {
      expect(marginDisplay({ ...baseProduct, cost: undefined })).toBe('—');
    });
  });

  describe('generateProductsReportHtml', () => {
    it('incluye nombre de negocio, título y meta', () => {
      const html = generateProductsReportHtml({
        products: [baseProduct],
        businessName: 'Sucursal Centro',
        filters: noFilters,
        generatedAt: new Date('2026-10-12T10:00:00Z'),
      });
      expect(html).toContain('Sucursal Centro');
      expect(html).toContain('Listado de Productos');
      expect(html).toContain('1 ítems');
      expect(html).toContain('Cuaderno A4');
      expect(html).toContain('PRD-00001');
      expect(html).toContain('window.print()');
    });

    it('lista filtros aplicados en el resumen', () => {
      const html = generateProductsReportHtml({
        products: [baseProduct],
        businessName: 'Negocio',
        filters: { search: 'lapiz', typeFilter: 'product', lowStockOnly: true, sort: 'price-asc' },
      });
      expect(html).toContain('Búsqueda: &quot;lapiz&quot;');
      expect(html).toContain('Tipo: Productos');
      expect(html).toContain('Solo stock bajo');
    });

    it('escapa HTML malicioso en nombres', () => {
      const html = generateProductsReportHtml({
        products: [{ ...baseProduct, name: '<script>alert("x")</script>' }],
        businessName: 'Negocio',
        filters: noFilters,
      });
      expect(html).not.toContain('<script>alert("x")</script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('fetchAllProducts', () => {
    const pageResponse = (page: number, totalPages: number): Promise<ProductListResponse> =>
      Promise.resolve({
        items: page <= totalPages ? [{ ...baseProduct, id: `p${page}` }] : [],
        total: totalPages * 100,
        page,
        limit: 100,
        totalPages,
      });

    it('itera todas las páginas hasta completar', async () => {
      mockListProducts.mockImplementation(({ page }: { page?: number }) =>
        pageResponse(page ?? 1, 3)
      );

      const items = await fetchAllProducts(noFilters, SORT_MAP);

      expect(items).toHaveLength(3);
      expect(mockListProducts).toHaveBeenCalledTimes(3);
      expect(mockListProducts).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          page: 1,
          limit: 100,
          active: true,
          sortBy: 'name',
          sortOrder: 'asc',
        })
      );
    });

    it('aplica filtros de búsqueda, tipo y stock bajo', async () => {
      mockListProducts.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 1,
      });

      await fetchAllProducts(
        { search: ' lapiz ', typeFilter: 'product', lowStockOnly: true, sort: 'name-asc' },
        SORT_MAP
      );

      expect(mockListProducts).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'lapiz', type: 'product', lowStock: true })
      );
    });
  });
});
