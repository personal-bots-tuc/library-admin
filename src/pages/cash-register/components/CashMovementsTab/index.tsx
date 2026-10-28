import { useMemo } from 'react';
import { DataTable } from '../../../../components/DataTable';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { useAuth } from '../../../../hooks/useAuth';
import { exportToCSV } from '../../../../lib/exportToCSV';
import { formatCurrency } from '../../../../lib/format';
import { useCashMovementsList } from '../../hooks/useCashMovementsList';
import { movementsToCsvRows } from '../../utils/csv';
import { CATEGORY_BY_VALUE } from '../shared/constants';
import { AggregatedCards } from './AggregatedCards';
import { MovementsFilters } from './MovementsFilters';
import { buildMovementColumns } from './columns';
import { useDeleteMovement } from './useDeleteMovement';
import type { CashMovementsTabProps } from './types';

export const CashMovementsTab = ({ cashShiftId }: CashMovementsTabProps) => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const canDelete = isAdmin || isSuperAdmin;
  const list = useCashMovementsList({ cashShiftId });
  const removal = useDeleteMovement(list.refetch);

  const columns = useMemo(
    () => buildMovementColumns(canDelete, removal.setTarget),
    [canDelete, removal.setTarget]
  );

  const confirmMessage = removal.target
    ? `Vas a eliminar el movimiento de ${formatCurrency(removal.target.amount)} (${CATEGORY_BY_VALUE[removal.target.category].label}). Esta acción no se puede deshacer.`
    : '';

  return (
    <section className="space-y-6" aria-label="Movimientos de caja">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            {cashShiftId ? 'Movimientos del turno' : 'Movimientos de caja'}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {cashShiftId
              ? 'Entradas y salidas de este turno'
              : 'Historial global de entradas y salidas'}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            exportToCSV(movementsToCsvRows(list.movements), `movimientos_caja_pagina_${list.page}`)
          }
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <span className="material-icons text-base" aria-hidden="true">
            download
          </span>
          Exportar página
        </button>
      </div>

      {list.aggregated && <AggregatedCards aggregated={list.aggregated} />}

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <MovementsFilters
          fromDate={list.fromDate}
          toDate={list.toDate}
          onDateRangeChange={list.setDateRange}
          category={list.category}
          onCategoryChange={list.setCategoryFilter}
          type={list.type}
          onTypeChange={list.setTypeFilter}
        />
        <DataTable
          data={list.movements}
          columns={columns}
          keyExtractor={m => m.id}
          emptyMessage="No hay movimientos para mostrar"
          loading={list.loading}
          pagination={{
            page: list.page,
            pageSize: list.pageSize,
            total: list.total,
            onPageChange: list.setPage,
          }}
        />
      </div>

      <ConfirmModal
        isOpen={removal.target !== null}
        onClose={() => removal.setTarget(null)}
        onConfirm={() => void removal.confirmDelete()}
        title="Eliminar movimiento"
        message={confirmMessage}
        confirmLabel="Eliminar"
        loading={removal.deleting}
      />
    </section>
  );
};
