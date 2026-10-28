import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, waitFor } from '../../test/utils';
import { createClient, updateClient, type Client } from '../../api/clients';
import { ClientFormModal } from './index';

vi.mock('../../api/clients', () => ({
  createClient: vi.fn(),
  updateClient: vi.fn(),
}));

const createdClient: Client = {
  id: 'client-3',
  fullName: 'Ana Pérez',
  dni: '30111222',
  phone: undefined,
  isDefault: false,
  balance: 0,
  active: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

interface ClientFormValues {
  fullName: string;
  dni: string;
  phone?: string;
}

const fillForm = async (user: ReturnType<typeof userEvent.setup>, values: ClientFormValues) => {
  await user.type(screen.getByLabelText(/nombre completo/i), values.fullName);
  await user.type(screen.getByLabelText(/dni/i), values.dni);
  if (values.phone) await user.type(screen.getByLabelText(/celular/i), values.phone);
};

describe('ClientFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no debería mostrar el formulario cuando isOpen es false', () => {
    renderWithAdminProviders(
      <ClientFormModal isOpen={false} onClose={vi.fn()} onSaved={vi.fn()} />
    );
    expect(screen.queryByLabelText(/nombre completo/i)).not.toBeInTheDocument();
  });

  it('debería deshabilitar "Crear" cuando el nombre y el DNI están vacíos', () => {
    renderWithAdminProviders(<ClientFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Crear' })).toBeDisabled();
  });

  it('debería deshabilitar "Crear" cuando el nombre tiene menos de 2 caracteres', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<ClientFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);
    await fillForm(user, { fullName: 'A', dni: '30111222' });
    expect(screen.getByRole('button', { name: 'Crear' })).toBeDisabled();
  });

  it('debería deshabilitar "Crear" cuando el DNI está vacío', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(<ClientFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez');
    expect(screen.getByRole('button', { name: 'Crear' })).toBeDisabled();
  });

  it('debería enviar nombre y DNI recortados y omitir el celular cuando está vacío', async () => {
    const user = userEvent.setup();
    vi.mocked(createClient).mockResolvedValue(createdClient);
    renderWithAdminProviders(<ClientFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);

    await fillForm(user, { fullName: '  Ana Pérez  ', dni: ' 30111222 ' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() =>
      expect(createClient).toHaveBeenCalledWith({ fullName: 'Ana Pérez', dni: '30111222' })
    );
  });

  it('debería incluir el celular en el payload cuando se completa', async () => {
    const user = userEvent.setup();
    vi.mocked(createClient).mockResolvedValue({ ...createdClient, phone: '1155667788' });
    renderWithAdminProviders(<ClientFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222', phone: '1155667788' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() =>
      expect(createClient).toHaveBeenCalledWith({
        fullName: 'Ana Pérez',
        dni: '30111222',
        phone: '1155667788',
      })
    );
  });

  it('debería llamar onSaved con el cliente creado y cerrar el modal tras crear', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const onClose = vi.fn();
    vi.mocked(createClient).mockResolvedValue(createdClient);
    renderWithAdminProviders(<ClientFormModal isOpen onClose={onClose} onSaved={onSaved} />);

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(createdClient));
    expect(onClose).toHaveBeenCalled();
  });

  it('debería mostrar el mensaje del backend y no cerrar el modal cuando el DNI ya existe', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const onClose = vi.fn();
    vi.mocked(createClient).mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'Ya existe un cliente con ese DNI en esta escuela' },
      },
    });
    renderWithAdminProviders(<ClientFormModal isOpen onClose={onClose} onSaved={onSaved} />);

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(
      await screen.findByText('Ya existe un cliente con ese DNI en esta escuela')
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('debería deshabilitar el envío y mostrar "Creando..." mientras se guarda', async () => {
    const user = userEvent.setup();
    vi.mocked(createClient).mockReturnValue(new Promise(() => {}));
    renderWithAdminProviders(<ClientFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    const pending = await screen.findByRole('button', { name: 'Creando...' });
    expect(pending).toBeDisabled();
  });

  it('no debería cerrar el modal mientras se guarda', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(createClient).mockReturnValue(new Promise(() => {}));
    renderWithAdminProviders(<ClientFormModal isOpen onClose={onClose} onSaved={vi.fn()} />);

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));
    await screen.findByRole('button', { name: 'Creando...' });

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('debería mostrar el mensaje genérico cuando el error no trae mensaje del backend', async () => {
    const user = userEvent.setup();
    vi.mocked(createClient).mockRejectedValue(new Error('Network Error'));
    renderWithAdminProviders(<ClientFormModal isOpen onClose={vi.fn()} onSaved={vi.fn()} />);

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('Error al crear el cliente')).toBeInTheDocument();
  });

  it('debería vaciar el formulario después de crear un cliente', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(createClient).mockResolvedValue(createdClient);
    const { rerender } = renderWithAdminProviders(
      <ClientFormModal isOpen onClose={onClose} onSaved={vi.fn()} />
    );

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222' });
    await user.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());

    rerender(<ClientFormModal isOpen={false} onClose={onClose} onSaved={vi.fn()} />);
    rerender(<ClientFormModal isOpen onClose={onClose} onSaved={vi.fn()} />);

    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
    expect(screen.getByLabelText(/dni/i)).toHaveValue('');
  });

  it('debería limpiar el formulario al cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderWithAdminProviders(
      <ClientFormModal isOpen onClose={onClose} onSaved={vi.fn()} />
    );

    await fillForm(user, { fullName: 'Ana Pérez', dni: '30111222', phone: '1155667788' });
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalled();

    rerender(<ClientFormModal isOpen={false} onClose={onClose} onSaved={vi.fn()} />);
    rerender(<ClientFormModal isOpen onClose={onClose} onSaved={vi.fn()} />);

    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('');
    expect(screen.getByLabelText(/dni/i)).toHaveValue('');
    expect(screen.getByLabelText(/celular/i)).toHaveValue('');
  });
});

