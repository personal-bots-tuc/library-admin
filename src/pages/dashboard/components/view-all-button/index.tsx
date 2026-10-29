import type { ViewAllButtonProps } from './types';

export const ViewAllButton = ({ count, subject, onClick }: ViewAllButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Ver todos (${count}): ${subject}`}
    className="mt-3 self-start px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
  >
    Ver todos ({count})
  </button>
);
