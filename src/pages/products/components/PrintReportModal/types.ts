import type { ReportColumnKey } from '../../utils/printProductsReport';

export interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (columns: ReportColumnKey[]) => void;
  totalFiltered: number;
  generating: boolean;
}
