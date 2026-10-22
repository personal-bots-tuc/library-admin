export interface CategoryQuickCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (id: string, name: string) => void;
}
