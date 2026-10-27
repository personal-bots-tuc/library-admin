import { AgePill, StatusBadge, getDaysSince } from '../Badges';
import type { DebtorTableProps } from './types';

const headers = ['Cliente', 'Últ. Venta', 'Antigüedad', 'Saldo', 'Estado', 'Acciones'];

export const DebtorTable = ({
  debtors,
  loading,
  search,
  error,
  onSearchChange,
  onSettle,
  onViewDetail,
}: DebtorTableProps) => {
  const isSearching = search.trim() !== '';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-neutral-800">Detalle de deudores</h2>
        <div className="relative w-full sm:w-72">
          <span className="material-icons text-base text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, apellido o DNI..."
            aria-label="Buscar deudores por nombre, apellido o DNI"
            className="w-full pl-9 pr-8 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
            >
              <span className="material-icons text-base">close</span>
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {headers.map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-neutral-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-red-500" role="alert">
                  {error}
                </td>
              </tr>
            ) : debtors.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                  {isSearching
                    ? 'No se encontraron deudores para la búsqueda'
                    : 'No hay deudores activos'}
                </td>
              </tr>
            ) : (
              debtors.map(item => {
                const days = getDaysSince(item.lastCreditAt);
                return (
                  <tr key={item.client.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900">{item.client.fullName}</div>
                      <div className="text-xs text-neutral-400">DNI {item.client.dni}</div>
                    </td>
                    <td className="px-5 py-4 text-neutral-600 text-xs whitespace-nowrap">
                      {item.lastCreditAt
                        ? new Date(item.lastCreditAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {item.lastCreditAt ? (
                        <AgePill days={days} />
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-bold text-base ${item.balance > 0 ? 'text-red-500' : 'text-neutral-500'}`}
                      >
                        {item.balance > 0
                          ? `-$${item.balance.toFixed(2)}`
                          : `$${item.balance.toFixed(2)}`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge days={days} balance={item.balance} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {item.balance > 0 && (
                          <button
                            onClick={() => onSettle(item)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Saldar
                          </button>
                        )}
                        <button
                          onClick={() => onViewDetail(item)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Ver detalle"
                        >
                          <span className="material-icons text-base">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
