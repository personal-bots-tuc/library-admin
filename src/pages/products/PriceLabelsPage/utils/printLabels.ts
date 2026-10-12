import type { Product } from "../../../../api/products";
import type { PresetOption, LabelPreset } from "../types";
import { LABEL_PRESETS } from "./labelConfig";

interface PrintLabelsOptions {
  products: Product[];
  selection: Map<string, number>;
  preset: PresetOption;
  schoolName: string;
}

function generateLabelHTML(
  product: Product,
  schoolName: string,
  preset: LabelPreset
): string {
  const price = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(product.price);

  return `
    <div class="label" style="
      width: ${preset.labelWidth}mm;
      height: ${preset.labelHeight}mm;
      box-sizing: border-box;
      padding: 3mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: white;
      page-break-inside: avoid;
      break-inside: avoid;
    ">
      <div>
        <p style="margin: 0; font-size: 10px; font-weight: 600; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(schoolName)}
        </p>
        <p style="margin: 1mm 0 0; font-size: 9px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(product.name)}
        </p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 2mm;">
        <span style="font-size: 14px; font-weight: 700; color: #1f2937;">${price}</span>
        <span style="font-size: 8px; font-family: monospace; color: #6b7280;">${escapeHtml(product.code ?? "—")}</span>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&")
    .replace(/'/g, "'");
}

function generatePrintCSS(preset: LabelPreset): string {
  return `
    @page {
      size: A4;
      margin: 5mm;
    }
    @media print {
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
      .label { break-inside: avoid; page-break-inside: avoid; }
      body { margin: 0; padding: 0; }
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      box-sizing: border-box;
      padding: 5mm;
      page-break-after: always;
    }
    .page:last-child {
      page-break-after: auto;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(${preset.cols}, 1fr);
      gap: 2mm;
    }
    .label {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    * {
      box-sizing: border-box;
    }
  `;
}

export function openPrintWindow(options: PrintLabelsOptions): void {
  const { products, selection, preset, schoolName } = options;
  const presetData = LABEL_PRESETS[preset];
  const labelsPerPage = presetData.cols * presetData.rows;

  // Build array of labels to print (expanded by qty)
  const labelsToPrint: Product[] = [];
  products.forEach((p) => {
    const qty = selection.get(p.id);
    if (qty && qty > 0) {
      for (let i = 0; i < qty; i++) {
        labelsToPrint.push(p);
      }
    }
  });

  if (labelsToPrint.length === 0) return;

  // Group into pages
  const pages: Product[][] = [];
  for (let i = 0; i < labelsToPrint.length; i += labelsPerPage) {
    pages.push(labelsToPrint.slice(i, i + labelsPerPage));
  }

  const css = generatePrintCSS(presetData);

  const pagesHTML = pages.map((pageLabels, pageIndex) => {
    const labelsHTML = pageLabels.map((p) => generateLabelHTML(p, schoolName, presetData)).join("");
    const emptySlots = labelsPerPage - pageLabels.length;
    const emptyHTML = Array.from({ length: emptySlots }, () =>
      `<div class="label" style="width: ${presetData.labelWidth}mm; height: ${presetData.labelHeight}mm; border: 1px dashed #d1d5db; border-radius: 4px; background: #f9fafb;"></div>`
    ).join("");

    return `
      <div class="page${pageIndex === pages.length - 1 ? " last-page" : ""}">
        <div class="grid">${labelsHTML}${emptyHTML}</div>
      </div>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Etiquetas de precios</title>
      <style>${css}</style>
    </head>
    <body>
      ${pagesHTML}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
