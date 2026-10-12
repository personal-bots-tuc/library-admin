import type { ReactNode } from 'react';

interface PaginationProps {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function PageBtn({ n, current, onClick }: { n: number; current: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
        n === current
          ? 'bg-primary-600 text-white border-primary-600'
          : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'
      }`}
    >
      {n}
    </button>
  );
}

function pageItems(totalPages: number, current: number): Array<number | '…'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items: Array<number | '…'> = [1];
  const start = Math.max(2, current - 2);
  const end = Math.min(totalPages - 1, current + 2);
  if (start > 2) items.push('…');
  for (let n = start; n <= end; n++) items.push(n);
  if (end < totalPages - 1) items.push('…');
  items.push(totalPages);
  return items;
}

export default function Pagination({
  total,
  totalPages,
  page,
  limit,
  loading,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const items: ReactNode[] = pageItems(totalPages, page).map((item, idx) =>
    item === '…' ? (
      <span key={`ellipsis-${idx}`} className="px-1">
        …
      </span>
    ) : (
      <PageBtn key={item} n={item} current={page} onClick={() => onPageChange(item)} />
    )
  );

  return (
    <div className="flex items-center justify-between text-sm text-neutral-600">
      <div className="flex items-center gap-2">
        <span>
          Mostrando {from}-{to} de {total}
        </span>
        <select
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
          className="border border-neutral-300 rounded px-1.5 py-0.5 text-sm"
        >
          {[8, 16, 32].map(n => (
            <option key={n} value={n}>
              {n} por página
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1 || loading}
          className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-icons text-sm">chevron_left</span>
        </button>
        {items}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || loading}
          className="px-2.5 py-1 rounded border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-icons text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
