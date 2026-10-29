import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSchool } from '../../../hooks/useSchool';
import { useAllProducts } from '../../../hooks/useAllProducts';
import { useCategories } from '../../../hooks/useCategories';
import { usePriceLabelsSelection } from './hooks/usePriceLabelsSelection';
import PriceLabelsTable from './components/PriceLabelsTable';
import PresetSelector from './components/PresetSelector';
import LabelPreview from './components/LabelPreview';
import PriceLabelsLoading from './components/PriceLabelsLoading';
import PriceLabelsError from './components/PriceLabelsError';
import PriceLabelsHeader from './components/PriceLabelsHeader';
import { openPrintWindow } from './utils/printLabels';
import type { PresetOption } from './types';

export default function PriceLabelsPage() {
  const { school } = useSchool();
  const { products, loading, error, refetch } = useAllProducts();
  const { categories } = useCategories();
  const selection = usePriceLabelsSelection();
  const { selected, totalLabels, clearSelection, pruneTo } = selection;

  const [preset, setPreset] = useState<PresetOption>('30');
  const [showPreview, setShowPreview] = useState(true);

  const schoolName = school?.name ?? 'Mi Negocio';

  // Solo se descartan de la selección los productos que ya no están en el catálogo.
  // Antes se vaciaba todo cuando cambiaba la cantidad de productos (refetch/sync).
  const catalogIds = useMemo(() => products.map(p => p.id), [products]);
  useEffect(() => {
    pruneTo(catalogIds);
  }, [catalogIds, pruneTo]);

  const handlePrint = useCallback(() => {
    if (totalLabels === 0) return;
    openPrintWindow({
      products,
      selection: selected,
      preset,
      schoolName,
    });
  }, [products, selected, totalLabels, preset, schoolName]);

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
        onClearAll={clearSelection}
        onPrint={handlePrint}
        disabledPrint={totalLabels === 0}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceLabelsTable products={products} categories={categories} selection={selection} />

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
