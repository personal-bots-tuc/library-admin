import { describe, it, expect, vi } from 'vitest';
import { renderWithAdminProviders } from '../../test/utils';
import CategoriesManagerModal from './index';

describe('CategoriesManagerModal', () => {
  it('renders modal title', () => {
    const { getByRole } = renderWithAdminProviders(
      <CategoriesManagerModal isOpen onClose={vi.fn()} />
    );
    expect(getByRole('heading', { name: 'Categorías' })).toBeTruthy();
  });

  it('shows empty state when no categories', () => {
    const { getByText } = renderWithAdminProviders(
      <CategoriesManagerModal isOpen onClose={vi.fn()} />
    );
    expect(getByText('Gestiona las categorías de productos')).toBeTruthy();
  });
});
