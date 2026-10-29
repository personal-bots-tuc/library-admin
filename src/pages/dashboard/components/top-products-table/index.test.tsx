import { describe, it, expect } from 'vitest';
import { renderWithAdminProviders, screen } from '../../../../test/utils';
import { TopProductsTable } from './index';

describe('TopProductsTable', () => {
  it('debería mostrar "Sin ventas en el período" cuando no hay productos', () => {
    renderWithAdminProviders(<TopProductsTable products={[]} />);

    expect(screen.getByText('Sin ventas en el período')).toBeInTheDocument();
  });

  it('debería mostrar una fila por producto con sus unidades', () => {
    renderWithAdminProviders(
      <TopProductsTable
        products={[{ productId: '1', name: 'Cuaderno', quantity: 7, revenue: 3500 }]}
      />
    );

    expect(screen.getByText('Cuaderno')).toBeInTheDocument();
    expect(screen.getByText('7 un.')).toBeInTheDocument();
  });
});
