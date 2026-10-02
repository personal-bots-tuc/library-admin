import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSchool } from "../../api/schools";
import type { School, SchoolContextValue, SchoolProviderProps } from "./types";

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

const DEFAULT_FALLBACK = "Sistema";

/**
 * SchoolProvider: obtiene el school del usuario autenticado.
 *
 * Estrategia:
 * - El user logueado tiene `schoolId` en su profile
 * - Al montar, limpiamos del storage y hacemos fetch del school por ID
 * - Los datos se cachean en memoria durante la sesión
 */
export function SchoolProvider({ children, fallbackName = DEFAULT_FALLBACK }: SchoolProviderProps) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolById = useCallback(async (schoolId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchool(schoolId);
      setSchool({ id: data.id, name: data.name, slug: data.slug });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar el negocio";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Al montar: leer schoolId del usuario almacenado
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const user = JSON.parse(stored);
      const schoolId = user.schoolId;
      if (schoolId) {
        void fetchSchoolById(schoolId);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [fetchSchoolById]);

  const refetch = useCallback(async () => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    try {
      const user = JSON.parse(stored);
      if (user.schoolId) await fetchSchoolById(user.schoolId);
    } catch {
      // silent fail
    }
  }, [fetchSchoolById]);

  const setSchoolFromLogin = useCallback((school: School) => {
    setSchool(school);
    setLoading(false);
  }, []);

  const schoolName = school?.name ?? fallbackName;

  const value: SchoolContextValue = {
    school,
    schoolName,
    loading,
    error,
    refetch,
    setSchoolFromLogin,
  };

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
}

export function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) throw new Error("useSchool debe usarse dentro de SchoolProvider");
  return ctx;
}
