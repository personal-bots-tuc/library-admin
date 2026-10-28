import { useEffect, useState } from 'react';
import Modal from '../../../../components/Modal';
import { getCashShiftDetail, type CashShiftDetail } from '../../../../api/cashShifts';
import { ShiftDetailContent } from './ShiftDetailContent';
import type { CashShiftDetailModalProps } from './types';

/** Se monta por turno: cada apertura carga su propio detalle. */
export const CashShiftDetailModal = ({ shiftId, onClose }: CashShiftDetailModalProps) => {
  const [detail, setDetail] = useState<CashShiftDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stale = false;

    getCashShiftDetail(shiftId)
      .then(data => {
        if (!stale) setDetail(data);
      })
      .catch((e: unknown) => {
        if (!stale)
          setError(e instanceof Error ? e.message : 'Error al cargar el detalle del turno');
      })
      .finally(() => {
        if (!stale) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [shiftId]);

  return (
    <Modal isOpen onClose={onClose} size="xl">
      {loading && <p className="text-center">Cargando detalle del turno...</p>}
      {!loading && error && <p className="text-center text-danger-600">Error: {error}</p>}
      {!loading && !error && !detail && <p className="text-center">Sin datos del turno</p>}
      {!loading && !error && detail && <ShiftDetailContent detail={detail} />}
    </Modal>
  );
};
