import { type Settings } from '../../api/settings';
import { useSettingsConfig } from './hooks/useSettingsConfig';

export default function ConfigPage() {
  const { settings, loading, saving, error, success, handleChange, handleSave, handleDiscard } =
    useSettingsConfig();

  if (loading || !settings) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-white border border-neutral-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl pb-24 relative">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        <p className="text-sm text-neutral-500 mt-1">Personalizá el comportamiento del sistema.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
          {error}
        </div>
      )}

      {/* Bloque General */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-icons text-blue-600">storefront</span>
          <h2 className="text-lg font-semibold text-neutral-900">General</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nombre de la Biblioteca
            </label>
            <input
              type="text"
              value={settings.libraryName}
              onChange={e => handleChange('libraryName', e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nombre para etiquetas/impresiones
            </label>
            <input
              type="text"
              value={settings.labelBusinessName ?? ''}
              onChange={e => handleChange('labelBusinessName', e.target.value)}
              placeholder="Ej: Mi Negocio, Sucursal Centro"
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Si se deja vacío, usa el nombre de la escuela. Fallback: "Mi Negocio"
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Moneda Principal
            </label>
            <select
              value={settings.currency}
              onChange={e => handleChange('currency', e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-shadow"
            >
              <option value="ARS - Peso Argentino">ARS - Peso Argentino</option>
              <option value="USD - Dólar Estadounidense">USD - Dólar Estadounidense</option>
              <option value="EUR - Euro">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Idioma</label>
            <select
              value={settings.language}
              onChange={e => handleChange('language', e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-shadow"
            >
              <option value="Español (Argentina)">Español (Argentina)</option>
              <option value="English (US)">English (US)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Formato de Fecha
            </label>
            <select
              value={settings.dateFormat}
              onChange={e => handleChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-shadow"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bloque POS */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-icons text-blue-600">point_of_sale</span>
          <h2 className="text-lg font-semibold text-neutral-900">Punto de Venta (POS)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Cliente por defecto
            </label>
            <input
              type="text"
              value={settings.defaultClient}
              onChange={e => handleChange('defaultClient', e.target.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Descuento máximo por vendedor (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.maxDiscountPerSeller}
              onChange={e => handleChange('maxDiscountPerSeller', Number(e.target.value))}
              className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
          </div>
        </div>

        <ToggleRow
          title="Permitir venta sin stock"
          description="Habilita vender productos aunque el inventario sea 0 o negativo."
          checked={settings.allowSaleWithoutStock}
          onToggle={() => handleChange('allowSaleWithoutStock', !settings.allowSaleWithoutStock)}
        />
        <div className="space-y-6 mt-6">
          <ToggleRow
            title="Sonido de confirmación"
            description="Emitir sonido al escanear o concretar venta."
            checked={settings.scanSound}
            onToggle={() => handleChange('scanSound', !settings.scanSound)}
          />
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-neutral-200 p-4 px-8 flex items-center justify-end gap-3 z-10 shadow-lg">
        {success && (
          <span className="text-sm font-medium text-green-600 flex items-center gap-1 mr-4">
            <span className="material-icons text-base">check_circle</span>
            Guardado con éxito
          </span>
        )}
        <button
          onClick={handleDiscard}
          disabled={saving}
          className="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
        >
          Descartar cambios
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : (
            'Guardar configuración'
          )}
        </button>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({ title, description, checked, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        >
          {checked && (
            <span className="material-icons text-[10px] text-blue-600 absolute inset-0 flex items-center justify-center font-bold">
              check
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

// Re-exporta el tipo para conveniencia de consumidores
export type { Settings };
