import { useState } from 'react';
import { closeCashShift } from '../../../../api/cashShifts';
import { getApiErrorMessage } from '../../../../lib/apiError';

const MISSING_REASON_MESSAGE =
  'Hay diferencia con el esperado: agregá una nota explicando el motivo.';

interface UseCloseShiftFormOptions {
  shiftId: string;
  expectedAmount: number | null;
  onClosed: () => void;
}

export const useCloseShiftForm = ({
  shiftId,
  expectedAmount,
  onClosed,
}: UseCloseShiftFormOptions) => {
  const [closingAmount, setClosingAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = Number(closingAmount);
  const hasAmount = closingAmount !== '' && !Number.isNaN(parsedAmount);
  const diff = expectedAmount != null && hasAmount ? parsedAmount - expectedAmount : 0;
  const hasDiff = diff !== 0;
  const noteMissing = hasDiff && note.trim() === '';
  const canSubmit = hasAmount && !noteMissing && !saving;

  const submit = async () => {
    if (!hasAmount) return;
    setSaving(true);
    setError(null);
    try {
      const trimmedNote = note.trim();
      await closeCashShift(shiftId, {
        closingAmount: parsedAmount,
        ...(trimmedNote ? { note: trimmedNote } : {}),
      });
      onClosed();
    } catch (err) {
      const message = getApiErrorMessage(err, 'No se pudo cerrar el turno.');
      setError(message.includes('motivo') ? MISSING_REASON_MESSAGE : message);
    } finally {
      setSaving(false);
    }
  };

  return {
    closingAmount,
    setClosingAmount,
    note,
    setNote,
    saving,
    error,
    submit,
    diff,
    hasDiff,
    canSubmit,
  };
};
