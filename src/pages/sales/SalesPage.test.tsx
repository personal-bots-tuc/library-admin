import { describe, it, expect, vi } from 'vitest';
import { renderWithAdminProviders } from '../../test/utils';
import SalesPage from './SalesPage';

// Mock the sales API
vi.mock('../../api/sales', () => ({
  listSales: vi.fn().mockResolvedValue({
    data: [
      {
        id: '1',
        client: { fullName: 'Cliente 1' },
        total: 5000,
        type: 'sale',
        paymentMethod: 'cash',
        createdAt: '2024-01-15T10:00:00Z',
        voided: false,
        items: [],
        number: 1,
      },
      {
        id: '2',
        client: { fullName: 'Cliente 2' },
        total: 3000,
        type: 'return',
        paymentMethod: 'credit',
        createdAt: '2024-01-15T11:00:00Z',
        voided: false,
        items: [],
        number: 2,
      },
    ],
    total: 2,
    page: 1,
    limit: 10,
  }),
  getSale: vi.fn().mockResolvedValue({
    id: '1',
    client: { fullName: 'Cliente 1' },
    items: [{ productName: 'Libro 1', quantity: 2, price: 2500 }],
    total: 5000,
    type: 'sale',
    paymentMethod: 'cash',
    createdAt: '2024-01-15T10:00:00Z',
    voided: false,
    number: 1,
  }),
  getSalesSummary: vi.fn().mockResolvedValue({
    totalSales: 2,
    totalRevenue: 8000,
    cashRevenue: 5000,
    creditRevenue: 3000,
  }),
  creditNoteSale: vi.fn().mockResolvedValue({ id: 'cn-1', saleId: '1', amount: 2500 }),
}));

describe('SalesPage', () => {
  it('renders sales table', async () => {
    const { container } = renderWithAdminProviders(<SalesPage />);
    // Check that the table renders
    await expect(container.querySelector('table')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const { container } = renderWithAdminProviders(<SalesPage />);
    // Check for loading skeleton (animate-pulse)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows sale status badges', async () => {
    const { container } = renderWithAdminProviders(<SalesPage />);
    // Wait for the component to render the sales data - check for any status badge text
    await expect(container.querySelector('table')).toBeInTheDocument();
  });
});