const existingClient: Client = {
  ...createdClient,
  id: 'client-7',
  fullName: 'Luis Gómez',
  dni: '28999111',
  phone: '1144556677',
};

describe('ClientFormModal en modo edición', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería mostrar el título "Editar cliente" y precargar los datos cuando recibe un cliente', () => {
    renderWithAdminProviders(
      <ClientFormModal isOpen client={existingClient} onClose={vi.fn()} onSaved={vi.fn()} />
    );

    expect(screen.getByRole('heading', { name: 'Editar cliente' })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Luis Gómez');
    expect(screen.getByLabelText(/dni/i)).toHaveValue('28999111');
    expect(screen.getByLabelText(/celular/i)).toHaveValue('1144556677');
  });

  it('debería llamar updateClient con el id y los datos editados al guardar', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    vi.mocked(updateClient).mockResolvedValue({ ...existingClient, fullName: 'Luis G. Gómez' });
    renderWithAdminProviders(
      <ClientFormModal isOpen client={existingClient} onClose={vi.fn()} onSaved={onSaved} />
    );

    await user.clear(screen.getByLabelText(/nombre completo/i));
    await user.type(screen.getByLabelText(/nombre completo/i), 'Luis G. Gómez');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(updateClient).toHaveBeenCalledWith('client-7', {
        fullName: 'Luis G. Gómez',
        dni: '28999111',
        phone: '1144556677',
      })
    );
    expect(createClient).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Luis G. Gómez' }));
  });

  it('debería enviar el celular vacío cuando el usuario lo borra', async () => {
    const user = userEvent.setup();
    vi.mocked(updateClient).mockResolvedValue({ ...existingClient, phone: undefined });
    renderWithAdminProviders(
      <ClientFormModal isOpen client={existingClient} onClose={vi.fn()} onSaved={vi.fn()} />
    );

    await user.clear(screen.getByLabelText(/celular/i));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(updateClient).toHaveBeenCalledWith('client-7', expect.objectContaining({ phone: '' }))
    );
  });

  it('debería mostrar el mensaje del backend y no cerrar cuando el DNI ya existe', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    vi.mocked(updateClient).mockRejectedValue({
      response: { data: { message: 'Ya existe un cliente con ese DNI en esta escuela' } },
    });
    renderWithAdminProviders(
      <ClientFormModal isOpen client={existingClient} onClose={onClose} onSaved={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByText('Ya existe un cliente con ese DNI en esta escuela')
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('debería restaurar los datos originales al cancelar y reabrir el mismo cliente', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderWithAdminProviders(
      <ClientFormModal isOpen client={existingClient} onClose={onClose} onSaved={vi.fn()} />
    );

    await user.clear(screen.getByLabelText(/nombre completo/i));
    await user.type(screen.getByLabelText(/nombre completo/i), 'Otro nombre');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    rerender(
      <ClientFormModal isOpen={false} client={existingClient} onClose={onClose} onSaved={vi.fn()} />
    );
    rerender(
      <ClientFormModal isOpen client={existingClient} onClose={onClose} onSaved={vi.fn()} />
    );

    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Luis Gómez');
  });
});
