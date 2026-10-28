import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen, waitFor } from '../../../../test/utils';
import { closeCashShift, getCashShiftDetail } from '../../../../api/cashShifts';
import { CloseShiftModal } from './index';

vi.mock('../../../../api/cashShifts', () => ({
  getCashShiftDetail: vi.fn(),
  closeCashShift: vi.fn(),
}));

const target = { id: 's1', sellerName: 'Ana' };

const renderModal = () => {
  const onClose = vi.fn();
  const onClosed = vi.fn();
  renderWithAdminProviders(
    <CloseShiftModal target={target} onClose={onClose} onClosed={onClosed} />
  );
  return { onClose, onClosed };
};

const loadExpected = (expectedAmount: number) =>
  vi.mocked(getCashShiftDetail).mockResolvedValue({ shift: { expectedAmount } } as never);

describe('CloseShiftModal', () => {
  beforeEach(() => {
    vi.mocked(getCashShiftDetail).mockReset();
    vi.mocked(closeCashShift).mockReset();
    vi.mocked(closeCashShift).mockResolvedValue({} as never);
    loadExpected(3500);
  });

  it('debería mostrar el esperado en caja cuando el detalle carga', async () => {
    renderModal();

    expect(await screen.findByText('$3.500')).toBeInTheDocument();
  });

  it('debería deshabilitar cerrar mientras el monto contado está vacío', async () => {
    renderModal();
    await screen.findByText('$3.500');

    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeDisabled();
  });

  it('debería exigir nota cuando el monto contado tiene diferencia', async () => {
    const user = userEvent.setup();
    renderModal();
    await screen.findByText('$3.500');

    await user.type(screen.getByLabelText('Monto contado en caja'), '3400');

    expect(screen.getByText(/faltante/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeDisabled();

    await user.type(screen.getByLabelText(/Nota/), 'billete roto');
    expect(screen.getByRole('button', { name: 'Cerrar turno' })).toBeEnabled();
  });

  it('debería cerrar el turno sin nota cuando no hay diferencia', async () => {
    const user = userEvent.setup();
    const { onClose, onClosed } = renderModal();
    await screen.findByText('$3.500');

    await user.type(screen.getByLabelText('Monto contado en caja'), '3500');
    await user.click(screen.getByRole('button', { name: 'Cerrar turno' }));

    await waitFor(() => expect(onClosed).toHaveBeenCalled());
    expect(closeCashShift).toHaveBeenCalledWith('s1', { closingAmount: 3500 });
    expect(onClose).toHaveBeenCalled();
  });

  it('debería mostrar el motivo requerido cuando el backend rechaza el cierre sin nota', async () => {
    const user = userEvent.setup();
    vi.mocked(closeCashShift).mockRejectedValue({
      response: { data: { message: 'Se requiere motivo para la diferencia' } },
    });
    const { onClosed } = renderModal();
    await screen.findByText('$3.500');

    await user.type(screen.getByLabelText('Monto contado en caja'), '3500');
    await user.click(screen.getByRole('button', { name: 'Cerrar turno' }));

    expect(await screen.findByText(/agregá una nota explicando el motivo/)).toBeInTheDocument();
    expect(onClosed).not.toHaveBeenCalled();
  });

  it('debería avisar que podés cerrar igual cuando no se pudo cargar el esperado', async () => {
    vi.mocked(getCashShiftDetail).mockRejectedValue(new Error('down'));
    renderModal();

    expect(await screen.findByText(/podés cerrar igual/)).toBeInTheDocument();
  });
});
