import { useCallback, useState } from 'react';
import { useDashboard } from './hooks';
import { DashboardSections, DashboardSkeleton, DebtorsModal, LowStockModal } from './components';
import type { DashboardModal } from './types';

const DashboardPage = () => {
  const { from, setFrom, to, setTo, data, loading, error, empty } = useDashboard();
  const [openModal, setOpenModal] = useState<DashboardModal | null>(null);
  const closeModal = useCallback(() => setOpenModal(null), []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="mt-4 text-sm text-danger-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <label className="text-sm text-neutral-600">Desde</label>
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg w-40"
        />
        <label className="text-sm text-neutral-600">Hasta</label>
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg w-40"
        />
      </div>

      {empty || !data ? (
        <div className="text-center py-12 text-neutral-400">
          <span className="material-icons text-6xl mb-2 block">inbox</span>
          <p className="text-lg">Sin datos para el rango seleccionado</p>
        </div>
      ) : (
        <DashboardSections data={data} onViewAll={setOpenModal} />
      )}

      {openModal === 'lowStock' && <LowStockModal onClose={closeModal} />}
      {openModal === 'debtors' && <DebtorsModal onClose={closeModal} />}
    </div>
  );
};

export default DashboardPage;
