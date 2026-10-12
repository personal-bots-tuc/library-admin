import { LABEL_PRESETS } from "../utils/labelConfig";
import type { PresetOption } from "../types";

interface PresetSelectorProps {
  value: PresetOption;
  onChange: (value: PresetOption) => void;
}

const PRESET_LABELS: Record<PresetOption, { label: string; description: string }> = {
  "10": { label: "10 por hoja", description: "2 columnas × 5 filas — Etiquetas grandes (95×50mm)" },
  "20": { label: "20 por hoja", description: "4 columnas × 5 filas — Etiquetas medianas (47×50mm)" },
  "30": { label: "30 por hoja", description: "3 columnas × 10 filas — Estándar Avery 5160 (66×25mm)" },
};

export default function PresetSelector({ value, onChange }: PresetSelectorProps) {
  return (
    <div className="flex gap-3">
      {(Object.keys(LABEL_PRESETS) as PresetOption[]).map((preset) => {
        const presetData = LABEL_PRESETS[preset];
        const labelInfo = PRESET_LABELS[preset];
        return (
          <label
            key={preset}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
              value === preset
                ? "border-primary-600 bg-primary-50"
                : "border-neutral-200 hover:border-primary-300 hover:bg-neutral-50"
            }`}
          >
            <input
              type="radio"
              name="label-preset"
              value={preset}
              checked={value === preset}
              onChange={() => onChange(preset)}
              className="sr-only"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-neutral-900">{labelInfo.label}</span>
              <span className="text-xs text-neutral-500">{labelInfo.description}</span>
            </div>
            <div className="ml-auto text-xs text-neutral-400 font-mono">
              {presetData.cols}×{presetData.rows}
            </div>
          </label>
        );
      })}
    </div>
  );
}