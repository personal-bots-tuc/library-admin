import { useState } from 'react';
import Modal from '../../../../components/Modal';
import {
  REPORT_COLUMNS,
  DEFAULT_REPORT_COLUMNS,
  type ReportColumnKey,
} from '../../utils/printProductsReport';
import type { PrintReportModalProps } from './types';

const MAX_COLS = 5; // ~recomendado para A4 portrait legible

export default function PrintReportModal({
  isOpen,
  onClose,
  onPrint,
  totalFiltered,
  generating,
}: PrintReportModalProps) {
  const [selected, setSelected] = useState<Set<ReportColumnKey>>(new Set(DEFAULT_REPORT_COLUMNS));

  function toggle(key: ReportColumnKey) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const ordered = (Object.keys(REPORT_COLUMNS) as ReportColumnKey[]).filter(k => selected.has(k));
  const canPrint = ordered.length > 0 && !generating;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Imprimir listado de productos" size="md">
      <div className="space-y-5">
        <p className="text-sm text-neutral-600">
          Se imprimirán <strong>{totalFiltered}</strong> productos con los filtros actuales. Elegí
          qué columnas incluir en el reporte.
        </p>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase text-neutral-500 tracking-wide">
            Columnas ({ordered.length}/{Object.keys(REPORT_COLUMNS).length})
          </legend>
          {(Object.keys(REPORT_COLUMNS) as ReportColumnKey[]).map(key => {
            const col = REPORT_COLUMNS[key];
            const checked = selected.has(key);
            return (
              <label
                key={key}
                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                  checked
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="w-4 h-4 accent-primary-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-800">{col.label}</div>
                  <div className="text-xs text-neutral-500">alineación {col.align}</div>
                </div>
              </label>
            );
          })}
        </fieldset>

        {ordered.length > MAX_COLS && (
          <p className="text-xs text-warning-600">
            ⚠ Más de {MAX_COLS} columnas puede verse angosto en A4 portrait.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onPrint(ordered)}
            disabled={!canPrint}
            className="flex-1 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <span className="material-icons text-sm">print</span>
            {generating ? 'Generando…' : 'Imprimir'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
