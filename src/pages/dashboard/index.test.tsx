import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, renderWithAdminProviders, screen, waitFor } from '../../test/utils';
import * as dashboardApi from '../../api/dashboard';
import * as productsApi from '../../api/products';
import * as creditsApi from '../../api/credits';
import DashboardPage from './index';

vi.mock('../../api/dashboard');
vi.mock('../../api/products');
vi.mock('../../api/credits');

const mockGetOverview = vi.mocked(dashboardApi.getOverview);
const mockListProducts = vi.mocked(productsApi.listProducts);
const mockListCredits = vi.mocked(creditsApi.listCredits);

const overview = {
  range: { from: '2024-01-01', to: '2024-01-31', days: 31 },
  sales: {
    count: 100,
    total: 50000,
    cash: 20000,
    transfer: 20000,
    credit: 10000,
    avgTicket: 500,
    productsSold: 200,
  },
  returns: { count: 5, amount: 1000 },
  profitability: { revenue: 50000, cogs: 30000, grossProfit: 20000, grossMarginPercent: 40 },
  series: { labels: ['2024-01-01', '2024-01-02'], total: [5000, 7500] },
  topProducts: [{ productId: '1', name: 'Producto 1', quantity: 50, revenue: 25000 }],
  lowStock: [{ id: '1', name: 'Producto Bajo', stock: 2 }],
  lowStockTotal: 15,
  credit: {
    totalOutstanding: 10000,
    clientsWithDebt: 5,
    clients: [{ id: 'c1', fullName: 'Ana Pérez', balance: 10000 }],
  },
};

describe('DashboardPage', () => {
  beforeEach(() => {
    mockGetOverview.mockReset();
    mockGetOverview.mockResolvedValue(overview);
    mockListProducts.mockReset();
    mockListProducts.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    mockListCredits.mockReset();
    mockListCredits.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      summary: { totalOutstanding: 0, overdueCount: 0, overdueAmount: 0 },
    });
  });

  it('debería mostrar los KPI y las cards de stock bajo y créditos cuando hay datos', async () => {
    renderWithAdminProviders(<DashboardPage />);

    expect(await screen.findByText('Ventas del período')).toBeInTheDocument();
    expect(screen.getByText('Ticket promedio')).toBeInTheDocument();
    expect(screen.getAllByText('Ganancia bruta').length).toBeGreaterThan(0);
    expect(screen.getByText('Devoluciones')).toBeInTheDocument();
    expect(screen.getByText('STOCK BAJO')).toBeInTheDocument();
    expect(screen.getByText('CRÉDITOS PENDIENTES')).toBeInTheDocument();
  });

  it('debería no pedir las listas paginadas antes de abrir un modal', async () => {
    renderWithAdminProviders(<DashboardPage />);
    await screen.findByText('Ventas del período');

    expect(mockListProducts).not.toHaveBeenCalled();
    expect(mockListCredits).not.toHaveBeenCalled();
  });

  it('debería abrir el modal de stock bajo cuando se toca "Ver todos"', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<DashboardPage />);

    await user.click(await screen.findByRole('button', { name: /^Ver todos \(15\)/ }));

    expect(screen.getByText('Productos con stock bajo')).toBeInTheDocument();
    expect(mockListProducts).toHaveBeenCalled();
  });

  it('debería abrir el modal de deudores cuando se toca "Ver todos"', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<DashboardPage />);

    await user.click(await screen.findByRole('button', { name: /^Ver todos \(5\)/ }));

    expect(screen.getByText('Deudores')).toBeInTheDocument();
    expect(mockListCredits).toHaveBeenCalled();
  });

  it('debería cerrar el modal cuando se toca Cerrar', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<DashboardPage />);
    await user.click(await screen.findByRole('button', { name: /^Ver todos \(15\)/ }));

    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByText('Productos con stock bajo')).not.toBeInTheDocument();
  });

  it('debería mostrar el mensaje de la API cuando falla la carga del overview', async () => {
    mockGetOverview.mockRejectedValue({ response: { data: { message: 'Sin permisos' } } });
    renderWithAdminProviders(<DashboardPage />);

    expect(await screen.findByText('Sin permisos')).toBeInTheDocument();
  });

  it('debería pedir el overview con el nuevo rango cuando cambia la fecha Desde', async () => {
    const { container } = renderWithAdminProviders(<DashboardPage />);
    await screen.findByText('Ventas del período');
    const [fromInput] = container.querySelectorAll<HTMLInputElement>('input[type="date"]');

    fireEvent.change(fromInput!, { target: { value: '2024-01-01' } });

    await waitFor(() =>
      expect(mockGetOverview).toHaveBeenLastCalledWith(
        expect.objectContaining({ from: '2024-01-01' })
      )
    );
  });

  it('debería ocultar "Ver todos" de stock bajo cuando la API no envía lowStockTotal', async () => {
    const { lowStockTotal: _omitted, ...legacyOverview } = overview;
    mockGetOverview.mockResolvedValue(legacyOverview);
    renderWithAdminProviders(<DashboardPage />);
    await screen.findByText('STOCK BAJO');

    expect(screen.queryByRole('button', { name: /stock bajo/ })).not.toBeInTheDocument();
  });
});
