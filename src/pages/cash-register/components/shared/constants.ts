import type { CashMovementCategory } from '../../../../api/cashMovements';

export const CATEGORY_OPTIONS: {
  value: CashMovementCategory;
  label: string;
  badgeClass: string;
}[] = [
  { value: 'lunch', label: 'Almuerzo', badgeClass: 'bg-orange-100 text-orange-700' },
  { value: 'supplies', label: 'Insumos', badgeClass: 'bg-blue-100 text-blue-700' },
  {
    value: 'personal_withdrawal',
    label: 'Retiro personal',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  { value: 'change', label: 'Cambio', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'expense', label: 'Gasto operativo', badgeClass: 'bg-teal-100 text-teal-700' },
  { value: 'other', label: 'Otro', badgeClass: 'bg-neutral-100 text-neutral-700' },
];

export const CATEGORY_BY_VALUE = Object.fromEntries(
  CATEGORY_OPTIONS.map(option => [option.value, option])
) as Record<CashMovementCategory, (typeof CATEGORY_OPTIONS)[number]>;
