import PageHeader from '../../components/PageHeader';
import SaleDetailModal from './components/SaleDetailModal';
import CreditNoteModal from './components/CreditNoteModal';
import SalesSummaryKPIs from './components/SalesSummaryKPIs';
import SalesFilters from './components/SalesFilters';
import SalesTable from './components/SalesTable';
import { useSalesPage } from './hooks/useSalesPage';

export default function SalesPage() {
  const s = useSalesPage();

  return (
    <>
      <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-24">
        {/* Header */}
        <PageHeader
          title="Historial de ventas"
          description="Consultá, filtrá y gestioná todas las transacciones del sistema"
          primaryAction={{ label: 'Exportar', icon: 'download', onClick: s.handleExport }}
        />

        {/* KPIs */}
        <SalesSummaryKPIs summary={s.summary} loading={s.summaryLoading} />

        {/* Table Section */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <SalesFilters
            params={s.params}
            activeTab={s.activeTab}
            onParamsChange={s.updateParams}
            onTabChange={s.handleTabChange}
            onClear={s.clearFilters}
          />
          <SalesTable
            sales={s.sales}
            loading={s.loading}
            totalCount={s.totalCount}
            params={s.params}
            detailLoading={s.detailLoading}
            onParamsChange={s.updateParams}
            onOpenDetail={s.openDetail}
            onOpenCreditNote={s.openCreditNoteModal}
          />
        </div>
      </div>
      <SaleDetailModal isOpen={!!s.detailSale} onClose={s.closeDetail} sale={s.detailSale} />
      <CreditNoteModal
        isOpen={!!s.creditNoteSaleData}
        sale={s.creditNoteSaleData}
        onClose={s.closeCreditNoteModal}
        onSuccess={s.handleCreditNoteSuccess}
      />
    </>
  );
}
