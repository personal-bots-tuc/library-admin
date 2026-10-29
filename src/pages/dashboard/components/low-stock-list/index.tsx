import { DEFAULT_MIN_STOCK, LIST_SCROLL_CLASSES } from '../../constants';
import { ViewAllButton } from '../view-all-button';
import type { LowStockListProps } from './types';

export const LowStockList = ({ items, total, onViewAll }: LowStockListProps) => (
  <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col">
    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
      STOCK BAJO
    </h3>
    {items.length === 0 ? (
      <p className="text-sm text-neutral-400">Todo el stock OK</p>
    ) : (
      <ul
        aria-label="Productos con stock bajo"
        tabIndex={0}
        className={`space-y-2 text-sm ${LIST_SCROLL_CLASSES}`}
      >
        {items.map(p => (
          <li key={p.id} className="flex items-center justify-between">
            <span className="text-danger-600">{p.name}</span>
            <span className="font-semibold text-danger-600">
              {p.stock}/{p.minStock ?? DEFAULT_MIN_STOCK}
            </span>
          </li>
        ))}
      </ul>
    )}
    {total > items.length && (
      <ViewAllButton count={total} subject="productos con stock bajo" onClick={onViewAll} />
    )}
  </div>
);
