import { useState, useEffect, useCallback } from 'react';
import {
  listSales,
  getSalesSummary,
  getSale,
  type ListSalesParams,
  type SalesSummary,
  type SaleRow,
} from '../../../api/sales';
import { exportToCSV } from '../../../lib/exportToCSV';
import type { SalesTab } from '../components/SalesFilters';

const DEFAULT_PARAMS: ListSalesParams = {
  page: 1,
  limit: 10,
  sortOrder: 'desc',
  sortBy: 'createdAt',
};

/**
 * Encapsula estado y lógica de SalesPage: listado con filtros/paginación,
 * resumen KPIs, detalle de venta y emisión de nota de crédito.
 */
export function useSalesPage() {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [params, setParams] = useState<ListSalesParams>(DEFAULT_PARAMS);
  const [activeTab, setActiveTab] = useState<SalesTab>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [detailSale, setDetailSale] = useState<SaleRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [creditNoteSaleData, setCreditNoteSaleData] = useState<SaleRow | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = { ...params };
      if (activeTab !== 'all') queryParams.type = activeTab;

      const result = await listSales(queryParams);
      setSales(result.items || []);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Failed to load sales', error);
    } finally {
      setLoading(false);
    }
  }, [params, activeTab]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const result = await getSalesSummary();
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchSales();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchSales]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchSummary();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchSummary]);

  /** Aplica un patch de filtros reseteando a página 1 (salvo que el patch setee página explícitamente, ej: paginación). */
  const updateParams = useCallback((patch: Partial<ListSalesParams>) => {
    setParams((p: ListSalesParams) => ({ ...p, page: 1, ...patch }));
  }, []);

  const handleTabChange = useCallback((tab: SalesTab) => {
    setActiveTab(tab);
    setParams((p: ListSalesParams) => ({ ...p, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setActiveTab('all');
  }, []);

  const openDetail = useCallback(async (sale: SaleRow) => {
    setDetailLoading(true);
    try {
      const fullSale = await getSale(sale.id);
      setDetailSale(fullSale);
    } catch (error) {
      console.error('Failed to load sale detail', error);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => setDetailSale(null), []);

  const openCreditNoteModal = useCallback((sale: SaleRow) => {
    setCreditNoteSaleData(sale);
  }, []);

  const handleCreditNoteSuccess = useCallback(() => {
    setCreditNoteSaleData(null);
    void fetchSales();
    void fetchSummary();
  }, [fetchSales, fetchSummary]);

  const closeCreditNoteModal = useCallback(() => {
    setCreditNoteSaleData(null);
  }, []);

  const handleExport = useCallback(() => {
    const flatSales = sales.map(s => {
      let typeLabel = 'SALE';
      let receiptNumber = `#${s.number.toString().padStart(4, '0')}`;
      if (s.type === 'return') {
        typeLabel = 'RETURN';
        receiptNumber += 'R';
      } else if (s.type === 'credit_note') {
        typeLabel = 'CREDIT_NOTE';
        receiptNumber += 'NC';
      }
      return {
        ReceiptNumber: receiptNumber,
        Type: typeLabel,
        Date: new Date(s.createdAt).toLocaleString('es-AR'),
        Client: s.client?.fullName || 'Consumidor Final',
        Seller: s.seller?.name || 'Desconocido',
        Method: s.paymentMethod,
        Total: s.total,
        Status: s.voided ? 'VOIDED' : 'OK',
      };
    });
    exportToCSV(flatSales, 'sales_history');
  }, [sales]);

  return {
    sales,
    summary,
    loading,
    summaryLoading,
    params,
    activeTab,
    totalCount,
    detailSale,
    detailLoading,
    creditNoteSaleData,
    updateParams,
    handleTabChange,
    clearFilters,
    openDetail,
    closeDetail,
    openCreditNoteModal,
    handleCreditNoteSuccess,
    closeCreditNoteModal,
    handleExport,
  };
}
