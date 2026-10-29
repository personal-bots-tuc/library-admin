import Modal from '../../../../components/Modal';
import { DataTable } from '../../../../components/DataTable';
import { MODAL_PAGE_SIZE } from '../../constants';
import type { PagedListModalProps } from './types';

export const PagedListModal = <T extends { id: string }>({
  title,
  columns,
  emptyMessage,
  list,
  onClose,
}: PagedListModalProps<T>) => (
  <Modal title={title} size="xl" onClose={onClose}>
    {list.error ? (
      <div role="alert" className="flex items-center justify-between gap-3 text-sm text-danger-600">
        <span>{list.error}</span>
        <button
          type="button"
          onClick={list.retry}
          className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    ) : (
      <DataTable
        data={list.rows}
        columns={columns}
        keyExtractor={row => row.id}
        emptyMessage={emptyMessage}
        loading={list.loading}
        pagination={{
          page: list.page,
          pageSize: MODAL_PAGE_SIZE,
          total: list.total,
          onPageChange: list.setPage,
        }}
      />
    )}
  </Modal>
);
