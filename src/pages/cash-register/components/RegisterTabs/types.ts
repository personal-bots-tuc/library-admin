import type { CashRegisterTab } from '../../types';

export interface RegisterTabsProps {
  tab: CashRegisterTab;
  onTabChange: (tab: CashRegisterTab) => void;
}
