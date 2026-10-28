import type { CloseTarget } from '../../types';

export interface CloseShiftModalProps {
  target: CloseTarget;
  onClose: () => void;
  onClosed: () => void;
}
