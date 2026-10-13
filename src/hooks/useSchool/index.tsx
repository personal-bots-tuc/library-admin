import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSchool } from '../../api/schools';
import { getSettings } from '../../api/settings';
import { useAuth } from '../useAuth';
import type { School, SchoolContextValue, SchoolProviderProps } from './types';

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

const DEFAULT_FALLBACK = 'Mi Negocio';

/**
 * SchoolProvider: obtiene el school del usuario autenticado y settings para fallback chain.
 *
 * Estrategia:
 * - El user logueado tiene `schoolId` en su profile
 * - Al montar, hacemos fetch del school por ID
 * - Los datos se cachean en memoria durante la sesión
 * - Fetch de settings para labelBusinessName (fallback chain), solo con sesión activa
 */
export function SchoolProvider({ children, fallbackName = DEFAULT_FALLBACK }: SchoolProviderProps) {
  const { isAuthenticated } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [settings, setSettings] = useState<{ labelBusinessName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolById = useCallback(async (schoolId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchool(schoolId);
      setSchool({ id: data.id, name: data.name, slug: data.slug });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el negocio';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch de settings para labelBusinessName (fallback chain).
  // /settings requiere Bearer token (authMiddleware + requireAdmin): sin sesión
  // responde 401 y el interceptor de axios fuerza redirect a /login (bucle de
  // recarga en la propia pantalla de login). Solo se fetchea autenticado y se
  // resetea al cerrar sesión.
  useEffect(() => {
    if (!isAuthenticated) {
      queueMicrotask(() => {
        setSettings(null);
      });
      return;
    }
    getSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, [isAuthenticated]);

  // Al montar: leer schoolId del usuario almacenado
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      // Use a microtask to avoid setState in effect
      queueMicrotask(() => {
        setLoading(false);
      });
      return;
    }
    try {
      const user = JSON.parse(stored);
      const schoolId = user.schoolId;
      if (schoolId) {
        // Use a microtask to avoid setState in effect
        queueMicrotask(() => {
          void fetchSchoolById(schoolId);
        });
      } else {
        // Use a microtask to avoid setState in effect
        queueMicrotask(() => {
          setLoading(false);
        });
      }
    } catch {
      // Use a microtask to avoid setState in effect
      queueMicrotask(() => {
        setLoading(false);
      });
    }
  }, [fetchSchoolById]);

  const refetch = useCallback(async () => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    try {
      const user = JSON.parse(stored);
      if (user.schoolId) await fetchSchoolById(user.schoolId);
    } catch {
      // silent fail
    }
  }, [fetchSchoolById]);

  const setSchoolFromLogin = useCallback((newSchool: School) => {
    setSchool(newSchool);
    setLoading(false);
  }, []);

  // Fallback Chain (Single Source of Truth): school.name → settings.labelBusinessName → fallback
  const businessName = school?.name ?? settings?.labelBusinessName ?? fallbackName;

  const value: SchoolContextValue = {
    school,
    schoolName: businessName,
    loading,
    error,
    refetch,
    setSchoolFromLogin,
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error('useSchool debe usarse dentro de SchoolProvider');
  return ctx;
}
