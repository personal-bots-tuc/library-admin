import { SELECT_CLASS } from '../../styles';
import type { CategorySelectProps } from './types';

export const CategorySelect = ({ value, onChange, categories, ariaLabel }: CategorySelectProps) => (
  <select
    value={value ?? ''}
    onChange={e => onChange(e.target.value || null)}
    aria-label={ariaLabel}
    className={SELECT_CLASS}
  >
    <option value="">Todas las categorías</option>
    {categories.map(cat => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
);
