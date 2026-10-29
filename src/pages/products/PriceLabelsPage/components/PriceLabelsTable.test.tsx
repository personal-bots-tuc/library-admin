import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PriceLabelsTable from './PriceLabelsTable';
import { usePriceLabelsSelection } from '../hooks/usePriceLabelsSelection';

// 60 productos: 30 en cat-1 (índices pares) y 30 en cat-2 (impares). Página = 25.
const products = Array.from({ length: 60 }, (_, i) => ({
  id: `p${i}`,
  name: `Producto ${i}`,
  code: `PRD-${i}`,
  price: 1000,
  stock: 5,
  type: 'product' as const,
  categoryId: i % 2 === 0 ? 'cat-1' : 'cat-2',
}));

const categories = [
  { id: 'cat-1', name: 'Útiles' },
  { id: 'cat-2', name: 'Librería' },
];

function Harness() {
  const selection = usePriceLabelsSelection();
  return <PriceLabelsTable products={products} categories={categories} selection={selection} />;
}

const rowCheckboxes = () => screen.getAllByRole('checkbox').slice(1); // el 0 es el de encabezado

describe('PriceLabelsTable — filtro, paginación y selección entre páginas', () => {
  it('filtra por categoría y muestra el total filtrado', async () => {
    render(<Harness />);
    expect(screen.getByText('60 productos')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Filtrar por categoría' }), {
      target: { value: 'cat-1' },
    });
    expect(await screen.findByText('30 productos')).toBeInTheDocument();
  });

  it('el encabezado selecciona solo la página visible y ofrece seleccionar toda la categoría', () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Filtrar por categoría' }), {
      target: { value: 'cat-1' },
    });
    // Página 1 = 25 filas
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByText('25 seleccionados')).toBeInTheDocument();

    const banner = screen.getByRole('button', { name: /seleccionar los 30/i });
    expect(banner).toBeInTheDocument();
  });

  it('al aceptar el banner selecciona los 30 aunque estén en otra página y se conservan al navegar', () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Filtrar por categoría' }), {
      target: { value: 'cat-1' },
    });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByRole('button', { name: /seleccionar los 30/i }));

    expect(screen.getByText('30 seleccionados')).toBeInTheDocument();

    // Página 2: los 5 restantes de la categoría aparecen marcados
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    const page2 = rowCheckboxes();
    expect(page2).toHaveLength(5);
    page2.forEach(cb => expect(cb).toBeChecked());
  });

  it('cambiar de categoría conserva la selección hecha en la otra', () => {
    render(<Harness />);
    const select = screen.getByRole('combobox', { name: 'Filtrar por categoría' });
    fireEvent.change(select, { target: { value: 'cat-1' } });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    fireEvent.click(screen.getByRole('button', { name: /seleccionar los 30/i }));

    fireEvent.change(select, { target: { value: 'cat-2' } });
    expect(screen.getByText('30 seleccionados')).toBeInTheDocument();
  });

  it("'Solo seleccionados' muestra únicamente los marcados", () => {
    render(<Harness />);
    fireEvent.click(rowCheckboxes()[0]);
    fireEvent.click(rowCheckboxes()[1]);
    fireEvent.click(screen.getByRole('button', { name: /solo seleccionados/i }));
    expect(screen.getByText('2 productos')).toBeInTheDocument();
  });

  it('sin filtros, el banner habla del catálogo y no de una búsqueda', () => {
    render(<Harness />);
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(
      screen.getByRole('button', { name: /seleccionar los 60 del catálogo/i })
    ).toBeInTheDocument();
  });

  it('muestra el alcance de la categoría en el banner (conteo y nombre)', () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Filtrar por categoría' }), {
      target: { value: 'cat-1' },
    });
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    const banner = screen.getByRole('button', { name: /seleccionar los 30/i });
    expect(within(banner.parentElement!).getByText(/Útiles/)).toBeInTheDocument();
  });
});
