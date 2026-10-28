import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithAdminProviders, screen } from '../../test/utils';
import { DataTable, type ColumnDef } from './index';

interface Row {
  id: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [{ header: 'Nombre', accessorKey: 'name' }];

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, i) => ({ id: String(i + 1), name: `Fila ${i + 1}` }));

describe('DataTable', () => {
  it('debería paginar en cliente cuando no recibe paginación del servidor', async () => {
    const user = userEvent.setup();
    renderWithAdminProviders(
      <DataTable data={makeRows(12)} columns={columns} keyExtractor={r => r.id} />
    );

    expect(screen.getByText('Fila 1')).toBeInTheDocument();
    expect(screen.queryByText('Fila 11')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getByText('Fila 11')).toBeInTheDocument();
  });

  it('debería mostrar todas las filas recibidas cuando hay paginación del servidor', () => {
    renderWithAdminProviders(
      <DataTable
        data={makeRows(10)}
        columns={columns}
        keyExtractor={r => r.id}
        pagination={{ page: 2, pageSize: 10, total: 25, onPageChange: vi.fn() }}
      />
    );

    expect(screen.getByText('Fila 10')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 11 a 20 de 25')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('debería llamar onPageChange con la página siguiente cuando se usa paginación del servidor', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderWithAdminProviders(
      <DataTable
        data={makeRows(10)}
        columns={columns}
        keyExtractor={r => r.id}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('debería deshabilitar Anterior en la primera página cuando se usa paginación del servidor', () => {
    renderWithAdminProviders(
      <DataTable
        data={makeRows(10)}
        columns={columns}
        keyExtractor={r => r.id}
        pagination={{ page: 1, pageSize: 10, total: 25, onPageChange: vi.fn() }}
      />
    );

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  it('debería ocultar el pie de paginación cuando el total cabe en una página', () => {
    renderWithAdminProviders(
      <DataTable
        data={makeRows(3)}
        columns={columns}
        keyExtractor={r => r.id}
        pagination={{ page: 1, pageSize: 10, total: 3, onPageChange: vi.fn() }}
      />
    );

    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
  });
});
