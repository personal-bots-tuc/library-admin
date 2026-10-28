import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, waitFor } from '../../test/utils';
import { listClients } from '../../api/clients';
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
  createClient: vi.fn().mockResolvedValue({
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
  updateClient: vi.fn().mockResolvedValue({
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería abrir el formulario de nuevo cliente al hacer click en "Nuevo cliente"', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<ClientsPage />);
    await screen.findByText('Cliente 1');

    await user.click(screen.getByRole('button', { name: /nuevo cliente/i }));

    expect(await screen.findByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it('no debería volver a pedir la lista cuando la carga falla y se muestra el toast', async () => {
    vi.mocked(listClients).mockRejectedValueOnce(new Error('network down'));
    renderWithAdminProviders(<ClientsPage />);

    await screen.findByText('No se pudieron cargar los clientes');
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(listClients).toHaveBeenCalledTimes(1);
  });

  it('debería recargar la lista de clientes después de crear uno nuevo', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<ClientsPage />);
    await screen.findByText('Cliente 1');
    expect(listClients).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /nuevo cliente/i }));
    await user.type(await screen.findByLabelText(/nombre completo/i), 'Cliente 3');
    await user.type(screen.getByLabelText(/dni/i), '30111222');
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => expect(listClients).toHaveBeenCalledTimes(2));
  });

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
