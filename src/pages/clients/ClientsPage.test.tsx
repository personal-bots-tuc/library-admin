import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, waitFor } from '../../test/utils';
import { listClients, updateClient } from '../../api/clients';
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

type Role = 'admin' | 'superadmin' | 'seller';

const loginAs = (role: Role) => {
  localStorage.setItem(
    'user',
    JSON.stringify({ id: 'u1', name: 'Test', email: 'test@test.com', role })
  );
  localStorage.setItem('accessToken', 'token');
};

const makeClientItem = (overrides: Record<string, unknown> = {}) => ({
  id: '1',
  fullName: 'Cliente 1',
  dni: '30111222',
  phone: undefined,
  isDefault: false,
  balance: 0,
  active: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
});

const makePageResponse = (items: ReturnType<typeof makeClientItem>[], total = items.length) => ({
  items,
  total,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(total / 10) || 1,
});

describe('ClientsPage — paginación, acciones y filtros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('debería mostrar el total del servidor y pedir la página siguiente al pulsar Siguiente', async () => {
    const user = userEvent.setup();
    const items = Array.from({ length: 10 }, (_, i) =>
      makeClientItem({ id: String(i + 1), fullName: `Cliente ${i + 1}` })
    );
    vi.mocked(listClients).mockResolvedValueOnce(makePageResponse(items, 25));
    renderWithAdminProviders(<ClientsPage />);

    expect(await screen.findByText('Mostrando 1 a 10 de 25')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => expect(listClients).toHaveBeenLastCalledWith({ page: 2, limit: 10 }));
  });

  it('debería mostrar Editar y Desactivar a un administrador', async () => {
    loginAs('admin');
    vi.mocked(listClients).mockResolvedValueOnce(makePageResponse([makeClientItem()]));
    renderWithAdminProviders(<ClientsPage />);

    expect(await screen.findByRole('button', { name: 'Editar Cliente 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desactivar Cliente 1' })).toBeInTheDocument();
  });

  it('debería mostrar Editar y Desactivar a un superadministrador', async () => {
    loginAs('superadmin');
    vi.mocked(listClients).mockResolvedValueOnce(makePageResponse([makeClientItem()]));
    renderWithAdminProviders(<ClientsPage />);

    expect(await screen.findByRole('button', { name: 'Editar Cliente 1' })).toBeInTheDocument();
  });

  it('no debería mostrar acciones a un vendedor', async () => {
    loginAs('seller');
    vi.mocked(listClients).mockResolvedValueOnce(makePageResponse([makeClientItem()]));
    renderWithAdminProviders(<ClientsPage />);

    await screen.findByText('Cliente 1');
    expect(screen.queryByRole('button', { name: 'Editar Cliente 1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desactivar Cliente 1' })).not.toBeInTheDocument();
  });

  it('no debería mostrar acciones para el cliente por defecto', async () => {
    loginAs('admin');
    vi.mocked(listClients).mockResolvedValueOnce(
      makePageResponse([makeClientItem({ id: 'd', fullName: 'Consumidor Final', isDefault: true })])
    );
    renderWithAdminProviders(<ClientsPage />);

    await screen.findByText('Consumidor Final');
    expect(
      screen.queryByRole('button', { name: 'Editar Consumidor Final' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Desactivar Consumidor Final' })
    ).not.toBeInTheDocument();
  });

  it('debería guardar los cambios desde el modal de edición y recargar la lista', async () => {
    const user = userEvent.setup();
    loginAs('admin');
    vi.mocked(listClients).mockResolvedValueOnce(makePageResponse([makeClientItem()]));
    vi.mocked(updateClient).mockResolvedValueOnce(
      makeClientItem({ fullName: 'Cliente Editado' }) as never
    );
    renderWithAdminProviders(<ClientsPage />);

    await user.click(await screen.findByRole('button', { name: 'Editar Cliente 1' }));
    const nameInput = await screen.findByLabelText(/nombre completo/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Cliente Editado');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(updateClient).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ fullName: 'Cliente Editado' })
      )
    );
    await waitFor(() => expect(listClients).toHaveBeenCalledTimes(2));
  });

  it('debería desactivar el cliente tras confirmar y recargar la lista', async () => {
    const user = userEvent.setup();
    loginAs('admin');
    vi.mocked(listClients).mockResolvedValueOnce(makePageResponse([makeClientItem()]));
    vi.mocked(updateClient).mockResolvedValueOnce(makeClientItem({ active: false }) as never);
    renderWithAdminProviders(<ClientsPage />);

    await user.click(await screen.findByRole('button', { name: 'Desactivar Cliente 1' }));
    await user.click(await screen.findByRole('button', { name: 'Desactivar' }));

    await waitFor(() => expect(updateClient).toHaveBeenCalledWith('1', { active: false }));
    await waitFor(() => expect(listClients).toHaveBeenCalledTimes(2));
  });

  it('debería reactivar un cliente inactivo sin pedir confirmación', async () => {
    const user = userEvent.setup();
    loginAs('admin');
    vi.mocked(listClients).mockResolvedValueOnce(
      makePageResponse([makeClientItem({ active: false })])
    );
    vi.mocked(updateClient).mockResolvedValueOnce(makeClientItem({ active: true }) as never);
    renderWithAdminProviders(<ClientsPage />);

    await user.click(await screen.findByRole('button', { name: 'Reactivar Cliente 1' }));

    await waitFor(() => expect(updateClient).toHaveBeenCalledWith('1', { active: true }));
  });

  it('debería pedir solo clientes con deuda cuando se elige el filtro de deudores', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<ClientsPage />);
    await screen.findByText('Cliente 1');

    await user.selectOptions(screen.getByRole('combobox'), 'deudores');

    await waitFor(() =>
      expect(listClients).toHaveBeenLastCalledWith(
        expect.objectContaining({ hasDebt: true, page: 1 })
      )
    );
  });

  it('debería marcar Pendiente cuando el cliente tiene deuda (saldo positivo)', async () => {
    vi.mocked(listClients).mockResolvedValueOnce(
      makePageResponse([makeClientItem({ balance: 5000 })])
    );
    renderWithAdminProviders(<ClientsPage />);

    expect(await screen.findByText('Pendiente')).toBeInTheDocument();
  });

  it('no debería marcar Pendiente cuando el saldo es negativo (a favor del cliente)', async () => {
    vi.mocked(listClients).mockResolvedValueOnce(
      makePageResponse([makeClientItem({ balance: -100 })])
    );
    renderWithAdminProviders(<ClientsPage />);

    await screen.findByText('Cliente 1');
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  });
});
