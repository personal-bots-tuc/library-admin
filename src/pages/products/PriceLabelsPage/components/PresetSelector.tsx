import { LABEL_PRESETS, PRESET_LABELS } from '../utils/labelConfig';
import type { PresetOption } from '../types';

interface PresetSelectorProps {
  value: PresetOption;
  onChange: (value: PresetOption) => void;
}

export default function PresetSelector({ value, onChange }: PresetSelectorProps) {
  return (
    <div className="flex gap-3">
      {(Object.keys(LABEL_PRESETS) as PresetOption[]).map(preset => {
        const presetData = LABEL_PRESETS[preset];
        const labelInfo = PRESET_LABELS[preset];
        return (
          <label
            key={preset}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
              value === preset
                ? 'border-primary-600 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
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
