import { useMemo } from "react";
import { money } from "../../../../lib/format";
import type { Product } from "../../../../api/products";
import type { PresetOption } from "../types";
import { LABEL_PRESETS } from "../utils/labelConfig";

interface LabelPreviewProps {
  products: Product[];
  selection: Map<string, number>;
  preset: PresetOption;
  schoolName: string;
}

function LabelCard({ product, qty, schoolName }: { product: Product; qty: number; schoolName: string }) {
  return (
    <div className="border border-neutral-300 rounded-lg p-3 bg-white flex flex-col justify-between min-h-[80px]">
      <div>
        <p className="text-xs font-semibold text-neutral-700 truncate">{schoolName}</p>
        <p className="text-xs text-neutral-400 mt-1 truncate">{product.name}</p>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="text-lg font-bold text-neutral-900">{money(product.price)}</span>
        <span className="text-xs font-mono text-neutral-500">{product.code ?? "—"}</span>
      </div>
      {qty > 1 && (
        <div className="mt-1 text-xs text-neutral-500 text-right">
          ×{qty} etiquetas
        </div>
      )}
    </div>
  );
}

export default function LabelPreview({ products, selection, preset, schoolName }: LabelPreviewProps) {
  const presetData = LABEL_PRESETS[preset];
  const labelsPerPage = presetData.cols * presetData.rows;

  const labelsToRender = useMemo(() => {
    const result: Array<{ product: Product; qty: number }> = [];
    products.forEach((p) => {
      const qty = selection.get(p.id);
      if (qty && qty > 0) {
        for (let i = 0; i < qty; i++) {
          result.push({ product: p, qty });
        }
      }
    });
    return result;
  }, [products, selection]);

  const totalPages = Math.max(1, Math.ceil(labelsToRender.length / labelsPerPage));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600">
          {labelsToRender.length} etiquetas · {labelsPerPage} por hoja · {totalPages} hoja{totalPages > 1 ? "s" : ""}
        </span>
        <span className="text-neutral-400 font-mono">
          {presetData.cols}×{presetData.rows} · {presetData.labelWidth}×{presetData.labelHeight}mm
        </span>
      </div>

      <div className="space-y-6">
        {Array.from({ length: totalPages }, (_, pageIndex) => {
          const start = pageIndex * labelsPerPage;
          const end = Math.min(start + labelsPerPage, labelsToRender.length);
          const pageLabels = labelsToRender.slice(start, end);

          return (
            <div
              key={pageIndex}
              className="bg-white border border-neutral-200 rounded-xl p-4"
              style={{
                width: "210mm",
                minHeight: "297mm",
                boxSizing: "border-box",
              }}
            >
              <div className="text-xs text-neutral-400 mb-2 text-center">
                Hoja {pageIndex + 1} de {totalPages}
              </div>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${presetData.cols}, 1fr)`,
                  gap: "2mm",
                }}
              >
                {pageLabels.map(({ product, qty }, i) => (
                  <LabelCard key={`${pageIndex}-${i}`} product={product} qty={qty} schoolName={schoolName} />
                ))}
                {pageLabels.length < labelsPerPage && (
                  <>
                    {Array.from({ length: labelsPerPage - pageLabels.length }).map((_, i) => (
                      <div key={`empty-${pageIndex}-${i}`} className="border border-dashed border-neutral-300 rounded-lg min-h-[80px]" />
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}