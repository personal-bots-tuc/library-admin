import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen } from '../../../../test/utils';
import { OpenShiftsBanner } from './index';

describe('OpenShiftsBanner', () => {
  it('debería ocultarse cuando no hay turnos abiertos', () => {
    const { container } = renderWithAdminProviders(
      <OpenShiftsBanner shifts={[]} onCloseShift={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('debería llamar onCloseShift con el turno elegido', async () => {
    const user = userEvent.setup();
    const onCloseShift = vi.fn();
    renderWithAdminProviders(
      <OpenShiftsBanner
        shifts={[
          { id: 'a', sellerName: 'Ana' },
          { id: 'b', sellerName: 'Juan' },
        ]}
        onCloseShift={onCloseShift}
      />
    );

    expect(screen.getByText('2 turnos abiertos')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar turno de Juan' }));

    expect(onCloseShift).toHaveBeenCalledWith({ id: 'b', sellerName: 'Juan' });
  });
});
