import type { PaginationFooterProps } from './types';

const BUTTON_CLASS =
  'px-3 py-1 text-sm bg-white border border-neutral-300 rounded-md disabled:opacity-50 hover:bg-neutral-50 transition-colors';

export const PaginationFooter = ({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: PaginationFooterProps) => {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50/50">
      <span className="text-sm text-neutral-500">{`Mostrando ${from} a ${to} de ${total}`}</span>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={BUTTON_CLASS}
        >
          Anterior
        </button>
        <span className="text-sm font-medium text-neutral-700">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={BUTTON_CLASS}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
