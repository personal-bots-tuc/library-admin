import { DEFAULT_MIN_STOCK } from '../../constants';
import { useLowStockPage } from '../../hooks';
import { PagedListModal } from '../paged-list-modal';
import type { LowStockModalProps } from './types';

export const LowStockModal = ({ onClose }: LowStockModalProps) => {
  const list = useLowStockPage();

  return (
    <PagedListModal
      title="Productos con stock bajo"
      emptyMessage="No hay productos con stock bajo"
      list={list}
      onClose={onClose}
      columns={[
        { header: 'Producto', cell: row => row.name },
        {
          header: 'Stock / mínimo',
          cell: row => (
            <span className="font-semibold text-danger-600">
              {row.stock}/{row.minStock ?? DEFAULT_MIN_STOCK}
            </span>
          ),
        },
      ]}
    />
  );
};
