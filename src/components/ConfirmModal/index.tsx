import Modal from '../Modal';
import type { ConfirmModalProps, ConfirmModalVariant } from './types';

const VARIANT_STYLES: Record<
  ConfirmModalVariant,
  { icon: string; iconColor: string; confirmColor: string }
> = {
  danger: {
    icon: 'warning',
    iconColor: 'text-red-500',
    confirmColor: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: 'warning',
    iconColor: 'text-amber-500',
    confirmColor: 'bg-amber-600 hover:bg-amber-700',
  },
  info: { icon: 'info', iconColor: 'text-blue-500', confirmColor: 'bg-blue-600 hover:bg-blue-700' },
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'danger',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}: ConfirmModalProps) => {
  const { icon, iconColor, confirmColor } = VARIANT_STYLES[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6 space-y-6">
        <div className="flex items-start gap-4">
          <span className={`material-icons ${iconColor} flex-shrink-0 mt-0.5`}>{icon}</span>
          <p className="text-neutral-700 text-base leading-relaxed flex-1">{message}</p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${confirmColor} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
