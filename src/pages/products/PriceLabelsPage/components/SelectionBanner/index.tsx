import type { SelectionBannerProps } from './types';

export const SelectionBanner = ({
  state,
  pageCount,
  scopeCount,
  scopeSuffix,
  onSelectScope,
  onDeselectScope,
}: SelectionBannerProps) => {
  if (state === 'selected') {
    return (
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 text-sm bg-primary-50 text-primary-800 border-b border-primary-100">
        <span>
          Seleccionados los {scopeCount} productos{scopeSuffix}.
        </span>
        <button type="button" onClick={onDeselectScope} className="font-semibold underline">
          Quitar de la selección
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 text-sm bg-neutral-50 text-neutral-700 border-b border-neutral-200">
      <span>Marcaste los {pageCount} de esta página.</span>
      <button
        type="button"
        onClick={onSelectScope}
        className="font-semibold text-primary-700 underline"
      >
        Seleccionar los {scopeCount}
        {scopeSuffix}
      </button>
    </div>
  );
};
