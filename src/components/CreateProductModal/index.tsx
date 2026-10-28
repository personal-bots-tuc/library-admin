import { useState } from 'react';
import { useToast } from '../Toast/useToast';
import Modal from '../Modal';
import { unitGrossProfit, unitMarginPercent, formatPercent } from '../../lib/profit';
import { getApiErrorMessage, getApiFieldErrors } from '../../lib/apiError';
import { createProduct, updateProduct } from '../../api/products';
import { useCategories } from '../../hooks/useCategories';
import { CategoryQuickCreate } from '../CategoryQuickCreate';
import { FieldError } from './FieldError';
import type { CreateProductForm, CreateProductModalProps, ProductType } from './types';

const EMPTY_FORM: CreateProductForm = {
  name: '',
  type: 'product',
  price: 0,
  cost: undefined,
  stock: 0,
  minStock: undefined,
  code: '',
  categoryId: null,
};

const TYPE_OPTIONS: { label: string; value: ProductType }[] = [
  { label: 'Producto', value: 'product' },
  { label: 'Servicio', value: 'service' },
];

// Mensajes en español para los errores de validación del backend (que llegan en inglés).
const FIELD_ERROR_MESSAGES: Record<string, string> = {
  categoryId: 'Seleccioná una categoría válida',
};
const DEFAULT_FIELD_ERROR = 'Valor inválido';

function ProfitInfo({ price, cost }: { price: number; cost?: number }) {
  if (cost === undefined) return null;
  const profit = unitGrossProfit(price, cost ?? 0);
  const margin = formatPercent(unitMarginPercent(price, cost ?? 0));
  return (
    <div className="mt-2">
      <p className="text-sm text-neutral-600">
        Ganancia estimada: <span className="font-semibold">{profit.toLocaleString('es-AR')}</span>
      </p>
      <p className="text-sm text-neutral-600">
        Margen estimado: <span className="font-semibold">{margin}</span>
      </p>
      {price <= (cost ?? 0) && (
        <p className="text-amber-600 font-medium">El precio no cubre el costo de compra.</p>
      )}
    </div>
  );
}

const mapToForm = (data?: CreateProductModalProps['initialData']): CreateProductForm => {
  if (!data) return EMPTY_FORM;
  return {
    name: data.name,
    type: data.type,
    price: data.price,
    cost: data.cost,
    stock: data.stock,
    minStock: data.minStock,
    code: data.code ?? '',
    categoryId: data.categoryId ?? null,
  };
};

export default function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateProductModalProps) {
  const [form, setForm] = useState<CreateProductForm>(() => mapToForm(initialData));
  const { success, error: showError } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const saveButtonBase =
    'w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold ' +
    'hover:bg-primary-700 transition-colors flex items-center justify-center gap-2';

  const borderFor = (field: string) =>
    fieldErrors[field]
      ? 'border-danger-500 focus:border-danger-500'
      : 'border-neutral-200 focus:border-primary-500';

  const handleChange = (field: keyof CreateProductForm, value: string | number | undefined) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    setSubmitting(true);
    setFieldErrors({});
    // El backend no acepta `categoryId: null`; si no hay categoría se omite la clave.
    const payload: CreateProductForm = { ...form, categoryId: form.categoryId || undefined };
    try {
      if (initialData) {
        await updateProduct(initialData.id, payload);
      } else {
        await createProduct(payload);
      }
      success(`Producto "${form.name}" guardado correctamente`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errors = getApiFieldErrors(err);
      const translated = Object.fromEntries(
        Object.keys(errors).map(field => [
          field,
          FIELD_ERROR_MESSAGES[field] ?? DEFAULT_FIELD_ERROR,
        ])
      );
      setFieldErrors(translated);
      showError(getApiErrorMessage(err, 'Error al guardar el producto'));
    } finally {
      setSubmitting(false);
    }
  };

  const profitBlock = <ProfitInfo price={form.price} cost={form.cost} />;

  return (
    <Modal
      title={initialData ? 'Editar producto' : 'Crear producto'}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Nombre <span className="text-danger-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            maxLength={120}
            placeholder="Ej: Cuaderno espiral A4"
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('name')}`}
            required
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Código de producto
          </label>
          <input
            value={form.code ?? ''}
            onChange={e => handleChange('code', e.target.value.toUpperCase())}
            maxLength={50}
            placeholder="Ej: PRD-ABC123 o código de barras (opcional)"
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('code')}`}
          />
          <FieldError message={fieldErrors.code} />
          <p className="text-xs text-neutral-500 mt-1">
            Se auto-genera si queda vacío (formato: PRD-XXXXX / SRV-XXXXX)
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Categoría</label>
          <div className="flex gap-2">
            <select
              value={form.categoryId ?? ''}
              onChange={e => handleChange('categoryId', e.target.value || undefined)}
              className={`flex-1 px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('categoryId')}`}
              disabled={categoriesLoading}
            >
              <option value="">Sin categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setQuickCreateOpen(true)}
              className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-sm font-medium"
              title="Nueva categoría"
            >
              +
            </button>
          </div>
          <FieldError message={fieldErrors.categoryId} />
          <p className="text-xs text-neutral-500 mt-1">Categoría opcional</p>
        </div>

        <CategoryQuickCreate
          isOpen={quickCreateOpen}
          onClose={() => setQuickCreateOpen(false)}
          onCreated={id => {
            setForm(f => ({ ...f, categoryId: id }));
            setQuickCreateOpen(false);
          }}
        />

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Tipo <span className="text-danger-500">*</span>
          </label>
          <select
            value={form.type}
            onChange={e => handleChange('type', e.target.value as ProductType)}
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('type')}`}
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.type} />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Precio <span className="text-danger-500">*</span>
          </label>
          <input
            type="number"
            value={form.price}
            onChange={e => handleChange('price', Number(e.target.value))}
            min={0}
            step="0.01"
            placeholder="0.00"
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('price')}`}
            required
          />
          <FieldError message={fieldErrors.price} />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Costo de compra</label>
          <input
            type="number"
            value={form.cost ?? ''}
            onChange={e =>
              handleChange('cost', e.target.value === '' ? undefined : Number(e.target.value))
            }
            min={0}
            step="0.01"
            placeholder="0.00"
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('cost')}`}
          />
          <FieldError message={fieldErrors.cost} />
        </div>

        {profitBlock}

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">
            Stock <span className="text-danger-500">*</span>
          </label>
          <input
            type="number"
            value={form.stock}
            onChange={e => handleChange('stock', Number(e.target.value))}
            min={0}
            step={1}
            placeholder="0"
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('stock')}`}
            required
          />
          <FieldError message={fieldErrors.stock} />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Stock mínimo</label>
          <input
            type="number"
            value={form.minStock ?? ''}
            onChange={e =>
              handleChange('minStock', e.target.value === '' ? undefined : Number(e.target.value))
            }
            min={0}
            step={1}
            placeholder="0"
            className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none ${borderFor('minStock')}`}
          />
          <FieldError message={fieldErrors.minStock} />
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <button
            onClick={handleSave}
            disabled={submitting}
            className={`${saveButtonBase} ${submitting ? 'opacity-80 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear producto'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M19 13l3-3m0 0l-3-3m3 3H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </Modal>
  );
}
