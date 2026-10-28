import { useState } from 'react';
import { deleteCashMovement, type CashMovementItem } from '../../../../api/cashMovements';
import { useToast } from '../../../../components/Toast/useToast';

/** Estado del borrado con confirmación. `onDeleted` refresca el listado tras borrar. */
export const useDeleteMovement = (onDeleted: () => void) => {
  const { success: showSuccess, error: showError } = useToast();
  const [target, setTarget] = useState<CashMovementItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteCashMovement(target.id);
      showSuccess('Movimiento eliminado');
      setTarget(null);
      onDeleted();
    } catch {
      showError('No se pudo eliminar el movimiento');
    } finally {
      setDeleting(false);
    }
  };

  return { target, setTarget, deleting, confirmDelete };
};
