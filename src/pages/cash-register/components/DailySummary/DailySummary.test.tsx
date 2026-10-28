import { describe, it, expect } from 'vitest';
import { renderWithAdminProviders, screen, within } from '../../../../test/utils';
import { DailySummary } from './index';
import { normalizeDailySummary } from '../../utils/summary';

const baseSummary = normalizeDailySummary({
  date: '2026-10-28',
  totalOpening: 500,
  cashSales: 3000,
  totalExpected: 3500,
  finalCount: 3500,
  totalShifts: 4,
  shiftsWithDifference: 1,
  netMovements: 100,
});

describe('DailySummary', () => {
  it('debería mostrar el total de operación con el valor del resumen', () => {
    renderWithAdminProviders(<DailySummary summary={baseSummary} />);

    expect(screen.getByTestId('total-operation')).toHaveTextContent('$3.500');
  });

  it('debería mostrar el neto en rojo cuando es negativo', () => {
    renderWithAdminProviders(<DailySummary summary={{ ...baseSummary, netMovements: -200 }} />);

    const netLine = screen.getByText('Neto movimientos').parentElement!;
    expect(within(netLine).getByText('-$200')).toHaveClass('text-danger-600');
  });

  it('debería ocultar la apertura heredada cuando es cero', () => {
    renderWithAdminProviders(<DailySummary summary={baseSummary} />);

    expect(screen.queryByText(/Apertura heredada/)).not.toBeInTheDocument();
  });

  it('debería mostrar la apertura heredada cuando es mayor a cero', () => {
    renderWithAdminProviders(<DailySummary summary={{ ...baseSummary, inheritedOpening: 300 }} />);

    expect(screen.getByText(/Apertura heredada/)).toBeInTheDocument();
    expect(screen.getByText('-$300')).toBeInTheDocument();
  });

  it('debería mostrar turnos con diferencia como "X de Y"', () => {
    renderWithAdminProviders(<DailySummary summary={baseSummary} />);

    expect(screen.getByText('1 de 4')).toBeInTheDocument();
  });
});
