import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen } from '../../test/utils';
import { ConfirmModal } from './index';

const baseProps = {
  isOpen: true,
  title: 'Desactivar cliente',
  message: '¿Seguro que quieres desactivar a Ana?',
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

describe('ConfirmModal', () => {
  it('debería mostrar el título y el mensaje cuando está abierto', () => {
    renderWithAdminProviders(<ConfirmModal {...baseProps} />);

    expect(screen.getByText('Desactivar cliente')).toBeInTheDocument();
    expect(screen.getByText('¿Seguro que quieres desactivar a Ana?')).toBeInTheDocument();
  });

  it('no debería mostrar nada cuando está cerrado', () => {
    renderWithAdminProviders(<ConfirmModal {...baseProps} isOpen={false} />);

    expect(screen.queryByText('Desactivar cliente')).not.toBeInTheDocument();
  });

  it('debería llamar onConfirm cuando se pulsa el botón de confirmar', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithAdminProviders(
      <ConfirmModal {...baseProps} onConfirm={onConfirm} confirmLabel="Desactivar" />
    );

    await user.click(screen.getByRole('button', { name: 'Desactivar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('debería llamar onClose y no onConfirm cuando se pulsa Cancelar', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    renderWithAdminProviders(
      <ConfirmModal {...baseProps} onClose={onClose} onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('debería deshabilitar los botones y mostrar "Procesando..." cuando loading es true', () => {
    renderWithAdminProviders(<ConfirmModal {...baseProps} loading />);

    expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
