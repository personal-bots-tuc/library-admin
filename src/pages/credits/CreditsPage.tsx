import { useState, useEffect, useRef } from 'react';
import {
  getCreditsSummary,
  listCredits,
  getRecentHistory,
  settleDebt,
  type CreditsSummary,
  type DebtorItem,
  type RecentMovement,
} from '../../api/credits';
import { exportToCSV } from '../../lib/exportToCSV';
import { getDaysSince } from './components/Badges';
import { toDebtorSearchTerm } from './utils/debtorSearch';
import {
  CreditsKPIs,
  RecentHistoryPanel,
  SettleDebtModal,
  ClientCreditModal,
  DebtorTable,
} from './components';

interface SettleTarget {
  clientId: string;
  clientName: string;
  debt: number;
}

const CreditsPage = () => {
  const [summary, setSummary] = useState<CreditsSummary | null>(null);
  const [debtors, setDebtors] = useState<DebtorItem[]>([]);
  const [history, setHistory] = useState<RecentMovement[]>([]);
  const [search, setSearch] = useState('');
  // Objeto nuevo en cada disparo (búsqueda o refresh): aunque el término no cambie, el effect vuelve a correr.
  const [query, setQuery] = useState({ term: '', id: 0 });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDebtors, setLoadingDebtors] = useState(true);
  const [debtorsError, setDebtorsError] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [settleTarget, setSettleTarget] = useState<SettleTarget | null>(null);
  const [detailClient, setDetailClient] = useState<DebtorItem | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  useEffect(() => {
    let stale = false;
    Promise.all([getCreditsSummary(), getRecentHistory(5)])
      .then(([s, h]) => {
        if (stale) return;
        setSummary(s);
        setHistory(h || []);
      })
      .catch(e => console.error('Error cargando créditos', e))
      .finally(() => {
        if (stale) return;
        setLoadingSummary(false);
        setLoadingHistory(false);
      });
    return () => {
      stale = true;
    };
  }, [reloadCount]);

  // El debounce vive en el handler (no en un effect) para que no dispare una carga al montar.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setLoadingDebtors(true);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setQuery(q => ({ term: value.trim(), id: q.id + 1 }));
    }, 300);
  };

  // El flag `stale` descarta respuestas de búsquedas anteriores que lleguen tarde.
  useEffect(() => {
    let stale = false;
    listCredits({ limit: 50, search: toDebtorSearchTerm(query.term) })
      .then(d => {
        if (stale) return;
        setDebtors(d.items || []);
        setDebtorsError('');
      })
      .catch(e => {
        if (stale) return;
        console.error('Error cargando deudores', e);
        setDebtors([]);
        setDebtorsError('No se pudieron cargar los deudores. Intentá de nuevo.');
      })
      .finally(() => {
        if (!stale) setLoadingDebtors(false);
      });
    return () => {
      stale = true;
    };
  }, [query]);

  const handleExport = () => {
    const flat = debtors.map(d => ({
      Cliente: d.client.fullName,
      DNI: d.client.dni,
      Saldo: d.balance,
      UltimaActividad: d.lastCreditAt ? new Date(d.lastCreditAt).toLocaleDateString('es-AR') : '-',
      Estado:
        d.balance <= 0 ? 'SALDADO' : getDaysSince(d.lastCreditAt) >= 30 ? 'VENCIDO' : 'VIGENTE',
    }));
    exportToCSV(flat, 'deudores_cuentas_corrientes');
  };

  const handleSettle = async (payload: {
    amount: number;
    method: 'cash' | 'transfer';
    note?: string;
  }) => {
    if (!settleTarget) return;
    await settleDebt(settleTarget.clientId, payload);
    setSettleTarget(null);
    setLoadingSummary(true);
    setLoadingHistory(true);
    setLoadingDebtors(true);
    setReloadCount(c => c + 1);
    setQuery(q => ({ ...q, id: q.id + 1 }));
  };

  const openDetail = (item: DebtorItem) => {
    setDetailClient(item);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Cuentas corrientes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestioná los saldos pendientes de tus clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <span className="material-icons text-base">download</span>
            Exportar deudores
          </button>
          <button
            onClick={() => setSettleTarget({ clientId: '', clientName: 'General', debt: 0 })}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="material-icons text-base">payments</span>
            Registrar pago
          </button>
        </div>
      </div>

      <CreditsKPIs summary={summary} loading={loadingSummary} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DebtorTable
            debtors={debtors}
            loading={loadingDebtors}
            search={search}
            onSearchChange={handleSearchChange}
            error={debtorsError}
            onSettle={item =>
              setSettleTarget({
                clientId: item.client.id,
                clientName: item.client.fullName,
                debt: item.balance,
              })
            }
            onViewDetail={openDetail}
          />
        </div>

        <div className="xl:col-span-1">
          <RecentHistoryPanel movements={history} loading={loadingHistory} />
        </div>
      </div>

      {settleTarget && settleTarget.clientId && (
        <SettleDebtModal
          isOpen={true}
          clientName={settleTarget.clientName}
          currentDebt={settleTarget.debt}
          onClose={() => setSettleTarget(null)}
          onConfirm={handleSettle}
        />
      )}

      {detailClient && (
        <ClientCreditModal
          isOpen={true}
          client={detailClient}
          onClose={() => setDetailClient(null)}
        />
      )}
    </div>
  );
};

export default CreditsPage;
