import { describe, it, expect, vi } from 'vitest';
import { renderWithAdminProviders } from '../../test/utils';
import ClientsPage from './ClientsPage';

// Mock the clients API
vi.mock('../../api/clients', () => ({
  listClients: vi.fn().mockResolvedValue({
    items: [
      {
        id: '1',
        fullName: 'Cliente 1',
        email: 'cliente1@test.com',
        phone: '123456789',
        schoolId: 'school-1',
        balance: 0,
        active: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        fullName: 'Cliente 2',
        email: 'cliente2@test.com',
        phone: '987654321',
        schoolId: 'school-1',
        balance: 5000,
        active: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ],
    total: 2,
    page: 1,
    limit: 10,
  }),
  createClient: vi
    .fn()
    .mockResolvedValue({
      id: '3',
      fullName: 'Cliente 3',
      email: 'cliente3@test.com',
      phone: '111222333',
      schoolId: 'school-1',
      balance: 0,
      active: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }),
  updateClient: vi
    .fn()
    .mockResolvedValue({
      id: '1',
      fullName: 'Cliente 1 Updated',
      email: 'cliente1@test.com',
      phone: '123456789',
      schoolId: 'school-1',
      balance: 0,
      active: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }),
}));

describe('ClientsPage', () => {
  it('renders clients table', async () => {
    const { findByText } = renderWithAdminProviders(<ClientsPage />);
    await findByText('Cliente 1');
    await findByText('Cliente 2');
  });

  it('shows loading state initially', () => {
    const { getByText } = renderWithAdminProviders(<ClientsPage />);
    expect(getByText('Cargando clientes...')).toBeInTheDocument();
  });

  it('has create client button', async () => {
    const { findByRole } = renderWithAdminProviders(<ClientsPage />);
    const button = await findByRole('button', { name: /nuevo cliente/i });
    expect(button).toBeInTheDocument();
  });
});
