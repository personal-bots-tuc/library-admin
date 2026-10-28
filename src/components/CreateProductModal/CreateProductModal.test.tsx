import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, waitFor } from '../../test/utils';
import { createProduct, updateProduct } from '../../api/products';
import CreateProductModal from './index';

vi.mock('../../api/products', () => ({
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

describe('CreateProductModal', () => {
  it('renders create title when no initialData', () => {
    const { getByRole } = renderWithAdminProviders(
      <CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />
    );
    const heading = getByRole('heading', { name: 'Crear producto' });
    expect(heading).toBeTruthy();
  });

  it('renders edit title when initialData provided', () => {
    const initialData = { id: '1', name: 'Test', type: 'product' as const, price: 10, stock: 5 };
    const { getByRole } = renderWithAdminProviders(
      <CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} initialData={initialData} />
    );
    const heading = getByRole('heading', { name: 'Editar producto' });
    expect(heading).toBeTruthy();
  });
});

describe('CreateProductModal: envío y errores de validación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no envía categoryId null cuando no se elige categoría', async () => {
    const user = userEvent.setup();
    vi.mocked(createProduct).mockResolvedValue({} as never);
    renderWithAdminProviders(<CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('Ej: Cuaderno espiral A4'), 'Cuaderno');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => expect(createProduct).toHaveBeenCalledTimes(1));
    const payload = vi.mocked(createProduct).mock.calls[0][0];
    expect(payload.categoryId).toBeUndefined();
    expect(payload.categoryId).not.toBeNull();
  });

  it('muestra el error de validación del backend debajo del campo y el mensaje en el toast', async () => {
    const user = userEvent.setup();
    vi.mocked(createProduct).mockRejectedValue({
      response: {
        status: 400,
        data: {
          error: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: { 'body.categoryId': ['Invalid input: expected string, received null'] },
        },
      },
    });
    renderWithAdminProviders(<CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('Ej: Cuaderno espiral A4'), 'Cuaderno');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('Seleccioná una categoría válida')).toBeInTheDocument();
    expect(screen.getByText('Datos de entrada inválidos')).toBeInTheDocument();
  });

  it('muestra un error genérico en el campo para errores de validación sin traducción', async () => {
    const user = userEvent.setup();
    vi.mocked(createProduct).mockRejectedValue({
      response: {
        status: 400,
        data: {
          error: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: { 'body.price': ['Too small'] },
        },
      },
    });
    renderWithAdminProviders(<CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('Ej: Cuaderno espiral A4'), 'Cuaderno');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('Valor inválido')).toBeInTheDocument();
  });

  it('limpia el error solo del campo que el usuario modifica', async () => {
    const user = userEvent.setup();
    vi.mocked(createProduct).mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: 'Datos de entrada inválidos',
          details: { 'body.categoryId': ['Invalid input'] },
        },
      },
    });
    renderWithAdminProviders(<CreateProductModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('Ej: Cuaderno espiral A4'), 'Cuaderno');
    await user.click(screen.getByRole('button', { name: 'Crear producto' }));
    expect(await screen.findByText('Seleccioná una categoría válida')).toBeInTheDocument();

    // Editar otro campo no limpia el error de categoría...
    await user.type(screen.getByPlaceholderText('Ej: Cuaderno espiral A4'), 'X');
    expect(screen.getByText('Seleccioná una categoría válida')).toBeInTheDocument();

    // ...pero cambiar la categoría sí.
    await user.selectOptions(screen.getByDisplayValue('Sin categoría'), '');
    expect(screen.queryByText('Seleccioná una categoría válida')).not.toBeInTheDocument();
  });

  it('no envía categoryId null al editar un producto sin categoría', async () => {
    const user = userEvent.setup();
    vi.mocked(updateProduct).mockResolvedValue({} as never);
    renderWithAdminProviders(
      <CreateProductModal
        isOpen
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        initialData={{ id: 'p1', name: 'Lápiz', type: 'product', price: 10, stock: 3 }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(updateProduct).toHaveBeenCalledWith('p1', expect.any(Object)));
    const payload = vi.mocked(updateProduct).mock.calls[0][1];
    expect(payload.categoryId).not.toBeNull();
  });
});
