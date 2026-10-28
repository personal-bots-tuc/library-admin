import { formatCurrency } from '../../../../lib/format';

interface DifferenceNoticeProps {
  diff: number;
}

export const DifferenceNotice = ({ diff }: DifferenceNoticeProps) => (
  <div
    className={`rounded-lg px-4 py-3 text-sm ${diff > 0 ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}
  >
    Diferencia: <strong>{formatCurrency(Math.abs(diff))}</strong>{' '}
    {diff > 0 ? 'a favor' : 'faltante'} — se requiere una nota.
  </div>
);
