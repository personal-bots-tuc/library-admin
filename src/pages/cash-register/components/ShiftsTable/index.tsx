import { DataTable, type ColumnDef } from '../../../../components/DataTable';
import type { CashShiftItem } from '../../../../api/cashShifts';
import { formatCurrency, formatTime } from '../../../../lib/format';
import { DiffCell, StatusBadge } from '../shared';
import type { ShiftsTableProps } from './types';

const optionalCurrency = (value?: number) => (value != null ? formatCurrency(value) : '—');

export const ShiftsTable = ({
  shifts,
  total,
  page,
  pageSize,
  loading,
  onPageChange,
  onCloseShift,
  onViewShift,
}: ShiftsTableProps) => {
  const columns: ColumnDef<CashShiftItem>[] = [
    {
      header: 'Turno',
      cell: s => <span className="font-semibold text-neutral-800">#{s.shiftNumber}</span>,
    },
    { header: 'Vendedor', cell: s => <span className="text-neutral-700">{s.sellerName}</span> },
    { header: 'Estado', cell: s => <StatusBadge status={s.status} difference={s.difference} /> },
    {
      header: 'Apertura / Cierre',
      cell: s => (
        <span className="whitespace-nowrap">
          {formatTime(s.openedAt)} / {formatTime(s.closedAt)}
        </span>
      ),
    },
    { header: 'Apertura $', cell: s => formatCurrency(s.openingAmount) },
    { header: 'Esperado $', cell: s => optionalCurrency(s.expectedAmount) },
    { header: 'Real $', cell: s => optionalCurrency(s.closingAmount) },
    { header: 'Diferencia', cell: s => <DiffCell value={s.difference} /> },
    {
      header: 'Acciones',
      className: 'text-right',
      cell: s => (
        <div className="flex items-center justify-end gap-1">
          {s.status === 'open' && (
            <button
              type="button"
              onClick={() => onCloseShift({ id: s.id, sellerName: s.sellerName })}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Cerrar turno
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewShift(s.id)}
            aria-label={`Ver detalle del turno #${s.shiftNumber}`}
            title="Ver detalle"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <span className="material-icons text-base" aria-hidden="true">
              visibility
            </span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={shifts}
      columns={columns}
      keyExtractor={s => s.id}
      emptyMessage="No hay turnos para mostrar"
      loading={loading}
      rowClassName={s =>
        s.difference !== undefined && s.difference !== 0 ? 'bg-danger-50/40' : ''
      }
      pagination={{ page, pageSize, total, onPageChange }}
    />
  );
};
