import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrintReportModal from './index';

describe('PrintReportModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onPrint: vi.fn(),
    totalFiltered: 42,
    generating: false,
  };

  it('no renderiza cuando isOpen=false', () => {
    const { container } = render(<PrintReportModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('muestra total filtrado y columnas por defecto', () => {
    render(<PrintReportModal {...baseProps} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Margen')).toBeInTheDocument();
  });

  it('toggle de columna agrega/quita del seleccionado', () => {
    render(<PrintReportModal {...baseProps} />);
    const margenCheckbox = screen.getByRole('checkbox', { name: /margen/i });

    // Default: margen NO está seleccionada
    expect(margenCheckbox).not.toBeChecked();

    fireEvent.click(margenCheckbox);
    expect(margenCheckbox).toBeChecked();

    fireEvent.click(margenCheckbox);
    expect(margenCheckbox).not.toBeChecked();
  });

  it('onPrint recibe las columnas seleccionadas en orden del registry', () => {
    render(<PrintReportModal {...baseProps} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /costo/i }));

    const button = screen.getByRole('button', { name: /Imprimir/i });
    fireEvent.click(button);

    expect(baseProps.onPrint).toHaveBeenCalledTimes(1);
    const columns = baseProps.onPrint.mock.calls[0][0];
    expect(columns).toEqual(['producto', 'codigo', 'tipo', 'precio', 'costo', 'stock']);
  });

  it('deshabilita Imprimir si no hay columnas seleccionadas', () => {
    render(<PrintReportModal {...baseProps} />);
    ['Producto', 'Código', 'Tipo', 'Precio', 'Stock'].forEach(label => {
      fireEvent.click(screen.getByRole('checkbox', { name: new RegExp(label, 'i') }));
    });
    expect(screen.getByRole('button', { name: /Imprimir/i })).toBeDisabled();
  });

  it('muestra estado Generando al imprimir', () => {
    render(<PrintReportModal {...baseProps} generating />);
    expect(screen.getByRole('button', { name: /Generando…/i })).toBeDisabled();
  });
});
