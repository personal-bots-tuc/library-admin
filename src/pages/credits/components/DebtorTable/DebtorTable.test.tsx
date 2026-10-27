import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DebtorTable } from './index';
import type { DebtorTableProps } from './types';
import type { DebtorItem } from '../../../../api/credits';

const debtor: DebtorItem = {
  client: { id: 'c1', fullName: 'Ana Gómez', dni: '30123456', balance: 500 },
  balance: 500,
  lastCreditAt: new Date().toISOString(),
};

const renderTable = (overrides: Partial<DebtorTableProps> = {}) => {
  const props: DebtorTableProps = {
    debtors: [debtor],
    loading: false,
    search: '',
    onSearchChange: vi.fn(),
    onSettle: vi.fn(),
    onViewDetail: vi.fn(),
    ...overrides,
  };
  render(<DebtorTable {...props} />);
  return props;
};

describe('DebtorTable — buscador', () => {
  it('muestra el input de búsqueda dentro de la card con su placeholder', () => {
    renderTable();
    const input = screen.getByRole('searchbox', { name: /buscar deudores/i });
    expect(input).toHaveAttribute('placeholder', 'Buscar por nombre, apellido o DNI...');
  });

  it('refleja el valor recibido en props', () => {
    renderTable({ search: 'Ana' });
    expect(screen.getByRole('searchbox')).toHaveValue('Ana');
  });

  it('notifica cada cambio de texto al padre', () => {
    const { onSearchChange } = renderTable();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: '3012' } });
    expect(onSearchChange).toHaveBeenCalledWith('3012');
  });

  it('no muestra el botón limpiar cuando no hay búsqueda', () => {
    renderTable({ search: '' });
    expect(screen.queryByRole('button', { name: /limpiar búsqueda/i })).not.toBeInTheDocument();
  });

  it('el botón limpiar vacía la búsqueda', () => {
    const { onSearchChange } = renderTable({ search: 'Ana' });
    fireEvent.click(screen.getByRole('button', { name: /limpiar búsqueda/i }));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('no trata un texto solo con espacios como búsqueda activa', () => {
    renderTable({ search: '   ', debtors: [] });
    expect(screen.getByText('No hay deudores activos')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /limpiar búsqueda/i })).not.toBeInTheDocument();
  });

  it('muestra el mensaje de "sin resultados" cuando la búsqueda no encuentra deudores', () => {
    renderTable({ search: 'zzz', debtors: [] });
    expect(screen.getByText('No se encontraron deudores para la búsqueda')).toBeInTheDocument();
  });

  it('muestra el mensaje general cuando no hay búsqueda y no hay deudores', () => {
    renderTable({ search: '', debtors: [] });
    expect(screen.getByText('No hay deudores activos')).toBeInTheDocument();
  });

  it('muestra el error en lugar de las filas cuando la carga falla', () => {
    renderTable({ error: 'No se pudieron cargar los deudores. Intentá de nuevo.' });
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los deudores');
    expect(screen.queryByText('Ana Gómez')).not.toBeInTheDocument();
  });

  it('renderiza las filas de deudores que vienen del padre', () => {
    renderTable({ search: 'Ana' });
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByText('DNI 30123456')).toBeInTheDocument();
  });
});
