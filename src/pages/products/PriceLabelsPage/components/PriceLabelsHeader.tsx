interface PriceLabelsHeaderProps {
  totalLabels: number;
  onClearAll: () => void;
  onPrint: () => void;
  disabledPrint: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export default function PriceLabelsHeader({
  totalLabels,
  onClearAll,
  onPrint,
  disabledPrint,
  showPreview,
  onTogglePreview,
}: PriceLabelsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Preciero / Etiquetas de Precio</h1>
        <p className="text-neutral-500 mt-1">
          Seleccioná productos, definí cantidades y imprimí en hojas A4
        </p>
      </div>
      <div className="flex items-center gap-3">
        {totalLabels > 0 && (
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {totalLabels} etiquetas
          </span>
        )}
        <button
          onClick={onClearAll}
          disabled={totalLabels === 0}
          className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 disabled:opacity-40"
        >
          Limpiar todo
        </button>
        <button
          onClick={onPrint}
          disabled={disabledPrint}
          className="flex-1 py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="material-icons">print</span>
          Imprimir etiquetas
        </button>
        <button
          onClick={onTogglePreview}
          className="px-4 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 flex items-center gap-2"
        >
          <span className="material-icons">{showPreview ? "visibility_off" : "visibility"}</span>
          {showPreview ? "Ocultar" : "Mostrar"} vista previa
        </button>
      </div>
    </div>
  );
}