import { useState, type ReactNode } from 'react';
import type { ColumnDef, DataTableProps } from './types';
import { PaginationFooter } from './PaginationFooter';

export type { ColumnDef } from './types';

const SKELETON_ROWS = 6;

const renderCell = <T,>(col: ColumnDef<T>, item: T): ReactNode => {
  if (col.cell) return col.cell(item);
  if (col.accessorKey) return item[col.accessorKey] as ReactNode;
  return null;
};

interface DataTableBodyProps<T> extends Pick<
  DataTableProps<T>,
  'columns' | 'keyExtractor' | 'emptyMessage' | 'rowClassName'
> {
  rows: T[];
  loading: boolean;
}

const DataTableBody = <T,>({
  rows,
  loading,
  columns,
  keyExtractor,
  emptyMessage,
  rowClassName,
}: DataTableBodyProps<T>) => {
  if (loading) {
    return (
      <>
        {Array.from({ length: SKELETON_ROWS }, (_, rowIdx) => (
          <tr key={rowIdx} className="animate-pulse" data-testid="datatable-skeleton-row">
            {columns.map((_, idx) => (
              <td key={idx} className="px-6 py-4">
                <div className="h-4 bg-neutral-100 rounded w-full" />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }

  if (rows.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="px-6 py-12 text-center text-neutral-400">
          {emptyMessage}
        </td>
      </tr>
    );
  }

  return (
    <>
      {rows.map(item => (
        <tr
          key={keyExtractor(item)}
          className={`hover:bg-neutral-50/50 transition-colors ${rowClassName?.(item) ?? ''}`}
        >
          {columns.map((col, idx) => (
            <td key={idx} className={`px-6 py-4 align-middle ${col.className ?? ''}`}>
              {renderCell(col, item)}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  pageSize = 10,
  emptyMessage = 'No hay resultados',
  pagination,
  loading = false,
  rowClassName,
}: DataTableProps<T>) {
  const [localPage, setLocalPage] = useState(1);
  const rows = data ?? [];

  const paging = pagination ?? {
    page: localPage,
    pageSize,
    total: rows.length,
    onPageChange: setLocalPage,
  };
  const visibleRows = pagination
    ? rows
    : rows.slice((paging.page - 1) * paging.pageSize, paging.page * paging.pageSize);
  const totalPages = Math.ceil(paging.total / paging.pageSize) || 1;

  return (
    <div className="w-full flex flex-col bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-600">
          <thead className="text-xs uppercase text-neutral-500 bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 font-semibold tracking-wider ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            <DataTableBody
              rows={visibleRows}
              loading={loading}
              columns={columns}
              keyExtractor={keyExtractor}
              emptyMessage={emptyMessage}
              rowClassName={rowClassName}
            />
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <PaginationFooter
          page={paging.page}
          pageSize={paging.pageSize}
          total={paging.total}
          totalPages={totalPages}
          onPageChange={paging.onPageChange}
        />
      )}
    </div>
  );
}
