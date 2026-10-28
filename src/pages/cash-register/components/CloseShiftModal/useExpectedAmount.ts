import { useEffect, useState } from 'react';
import { getCashShiftDetail } from '../../../../api/cashShifts';

/** Carga el monto esperado del turno. `failed` avisa que no se pudo, pero el cierre sigue permitido. */
export const useExpectedAmount = (shiftId: string) => {
  const [expectedAmount, setExpectedAmount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stale = false;
    getCashShiftDetail(shiftId)
      .then(detail => {
        if (!stale) setExpectedAmount(detail.shift.expectedAmount ?? null);
      })
      .catch(() => {
        if (!stale) setFailed(true);
      });
    return () => {
      stale = true;
    };
  }, [shiftId]);

  return { expectedAmount, failed };
};
