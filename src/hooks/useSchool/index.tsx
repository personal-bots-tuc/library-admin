import { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSchool } from '../../api/schools';
import { getSettings } from '../../api/settings';
import { useAuth } from '../useAuth';
import type { School, SchoolContextValue, SchoolProviderProps } from './types';

const SchoolContext = createContext<SchoolContextValue | undefined>(undefined);

const DEFAULT_FALLBACK = 'Mi Negocio';

const SCHOOL_KEY = 'school';
const SETTINGS_KEY = 'settings';

function useSchoolData(schoolId: string | null, isAuthenticated: boolean) {
  const schoolQuery = useQuery({
    queryKey: [SCHOOL_KEY, schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error('Sin schoolId');
      const data = await getSchool(schoolId);
      return { id: data.id, name: data.name, slug: data.slug } satisfies School;
    },
    enabled: !!schoolId,
    staleTime: 10 * 60_000,
  });

  const settingsQuery = useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: getSettings,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
    retry: false,
  });

  return { schoolQuery, settingsQuery };
}

function resolveBusinessName(
  schoolName: string | undefined,
  labelBusinessName: string | undefined,
  fallbackName: string
): string {
  return schoolName ?? labelBusinessName ?? fallbackName;
}

function resolveSchoolError(err: unknown): string | null {
  if (!err) return null;
  if (err instanceof Error) return err.message;
  return 'Error al cargar el negocio';
}

/**
 * SchoolProvider: obtiene el school del usuario autenticado y settings para fallback chain.
 *
 * Migrado a React Query: el school queda persistido en IndexedDB (arranque
 * instantáneo tras App Sleep) y settings solo vive en memoria (requiere sesión;
 * sin ella /settings responde 401 y el interceptor fuerza redirect a /login).
 */
export function SchoolProvider({ children, fallbackName = DEFAULT_FALLBACK }: SchoolProviderProps) {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { schoolQuery, settingsQuery } = useSchoolData(user?.schoolId ?? null, isAuthenticated);

  const refetch = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [SCHOOL_KEY] }),
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
    ]);
  }, [queryClient]);

  const setSchoolFromLogin = useCallback(
    (newSchool: School) => {
      queryClient.setQueryData([SCHOOL_KEY, newSchool.id], newSchool);
    },
    [queryClient]
  );

  const value: SchoolContextValue = {
    school: schoolQuery.data ?? null,
    // Fallback Chain (Single Source of Truth): school.name → settings.labelBusinessName → fallback
    schoolName: resolveBusinessName(
      schoolQuery.data?.name,
      settingsQuery.data?.labelBusinessName,
      fallbackName
    ),
    loading: Boolean(user?.schoolId) && schoolQuery.isPending,
    error: resolveSchoolError(schoolQuery.error),
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
