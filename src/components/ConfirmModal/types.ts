export type ConfirmModalVariant = 'danger' | 'warning' | 'info';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: ConfirmModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}
