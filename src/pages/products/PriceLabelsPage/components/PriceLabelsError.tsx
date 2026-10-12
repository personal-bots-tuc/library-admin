interface PriceLabelsErrorProps {
  error: string;
  onRetry: () => void;
}

export default function PriceLabelsError({ error, onRetry }: PriceLabelsErrorProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 text-center">
        <p className="text-danger-700 mb-4">Error cargando productos: {error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}