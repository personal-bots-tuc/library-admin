import { useState, type ChangeEvent, type FormEvent } from 'react';
import Modal from '../Modal';
import { useToast } from '../Toast/useToast';
import { createClient, type CreateClientPayload } from '../../api/clients';
import type { CreateClientModalProps } from './types';

const FULL_NAME_MIN = 2;
const FULL_NAME_MAX = 120;
const DNI_MAX = 20;
const PHONE_MAX = 30;

const EMPTY_FORM = { fullName: '', dni: '', phone: '' };

const LABEL_CLASS = 'text-sm font-medium text-neutral-700 block mb-1';
const INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none';

const getErrorMessage = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ??
  'Error al crear el cliente';

export const CreateClientModal = ({ isOpen, onClose, onCreated }: CreateClientModalProps) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const fullName = form.fullName.trim();
  const dni = form.dni.trim();
  const isValid = fullName.length >= FULL_NAME_MIN && dni.length > 0;

  const updateField = (field: keyof typeof EMPTY_FORM) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    if (submitting) return;
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    const phone = form.phone.trim();
    const payload: CreateClientPayload = { fullName, dni, ...(phone && { phone }) };

    setSubmitting(true);
    try {
      const client = await createClient(payload);
      success(`Cliente "${client.fullName}" creado`);
      onCreated(client);
      handleClose();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Cliente" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="client-full-name" className={LABEL_CLASS}>
            Nombre completo <span className="text-danger-500">*</span>
          </label>
          <input
            id="client-full-name"
            value={form.fullName}
            onChange={updateField('fullName')}
            maxLength={FULL_NAME_MAX}
            placeholder="Ej: Ana Pérez"
            className={INPUT_CLASS}
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="client-dni" className={LABEL_CLASS}>
            DNI <span className="text-danger-500">*</span>
          </label>
          <input
            id="client-dni"
            value={form.dni}
            onChange={updateField('dni')}
            maxLength={DNI_MAX}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="client-phone" className={LABEL_CLASS}>
            Celular
          </label>
          <input
            id="client-phone"
            value={form.phone}
            onChange={updateField('phone')}
            maxLength={PHONE_MAX}
            placeholder="Opcional"
            className={INPUT_CLASS}
          />
        </div>
        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm disabled:opacity-60"
          >
            {submitting ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
