import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

/**
 * Paginación controlada por el servidor: `data` ya viene paginado y `total` es el
 * total de registros. Sin esta prop, la tabla pagina en cliente sobre `data`.
 */
export interface DataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  pageSize?: number;
  emptyMessage?: string;
  pagination?: DataTablePagination;
  /** Muestra filas esqueleto en lugar de `data` mientras se carga. */
  loading?: boolean;
  /** Clases extra por fila (p. ej. resaltar turnos con diferencia). */
  rowClassName?: (item: T) => string;
}
