import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../Toast/useToast';
import Modal from '../Modal';
import { createCategory } from '../../api/categories';
import { getApiErrorMessage } from '../../lib/apiError';
import type { CategoryQuickCreateProps } from './types';

export function CategoryQuickCreate({ isOpen, onClose, onCreated }: CategoryQuickCreateProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!name.trim()) {
      showError('El nombre es obligatorio');
      return;
    }
    setSubmitting(true);
    try {
      const cat = await createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      success(`Categoría "${cat.name}" creada`);
      onCreated(cat.id, cat.name);
      setName('');
      setDescription('');
      onClose();
    } catch (e: unknown) {
      showError(getApiErrorMessage(e, 'Error al crear categoría'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Nueva categoría" isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Nombre *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
            placeholder="Ej: Útiles escolares"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Descripción</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Opcional"
            className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-300 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting || !name.trim()}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm disabled:opacity-60"
          >
            {submitting ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
