import { useState, useEffect, useCallback } from "react";
import { useSchool } from "../../../hooks/useSchool";
import { useAllProducts } from "../../../hooks/useAllProducts";
import { usePriceLabelsSelection } from "./hooks/usePriceLabelsSelection";
import PriceLabelsTable from "./components/PriceLabelsTable";
import PresetSelector from "./components/PresetSelector";
import LabelPreview from "./components/LabelPreview";
import PriceLabelsLoading from "./components/PriceLabelsLoading";
import PriceLabelsError from "./components/PriceLabelsError";
import PriceLabelsHeader from "./components/PriceLabelsHeader";
import { openPrintWindow } from "./utils/printLabels";
import type { PresetOption } from "./types";

export default function PriceLabelsPage() {
  const { school } = useSchool();
  const { products, loading, error, refetch } = useAllProducts();
  const {
    selected,
    totalLabels,
    toggleProduct,
    setQty,
    clearSelection,
    isSelected,
    getQty,
  } = usePriceLabelsSelection();

  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<PresetOption>("30");
  const [showPreview, setShowPreview] = useState(true);

  const schoolName = school?.name ?? "Mi Negocio";

  // Reset selection when products change (e.g., after refetch)
  useEffect(() => {
    clearSelection();
  }, [products.length, clearSelection]);

  const handlePrint = useCallback(() => {
    if (totalLabels === 0) return;
    openPrintWindow({
      products,
      selection: selected,
      preset,
      schoolName,
    });
  }, [products, selected, totalLabels, preset, schoolName]);

  const handleClearAll = useCallback(() => {
    clearSelection();
    setSearch("");
  }, [clearSelection]);

  if (loading) {
    return <PriceLabelsLoading />;
  }

  if (error) {
    return <PriceLabelsError error={error} onRetry={refetch} />;
  }

  return (
    <div className="p-6 space-y-6">
      <PriceLabelsHeader
        totalLabels={totalLabels}
        onClearAll={handleClearAll}
        onPrint={handlePrint}
        disabledPrint={totalLabels === 0}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceLabelsTable
            products={products}
            selection={{
              selected,
              totalLabels,
              toggleProduct,
              setQty,
              clearSelection,
              isSelected,
              getQty,
            }}
            search={search}
            onSearchChange={setSearch}
          />

          <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">Formato de hoja</h3>
            <PresetSelector value={preset} onChange={setPreset} />
          </div>
        </div>

        {showPreview && (
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center justify-between">
                Vista previa
                {totalLabels > 0 && (
                  <span className="text-xs text-neutral-500 font-mono">
                    {totalLabels} etiquetas
                  </span>
                )}
              </h3>
              {totalLabels === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <span className="material-icons text-4xl mb-2 block">print_disabled</span>
                  <p>Seleccioná productos para ver la vista previa</p>
                </div>
              ) : (
                <LabelPreview
                  products={products}
                  selection={selected}
                  preset={preset}
                  schoolName={schoolName}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}