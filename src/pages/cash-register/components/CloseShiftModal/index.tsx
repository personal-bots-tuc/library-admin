import Modal from '../../../../components/Modal';
import { formatCurrency } from '../../../../lib/format';
import { CloseShiftFooter } from './CloseShiftFooter';
import { DifferenceNotice } from './DifferenceNotice';
import { useCloseShiftForm } from './useCloseShiftForm';
import { useExpectedAmount } from './useExpectedAmount';
import type { CloseShiftModalProps } from './types';

/**
 * Se monta solo mientras hay un turno a cerrar: el formulario arranca limpio en cada
 * apertura, sin resetearlo a mano.
 */
export const CloseShiftModal = ({ target, onClose, onClosed }: CloseShiftModalProps) => {
  const { expectedAmount, failed: expectedFailed } = useExpectedAmount(target.id);
  const form = useCloseShiftForm({
    shiftId: target.id,
    expectedAmount,
    onClosed: () => {
      onClosed();
      onClose();
    },
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Cerrar turno — ${target.sellerName}`}
      size="sm"
      footer={
        <CloseShiftFooter
          onCancel={onClose}
          onSubmit={() => void form.submit()}
          disabled={!form.canSubmit}
          saving={form.saving}
        />
      }
    >
      <div className="space-y-4">
        {expectedAmount != null && (
          <div className="bg-neutral-50 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-600">Esperado en caja</span>
            <span className="text-sm font-bold text-neutral-900">
              {formatCurrency(expectedAmount)}
            </span>
          </div>
        )}
        {expectedFailed && (
          <p className="text-sm text-amber-700">
            No se pudo cargar el esperado; podés cerrar igual.
          </p>
        )}

        <div>
          <label
            htmlFor="closing-amount"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Monto contado en caja
          </label>
          <input
            id="closing-amount"
            type="number"
            inputMode="decimal"
            value={form.closingAmount}
            onChange={e => form.setClosingAmount(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {form.hasDiff && <DifferenceNotice diff={form.diff} />}

        <div>
          <label
            htmlFor="closing-note"
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            Nota {form.hasDiff ? '(obligatoria por la diferencia)' : '(opcional)'}
          </label>
          <textarea
            id="closing-note"
            value={form.note}
            onChange={e => form.setNote(e.target.value)}
            rows={2}
            placeholder="Ej: faltante por pago con billete roto"
            className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {form.error && <p className="text-sm text-danger-600">{form.error}</p>}
      </div>
    </Modal>
  );
};
