import type { OpenShiftsBannerProps } from './types';

export const OpenShiftsBanner = ({ shifts, onCloseShift }: OpenShiftsBannerProps) => {
  if (shifts.length === 0) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" aria-hidden="true" />
        {shifts.length === 1 ? '1 turno abierto' : `${shifts.length} turnos abiertos`}
      </span>
      <ul className="flex flex-wrap gap-2">
        {shifts.map(shift => (
          <li
            key={shift.id}
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm text-amber-900"
          >
            {shift.sellerName}
            <button
              type="button"
              onClick={() => onCloseShift(shift)}
              aria-label={`Cerrar turno de ${shift.sellerName}`}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Cerrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
