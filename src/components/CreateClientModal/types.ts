import type { Client } from '../../api/clients';

export interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
}
