import { SHIFT_TABS } from '../../utils/shiftTabs';
import type { RegisterTabsProps } from './types';

export const RegisterTabs = ({ tab, onTabChange }: RegisterTabsProps) => (
  <div
    className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg bg-neutral-100 p-1"
    role="tablist"
    aria-label="Secciones de caja"
  >
    {SHIFT_TABS.map(option => (
      <button
        key={option.id}
        type="button"
        role="tab"
        aria-selected={tab === option.id}
        onClick={() => onTabChange(option.id)}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
          tab === option.id
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-500 hover:text-neutral-700'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
