import { describe, it, expect, vi } from 'vitest';
import { renderWithAdminProviders, screen, within } from '../../test/utils';
import SalesPage from './SalesPage';

// Mock the sales API
vi.mock('../../api/sales', () => ({
  listSales: vi.fn().mockResolvedValue({
    items: [
      {
        id: '1',
        number: 1,
        type: 'sale',
        voided: false,
        paymentMethod: 'cash',
        subtotal: 5000,
        discount: 0,
        total: 5000,
        amountReceived: 5000,
        change: 0,
        client: { id: 'c1', fullName: 'Cliente 1', balance: 0 },
        seller: { id: 'u1', name: 'Vendedor 1', role: 'seller' },
        items: [],
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        number: 2,
        type: 'return',
        voided: false,
        paymentMethod: 'credit',
        subtotal: 3000,
        discount: 0,
        total: 3000,
        amountReceived: 0,
        change: 0,
        client: { id: 'c2', fullName: 'Cliente 2', balance: 0 },
        seller: { id: 'u1', name: 'Vendedor 1', role: 'seller' },
        items: [],
        createdAt: '2024-01-16T11:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  }),
  getSale: vi.fn().mockResolvedValue({
    id: '1',
    number: 1,
    type: 'sale',
    voided: false,
    paymentMethod: 'cash',
    subtotal: 5000,
    discount: 0,
    total: 5000,
    amountReceived: 5000,
    change: 0,
    client: { id: 'c1', fullName: 'Cliente 1', balance: 0 },
    seller: { id: 'u1', name: 'Vendedor 1', role: 'seller' },
    items: [
      {
        product: 'p1',
        name: 'Libro 1',
        type: 'product',
        quantity: 2,
        unitPrice: 2500,
        subtotal: 5000,
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
  }),
  getSalesSummary: vi.fn().mockResolvedValue({
    salesToday: 2,
    salesGrowth: 0,
    totalRevenue: 8000,
    returnsCount: 0,
    returnsAmount: 0,
    averageTicket: 4000,
  }),
  creditNoteSale: vi.fn().mockResolvedValue({ id: 'cn-1', saleId: '1', amount: 2500 }),
}));

describe('SalesPage', () => {
  it('renders sales table with loaded rows', async () => {
    renderWithAdminProviders(<SalesPage />);
    await screen.findByText('Cliente 1');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const { container } = renderWithAdminProviders(<SalesPage />);
    // Check for loading skeleton (animate-pulse)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows sale status badges', async () => {
    renderWithAdminProviders(<SalesPage />);
    await screen.findByText('Cliente 1');
    expect(screen.getByText('VENTA')).toBeInTheDocument();
    expect(screen.getByText('DEVOLUCIÓN')).toBeInTheDocument();
  });

  it('renders date and time for each sale row', async () => {
    renderWithAdminProviders(<SalesPage />);
    // Helpers: mismas funciones/locale del componente → timezone-agnostic.
    // Las ventas están a >24h de distancia → nunca comparten fecha local en ningún timezone.
    const fmtDate = (d: Date) =>
      d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    // ICU puede emitir NBSP (\u00a0) antes de "a. m."; Testing Library lo colapsa a espacio al normalizar el DOM
    const fmtTime = (d: Date) =>
      d
        .toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
        .replace(/\s+/g, ' ')
        .trim();

    const row1 = (await screen.findByText('Cliente 1')).closest('tr');
    const row2 = (await screen.findByText('Cliente 2')).closest('tr');
    expect(row1).not.toBeNull();
    expect(row2).not.toBeNull();

    const date1 = new Date('2024-01-15T10:00:00Z');
    const date2 = new Date('2024-01-16T11:00:00Z');
    expect(within(row1 as HTMLElement).getByText(fmtDate(date1))).toBeInTheDocument();
    expect(within(row1 as HTMLElement).getByText(fmtTime(date1))).toBeInTheDocument();
    expect(within(row2 as HTMLElement).getByText(fmtDate(date2))).toBeInTheDocument();
    expect(within(row2 as HTMLElement).getByText(fmtTime(date2))).toBeInTheDocument();
  });
});
