import { describe, it, expect, vi } from 'vitest';
import { renderWithAdminProviders } from '../../test/utils';
import { CategoryQuickCreate } from './index';
import { createCategory } from '../../api/categories';

vi.mock('../../api/categories', () => ({
  createCategory: vi.fn(),
}));

describe('CategoryQuickCreate', () => {
  it('renders modal when open', () => {
    const { getByText } = renderWithAdminProviders(
      <CategoryQuickCreate isOpen onClose={vi.fn()} onCreated={vi.fn()} />
    );
    expect(getByText('Nueva categoría')).toBeTruthy();
  });

  it('renders create button disabled when name empty', () => {
    const { getByText } = renderWithAdminProviders(
      <CategoryQuickCreate isOpen onClose={vi.fn()} onCreated={vi.fn()} />
    );
    const btn = getByText('Crear');
    expect(btn).toBeDisabled();
  });
});
