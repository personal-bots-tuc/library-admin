import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import PriceLabelsPage from './PriceLabelsPage';

let catalog: Array<{
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  type: 'product';
  categoryId: string;
}> = [];

vi.mock('../../../hooks/useAllProducts', () => ({
  useAllProducts: () => ({ products: catalog, loading: false, error: null, refetch: vi.fn() }),
}));
vi.mock('../../../hooks/useSchool', () => ({
  useSchool: () => ({ school: { name: 'Escuela' } }),
}));
vi.mock('../../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [{ id: 'cat-1', name: 'Útiles' }],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const make = (i: number) => ({
  id: `p${i}`,
  name: `Producto ${i}`,
  code: `PRD-${i}`,
  price: 1000,
  stock: 5,
  type: 'product' as const,
  categoryId: 'cat-1',
});

describe('PriceLabelsPage — la selección sobrevive a cambios del catálogo', () => {
  beforeEach(() => {
    catalog = [make(1), make(2), make(3)];
  });

  it('un refetch que cambia la cantidad de productos no borra lo seleccionado', async () => {
    const { rerender } = render(<PriceLabelsPage />);
    const table = screen.getByRole('table');
    const rowOf = (name: string) => within(table).getByText(name).closest('tr') as HTMLElement;

    fireEvent.click(within(rowOf('Producto 1')).getByRole('checkbox'));
    expect(within(rowOf('Producto 1')).getByRole('checkbox')).toBeChecked();

    // Llega un producto nuevo al catálogo
    catalog = [...catalog, make(4)];
    rerender(<PriceLabelsPage />);

    await waitFor(() => expect(within(rowOf('Producto 1')).getByRole('checkbox')).toBeChecked());
  });
});
