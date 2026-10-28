import type { CloseTarget } from '../../types';

export interface OpenShiftsBannerProps {
  shifts: CloseTarget[];
  onCloseShift: (target: CloseTarget) => void;
}
