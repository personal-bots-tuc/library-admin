import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings, type Settings } from '../../../../api/settings';

/**
 * Encapsula el estado de ConfigPage: carga, edición, guardado y descarte de settings.
 * Separa la lógica de la UI para mantener el componente por debajo del límite de complejidad.
 */
export function useSettingsConfig() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSettings();
      setSettings(data);
    } catch {
      setError('Error al cargar la configuración.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const handleChange = useCallback((field: keyof Settings, value: string | boolean | number) => {
    setSettings((prev: Settings | null) => (prev ? { ...prev, [field]: value } : prev));
    setSuccess(false);
    setError('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const data = await updateSettings(settings);
      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleDiscard = useCallback(async () => {
    setSuccess(false);
    await load();
  }, [load]);

  return {
    settings,
    loading,
    saving,
    error,
    success,
    handleChange,
    handleSave,
    handleDiscard,
  };
}
