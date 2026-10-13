import type { ListSalesParams, SaleRow } from '../../../api/sales';
import SaleTableRow from './SaleTableRow';

const HEADERS = [
  'Comprobante',
  'Tipo',
  'Fecha / Hora',
  'Cliente',
  'Vendedor',
  'Método',
  'Total',
  'Acciones',
];

export interface SalesTableProps {
  sales: SaleRow[];
  loading: boolean;
  totalCount: number;
  params: ListSalesParams;
  detailLoading: boolean;
  onParamsChange: (patch: Partial<ListSalesParams>) => void;
  onOpenDetail: (sale: SaleRow) => void;
  onOpenCreditNote: (sale: SaleRow) => void;
}

export default function SalesTable({
  sales,
  loading,
  totalCount,
  params,
  detailLoading,
  onParamsChange,
  onOpenDetail,
  onOpenCreditNote,
}: SalesTableProps) {
  return (
    <>
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-neutral-100 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center text-neutral-400">
                  No hay ventas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              sales.map(sale => (
                <SaleTableRow
                  key={sale.id}
                  sale={sale}
                  detailLoading={detailLoading}
                  onOpenDetail={onOpenDetail}
                  onOpenCreditNote={onOpenCreditNote}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && totalCount > 0 && (
        <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <span className="text-sm text-neutral-500">
            Mostrando{' '}
            <span className="font-semibold text-neutral-700">
              {(params.page! - 1) * params.limit! + 1}-
              {Math.min(params.page! * params.limit!, totalCount)}
            </span>{' '}
            de <span className="font-semibold text-neutral-700">{totalCount}</span> ventas de hoy
          </span>
          <div className="flex items-center gap-3">
            <select
              className="px-2 py-1 text-sm border border-neutral-200 rounded outline-none bg-white text-neutral-600"
              value={params.limit}
              onChange={e => onParamsChange({ limit: Number(e.target.value) })}
            >
              <option value="8">8 por página</option>
              <option value="15">15 por página</option>
              <option value="50">50 por página</option>
            </select>

            <div className="flex gap-1">
              <button
                disabled={params.page === 1}
                onClick={() => onParamsChange({ page: params.page! - 1 })}
                className="w-7 h-7 flex items-center justify-center rounded border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40 transition-colors bg-white"
              >
                <span className="material-icons text-[16px]">chevron_left</span>
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded bg-blue-600 text-white font-bold text-sm">
                {params.page}
              </button>
              <button
                disabled={params.page! * params.limit! >= totalCount}
                onClick={() => onParamsChange({ page: params.page! + 1 })}
                className="w-7 h-7 flex items-center justify-center rounded border border-neutral-200 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-40 transition-colors bg-white"
              >
                <span className="material-icons text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
