import type { ColumnDef } from '../../../../components/DataTable';
import type { CashMovementItem } from '../../../../api/cashMovements';
import { formatShortDateTime } from '../../../../lib/format';
import { AmountCell, CategoryBadge, TypeBadge } from '../shared';

export const buildMovementColumns = (
  canDelete: boolean,
  onDelete: (movement: CashMovementItem) => void
): ColumnDef<CashMovementItem>[] => {
  const columns: ColumnDef<CashMovementItem>[] = [
    {
      header: 'Turno',
      cell: m => <span className="font-semibold text-neutral-800">#{m.shiftNumber}</span>,
    },
    { header: 'Vendedor', cell: m => m.sellerName },
    { header: 'Tipo', cell: m => <TypeBadge type={m.type} /> },
    { header: 'Categoría', cell: m => <CategoryBadge category={m.category} /> },
    { header: 'Monto', cell: m => <AmountCell amount={m.amount} type={m.type} /> },
    {
      header: 'Descripción',
      className: 'max-w-xs truncate text-neutral-600',
      cell: m => <span title={m.description}>{m.description}</span>,
    },
    {
      header: 'Fecha',
      cell: m => (
        <span className="whitespace-nowrap text-neutral-500">
          {formatShortDateTime(m.createdAt)}
        </span>
      ),
    },
  ];

  if (canDelete) {
    columns.push({
      header: '',
      className: 'text-right',
      cell: m => (
        <button
          type="button"
          onClick={() => onDelete(m)}
          aria-label="Eliminar movimiento"
          title="Eliminar (solo admin)"
          className="p-1.5 text-neutral-400 hover:text-danger-600 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <span className="material-icons text-base" aria-hidden="true">
            delete
          </span>
        </button>
      ),
    });
  }

  return columns;
};
