import { describe, it, expect, vi } from 'vitest';
import { renderWithAdminProviders } from '../../test/utils';
import CreateProductModal from './index';

describe('CreateProductModal', () => {
  it('renders create title when no initialData', () => {
    const { getByRole } = renderWithAdminProviders(
      <CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    const heading = getByRole('heading', { name: 'Crear producto' });
    expect(heading).toBeTruthy();
  });

  it('renders edit title when initialData provided', () => {
    const initialData = { id: '1', name: 'Test', type: 'product' as const, price: 10, stock: 5 };
    const { getByRole } = renderWithAdminProviders(
      <CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} initialData={initialData} />
    );
    const heading = getByRole('heading', { name: 'Editar producto' });
    expect(heading).toBeTruthy();
  });
});
