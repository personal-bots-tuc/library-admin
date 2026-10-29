import { describe, it, expect } from 'vitest';
import { filterPriceLabelProducts, paginate } from './filterProducts';

const products = [
  { id: '1', name: 'Cuaderno', code: 'PRD-1', categoryId: 'cat-a' },
  { id: '2', name: 'Lápiz', code: 'PRD-2', categoryId: 'cat-b' },
  { id: '3', name: 'Goma', code: null, categoryId: 'cat-a' },
] as const;

describe('filterPriceLabelProducts', () => {
  const base = {
    search: '',
    categoryId: null,
    onlySelected: false,
    selected: new Map<string, number>(),
  };

  it('devuelve todo sin filtros', () => {
    expect(filterPriceLabelProducts(products, base)).toHaveLength(3);
  });

  it('filtra por categoría', () => {
    const ids = filterPriceLabelProducts(products, { ...base, categoryId: 'cat-a' }).map(p => p.id);
    expect(ids).toEqual(['1', '3']);
  });

  it('busca por nombre o código sin distinguir mayúsculas', () => {
    expect(filterPriceLabelProducts(products, { ...base, search: 'prd-2' }).map(p => p.id)).toEqual(
      ['2']
    );
    expect(filterPriceLabelProducts(products, { ...base, search: 'cuad' }).map(p => p.id)).toEqual([
      '1',
    ]);
  });

  it('solo seleccionados muestra los marcados (combinable con categoría)', () => {
    const selected = new Map([
      ['1', 1],
      ['2', 1],
    ]);
    expect(
      filterPriceLabelProducts(products, { ...base, onlySelected: true, selected }).map(p => p.id)
    ).toEqual(['1', '2']);
    expect(
      filterPriceLabelProducts(products, {
        ...base,
        onlySelected: true,
        categoryId: 'cat-a',
        selected,
      }).map(p => p.id)
    ).toEqual(['1']);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 60 }, (_, i) => i);

  it('parte en páginas y calcula el total de páginas', () => {
    const res = paginate(items, 2, 25);
    expect(res.totalPages).toBe(3);
    expect(res.page).toBe(2);
    expect(res.pageItems[0]).toBe(25);
    expect(res.pageItems).toHaveLength(25);
  });

  it('ajusta la página si queda fuera de rango', () => {
    const res = paginate(items, 99, 25);
    expect(res.page).toBe(3);
    expect(res.pageItems[0]).toBe(50);
  });

  it('con lista vacía devuelve una página vacía', () => {
    const res = paginate([], 4, 25);
    expect(res).toEqual({ pageItems: [], page: 1, totalPages: 1 });
  });
});
