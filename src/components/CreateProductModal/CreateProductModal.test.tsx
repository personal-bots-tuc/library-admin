import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateProductModal from './index';
import { renderWithAdminProviders } from '../../test/utils';
import { listCategories, createCategory } from '../../api/categories';

vi.mock('../../api/products', () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

vi.mock('../../api/categories', () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

describe('CreateProductModal — categoría recién creada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('una categoría creada desde el modal aparece en el select sin recargar la página', async () => {
    vi.mocked(listCategories)
      .mockResolvedValueOnce([])
      .mockResolvedValue([{ id: 'cat-9', name: 'Librería', active: true }]);
    vi.mocked(createCategory).mockResolvedValue({
      id: 'cat-9',
      name: 'Librería',
      active: true,
    });

    const user = userEvent.setup();
    renderWithAdminProviders(<CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.click(screen.getByTitle('Nueva categoría'));
    await user.type(screen.getByPlaceholderText('Ej: Útiles escolares'), 'Librería');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Librería' })).toBeInTheDocument();
    });
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveValue('cat-9');
  });
});
