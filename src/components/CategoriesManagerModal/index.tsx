import { useState } from "react";
import Modal from "../Modal";
import { useCategories } from "../../hooks/useCategories";
import { CategoryQuickCreate } from "../CategoryQuickCreate";
import { deleteCategory } from "../../api/categories";
import { useToast } from "../Toast/useToast";
import type { CategoriesManagerModalProps } from "./types";

export default function CategoriesManagerModal({ isOpen, onClose }: CategoriesManagerModalProps) {
  const { categories, refetch } = useCategories();
  const { success, error: showError } = useToast();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      success("Categoría eliminada");
      await refetch();
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal title="Categorías" isOpen={isOpen} onClose={onClose} size="md">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-neutral-600">Gestiona las categorías de productos</p>
            <button onClick={() => setQuickCreateOpen(true)} className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-sm">Nueva categoría</button>
          </div>
          <div className="divide-y border rounded-xl">
            {categories.length === 0 && <div className="p-4 text-sm text-neutral-500">Sin categorías</div>}
            {categories.map(cat => (
              <div key={cat.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{cat.name}</div>
                  {cat.description && <div className="text-xs text-neutral-500">{cat.description}</div>}
                </div>
                <button disabled={deletingId === cat.id} onClick={() => { if (confirm(`¿Eliminar categoría "${cat.name}"?`)) { setDeletingId(cat.id); handleDelete(cat.id); } }} className="text-sm text-danger-600 hover:underline disabled:opacity-50">Eliminar</button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
      <CategoryQuickCreate isOpen={quickCreateOpen} onClose={() => setQuickCreateOpen(false)} onCreated={() => { setQuickCreateOpen(false); refetch(); }} />
    </>
  );
}
