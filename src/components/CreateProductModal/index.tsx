import { useState } from "react";
import { useToast } from "../Toast/useToast";
import Modal from "../Modal";
import { unitGrossProfit, unitMarginPercent, formatPercent } from "../../lib/profit";
import { createProduct, updateProduct } from "../../api/products";
import { useCategories } from "../../hooks/useCategories";
import { CategoryQuickCreate } from "../CategoryQuickCreate";
import type { CreateProductForm, CreateProductModalProps, ProductType } from "./types";

const EMPTY_FORM: CreateProductForm = {
  name: "",
  type: "product",
  price: 0,
  cost: undefined,
  stock: 0,
  minStock: undefined,
  code: "",
  categoryId: null,
};

const TYPE_OPTIONS: { label: string; value: ProductType }[] = [
  { label: "Producto", value: "product" },
  { label: "Servicio", value: "service" },
];

function mapToForm(data?: CreateProductModalProps["initialData"]): CreateProductForm {
  if (!data) return EMPTY_FORM;
  return {
    name: data.name,
    type: data.type,
    price: data.price,
    cost: data.cost,
    stock: data.stock,
    minStock: data.minStock,
    code: data.code ?? "",
    categoryId: data.categoryId ?? null,
  };
}

export default function CreateProductModal({ isOpen, onClose, onSuccess, initialData }: CreateProductModalProps) {
  if (!isOpen) return null;

  const [form, setForm] = useState<CreateProductForm>(() => mapToForm(initialData));
  const { success, error: showError } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { categories, loading: categoriesLoading } = useCategories();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const handleChange = (field: keyof CreateProductForm, value: string | number | undefined) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (initialData) {
        await updateProduct(initialData.id, form);
      } else {
        await createProduct(form);
      }
      success(`Producto "${form.name}" guardado correctamente`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar el producto";
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const profitBlock =
    form.cost !== undefined ? (
      <div className="mt-2">
        <p className="text-sm text-neutral-600">
          Ganancia estimada: <span className="font-semibold">{unitGrossProfit(form.price, form.cost ?? 0).toLocaleString("es-AR")}</span>
        </p>
        <p className="text-sm text-neutral-600">
          Margen estimado: <span className="font-semibold">{formatPercent(unitMarginPercent(form.price, form.cost ?? 0))}</span>
        </p>
        {form.price <= form.cost && <p className="text-amber-600 font-medium">El precio no cubre el costo de compra.</p>}
      </div>
    ) : null;

  return (
    <Modal title={initialData ? "Editar producto" : "Crear producto"} isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Nombre <span className="text-danger-500">*</span></label>
          <input value={form.name} onChange={e => handleChange("name", e.target.value)} maxLength={120} placeholder="Ej: Cuaderno espiral A4" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none" required />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Código de producto</label>
          <input value={form.code ?? ""} onChange={e => handleChange("code", e.target.value.toUpperCase())} maxLength={50} placeholder="Ej: PRD-ABC123 o código de barras (opcional)" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none" />
          <p className="text-xs text-neutral-500 mt-1">Se auto-genera si queda vacío (formato: PRD-XXXXX / SRV-XXXXX)</p>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Categoría</label>
          <div className="flex gap-2">
            <select value={form.categoryId ?? ""} onChange={e => handleChange("categoryId", e.target.value || null)} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none" disabled={categoriesLoading}>
              <option value="">Sin categoría</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <button type="button" onClick={() => setQuickCreateOpen(true)} className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-sm font-medium" title="Nueva categoría">+</button>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Categoría opcional</p>
        </div>

        <CategoryQuickCreate isOpen={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} onCreated={id => { setForm(f => ({ ...f, categoryId: id })); setQuickCreateOpen(false); }} />

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Tipo <span className="text-danger-500">*</span></label>
          <select value={form.type} onChange={e => handleChange("type", e.target.value as ProductType)} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none">
            {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Precio <span className="text-danger-500">*</span></label>
          <input type="number" value={form.price} onChange={e => handleChange("price", Number(e.target.value))} min={0} step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none" required />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Costo de compra</label>
          <input type="number" value={form.cost ?? ""} onChange={e => handleChange("cost", e.target.value === "" ? undefined : Number(e.target.value))} min={0} step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none" />
        </div>

        {profitBlock}

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Stock <span className="text-danger-500">*</span></label>
          <input type="number" value={form.stock} onChange={e => handleChange("stock", Number(e.target.value))} min={0} step={1} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none" required />
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-1">Stock mínimo</label>
          <input type="number" value={form.minStock ?? ""} onChange={e => handleChange("minStock", e.target.value === "" ? undefined : Number(e.target.value))} min={0} step={1} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:border-primary-500 focus:outline-none" />
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <button onClick={handleSave} disabled={submitting} className={`w-full py-3.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 ${submitting ? "opacity-80 cursor-not-allowed" : ""}`}>
            {submitting ? "Guardando..." : initialData ? "Actualizar" : "Crear producto"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M19 13l3-3m0 0l-3-3m3 3H3" /></svg>
          </button>
        </div>
      </div>
    </Modal>
  );
}
