import { useMemo } from "react";
import { money } from "../../../../lib/format";
import type { Product } from "../../../../api/products";
import type { UsePriceLabelsSelectionReturn } from "../hooks/usePriceLabelsSelection";

interface PriceLabelsTableProps {
  products: Product[];
  selection: UsePriceLabelsSelectionReturn;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function PriceLabelsTable({
  products,
  selection,
  search,
  onSearchChange,
}: PriceLabelsTableProps) {
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term)
    );
  }, [products, search]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="pricelabels-search" className="sr-only">Buscar productos</label>
          <input
            id="pricelabels-search"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o código... (/)"
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span>{filteredProducts.length} productos</span>
          {selection.totalLabels > 0 && (
            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
              {selection.totalLabels} etiquetas
            </span>
          )}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-xs font-semibold text-neutral-400 uppercase">
              <th className="px-3 py-2 text-left w-10">
                <input
                  type="checkbox"
                  checked={filteredProducts.length > 0 && filteredProducts.every((p) => selection.isSelected(p.id))}
                  onChange={() => {
                    if (filteredProducts.every((p) => selection.isSelected(p.id))) {
                      filteredProducts.forEach((p) => selection.setQty(p.id, 0));
                    } else {
                      filteredProducts.forEach((p) => selection.toggleProduct(p));
                    }
                  }}
                />
              </th>
              <th className="px-3 py-2 text-left">Producto</th>
              <th className="px-3 py-2 text-left">Código</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-right w-24">Cantidad</th>
              <th className="px-3 py-2 text-right">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredProducts.map((p) => {
              const isSel = selection.isSelected(p.id);
              const qty = selection.getQty(p.id);
              return (
                <tr key={p.id} className={`hover:bg-neutral-50 ${isSel ? "bg-primary-50" : ""}`}>
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => selection.toggleProduct(p)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-neutral-900">{p.name}</div>
                  </td>
                  <td className="px-3 py-3 text-neutral-500 font-mono text-xs">
                    {p.code ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-medium">{money(p.price)}</td>
                  <td className="px-3 py-3 text-right">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={qty}
                      onChange={(e) => selection.setQty(p.id, Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2 py-1.5 text-center text-sm border border-neutral-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-3 py-3 text-right text-neutral-600">
                    {p.type === "service" ? "∞" : p.stock}
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400 text-sm">
                  {search.trim()
                    ? "No se encontraron productos con ese criterio"
                    : "No hay productos disponibles"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}