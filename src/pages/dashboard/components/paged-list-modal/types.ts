import type { ReactNode } from 'react';

export interface ListColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export interface PagedList<T> {
  rows: T[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export interface PagedListModalProps<T extends { id: string }> {
  title: string;
  columns: ListColumn<T>[];
  emptyMessage: string;
  list: PagedList<T>;
  onClose: () => void;
}
