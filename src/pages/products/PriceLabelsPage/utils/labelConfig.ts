export type PresetOption = "10" | "20" | "30";

export interface LabelPreset {
  cols: number;
  rows: number;
  labelWidth: number; // mm
  labelHeight: number; // mm
}

export const LABEL_PRESETS: Record<PresetOption, LabelPreset> = {
  "10": { cols: 2, rows: 5, labelWidth: 95, labelHeight: 50 },
  "20": { cols: 4, rows: 5, labelWidth: 47, labelHeight: 50 },
  "30": { cols: 3, rows: 10, labelWidth: 66, labelHeight: 25 },
};

export const PRESET_LABELS: Record<PresetOption, { label: string; description: string }> = {
  "10": { label: "10 por hoja", description: "2 columnas × 5 filas — Etiquetas grandes (95×50mm)" },
  "20": { label: "20 por hoja", description: "4 columnas × 5 filas — Etiquetas medianas (47×50mm)" },
  "30": { label: "30 por hoja", description: "3 columnas × 10 filas — Estándar Avery 5160 (66×25mm)" },
};

export function getLabelsPerPage(preset: PresetOption): number {
  const p = LABEL_PRESETS[preset];
  return p.cols * p.rows;
}

export function calculateTotalPages(totalLabels: number, preset: PresetOption): number {
  const perPage = getLabelsPerPage(preset);
  return Math.max(1, Math.ceil(totalLabels / perPage));
}