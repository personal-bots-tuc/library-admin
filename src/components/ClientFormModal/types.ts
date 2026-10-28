import type { Client } from '../../api/clients';

export interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Recibe el cliente creado o editado. */
  onSaved: (client: Client) => void;
  /** Si se pasa, el formulario edita este cliente en lugar de crear uno nuevo. */
  client?: Client;
}
