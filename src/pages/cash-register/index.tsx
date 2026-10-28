import { useState } from 'react';
import { exportToCSV } from '../../lib/exportToCSV';
import { CashShiftKPIs } from './components/CashShiftKPIs';
import { CashShiftDetailModal } from './components/CashShiftDetailModal';
import { CashMovementsTab } from './components/CashMovementsTab';
import { CloseShiftModal } from './components/CloseShiftModal';
import { DailySummarySection } from './components/DailySummary';
import { OpenShiftsBanner } from './components/OpenShiftsBanner';
import { RegisterTabs } from './components/RegisterTabs';
import { ShiftsFilters } from './components/ShiftsFilters';
import { ShiftsTable } from './components/ShiftsTable';
import { useCashShiftsList } from './hooks/useCashShiftsList';
import { useDailySummary } from './hooks/useDailySummary';
import { useSellerOptions } from './hooks/useSellerOptions';
import { shiftsToCsvRows } from './utils/csv';
import type { CloseTarget } from './types';

export const CashRegisterPage = () => {
  const shiftsList = useCashShiftsList();
  const dailySummary = useDailySummary();
  const sellers = useSellerOptions();
  const [detailShiftId, setDetailShiftId] = useState<string | null>(null);
  const [closeTarget, setCloseTarget] = useState<CloseTarget | null>(null);

  const isMovementsTab = shiftsList.tab === 'movements';
  const { summary } = dailySummary;
  const openTargets: CloseTarget[] = (summary?.pendingShifts ?? []).map(p => ({
    id: p.id,
    sellerName: p.sellerName,
  }));

  const refreshAfterClose = () => {
    shiftsList.refetch();
    dailySummary.refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Arqueo de caja</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Revisá los turnos, diferencias y el resumen del día
          </p>
        </div>
        {!isMovementsTab && (
          <button
            type="button"
            onClick={() =>
              exportToCSV(
                shiftsToCsvRows(shiftsList.shifts),
                `arqueo_de_caja_pagina_${shiftsList.page}`
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <span className="material-icons text-base" aria-hidden="true">
              download
            </span>
            Exportar página
          </button>
        )}
      </div>

      {!isMovementsTab && <DailySummarySection summary={summary} loading={dailySummary.loading} />}

      <CashShiftKPIs summary={summary} loading={dailySummary.loading && summary === null} />

      <RegisterTabs tab={shiftsList.tab} onTabChange={shiftsList.setTab} />

      {isMovementsTab ? (
        <CashMovementsTab />
      ) : (
        <>
          <OpenShiftsBanner shifts={openTargets} onCloseShift={setCloseTarget} />

          <section
            className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden"
            aria-label="Turnos"
          >
            <ShiftsFilters
              filters={shiftsList.filters}
              onFiltersChange={shiftsList.updateFilters}
              sellers={sellers}
            />
            <ShiftsTable
              shifts={shiftsList.shifts}
              total={shiftsList.total}
              page={shiftsList.page}
              pageSize={shiftsList.pageSize}
              loading={shiftsList.loading}
              onPageChange={shiftsList.setPage}
              onCloseShift={setCloseTarget}
              onViewShift={setDetailShiftId}
            />
          </section>
        </>
      )}

      {detailShiftId && (
        <CashShiftDetailModal shiftId={detailShiftId} onClose={() => setDetailShiftId(null)} />
      )}

      {closeTarget && (
        <CloseShiftModal
          target={closeTarget}
          onClose={() => setCloseTarget(null)}
          onClosed={refreshAfterClose}
        />
      )}
    </div>
  );
};

export default CashRegisterPage;
