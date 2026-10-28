interface CloseShiftFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  disabled: boolean;
  saving: boolean;
}

export const CloseShiftFooter = ({
  onCancel,
  onSubmit,
  disabled,
  saving,
}: CloseShiftFooterProps) => (
  <div className="flex items-center justify-end gap-3">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
    >
      Volver
    </button>
    <button
      type="button"
      onClick={onSubmit}
      disabled={disabled}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {saving ? 'Cerrando…' : 'Cerrar turno'}
    </button>
  </div>
);
