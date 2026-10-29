import { money } from '../../../../../lib/format';
import type { PriceLabelRowProps } from './types';

export const PriceLabelRow = ({
  product: p,
  selected,
  qty,
  onToggle,
  onQtyChange,
}: PriceLabelRowProps) => (
  <tr className={`hover:bg-neutral-50 ${selected ? 'bg-primary-50' : ''}`}>
    <td className="px-3 py-3">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
      />
    </td>
    <td className="px-3 py-3">
      <div className="font-medium text-neutral-900">{p.name}</div>
    </td>
    <td className="px-3 py-3 text-neutral-500 font-mono text-xs">{p.code ?? '—'}</td>
    <td className="px-3 py-3 text-right font-medium">{money(p.price)}</td>
    <td className="px-3 py-3 text-right">
      <input
        type="number"
        min="1"
        max="999"
        value={qty}
        onChange={e => onQtyChange(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-20 px-2 py-1.5 text-center text-sm border border-neutral-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </td>
    <td className="px-3 py-3 text-right text-neutral-600">
      {p.type === 'service' ? '∞' : p.stock}
    </td>
  </tr>
);
