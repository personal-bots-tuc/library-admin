import { useState, type ChangeEvent, type FormEvent } from 'react';
import Modal from '../Modal';
import { useToast } from '../Toast/useToast';
import {
  createClient,
  updateClient,
  type Client,
  type CreateClientPayload,
} from '../../api/clients';
import { getApiErrorMessage } from '../../lib/apiError';
import type { ClientFormModalProps } from './types';

const FULL_NAME_MIN = 2;
const FULL_NAME_MAX = 120;
const DNI_MAX = 20;
const PHONE_MAX = 30;

type FormValues = { fullName: string; dni: string; phone: string };

const EMPTY_FORM: FormValues = { fullName: '', dni: '', phone: '' };

const formFromClient = (client?: Client): FormValues =>
  client ? { fullName: client.fullName, dni: client.dni, phone: client.phone ?? '' } : EMPTY_FORM;

const LABEL_CLASS = 'text-sm font-medium text-neutral-700 block mb-1';
const INPUT_CLASS =
  'w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none';

export const ClientFormModal = ({ isOpen, onClose, onSaved, client }: ClientFormModalProps) => {
  const isEditing = client !== undefined;
  const [form, setForm] = useState<FormValues>(() => formFromClient(client));
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const fullName = form.fullName.trim();
  const dni = form.dni.trim();
  const isValid = fullName.length >= FULL_NAME_MIN && dni.length > 0;

  const updateField = (field: keyof FormValues) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    if (submitting) return;
    setForm(formFromClient(client));
    onClose();
  };

  const save = async () => {
    const phone = form.phone.trim();
    if (client) {
      return updateClient(client.id, { fullName, dni, phone });
    }
    const payload: CreateClientPayload = { fullName, dni, ...(phone && { phone }) };
    return createClient(payload);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    try {
      const saved = await save();
      success(
        isEditing ? `Cliente "${saved.fullName}" actualizado` : `Cliente "${saved.fullName}" creado`
      );
      onSaved(saved);
      handleClose();
    } catch (err) {
      showError(
        getApiErrorMessage(
          err,
          isEditing ? 'Error al actualizar el cliente' : 'Error al crear el cliente'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar cliente' : 'Nuevo Cliente'}
      size="md"
    >
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
            {submitting
              ? isEditing
                ? 'Guardando...'
                : 'Creando...'
              : isEditing
                ? 'Guardar'
                : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
