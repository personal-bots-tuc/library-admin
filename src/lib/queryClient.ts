import { QueryClient, type Query } from '@tanstack/react-query';

/**
 * Query keys de PRIMER NIVEL que sí se persisten en IndexedDB.
 * Solo lectura estable. NUNCA persistir: auth/sesión, conversaciones del bot,
 * ventas, caja (volátiles o sensibles).
 * Ref: docs/agent/traps.md — "Polling y cache local"
 */
const PERSISTED_ROOT_KEYS = new Set(['products', 'school']);

export function shouldPersistQuery(query: Query): boolean {
  return PERSISTED_ROOT_KEYS.has(String(query.queryKey[0]));
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Se pausan sin conexión y se reanudan solas al volver (sin acción del usuario).
        networkMode: 'online',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        // refetchIntervalInBackground queda false por defecto:
        // jamás refetch con la pestaña oculta (compatible con Railway App Sleep).
        staleTime: 60_000,
        // gcTime debe ser >= maxAge del persister (persistence.ts).
        gcTime: 24 * 60 * 60 * 1000,
        retry: 1,
        retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10_000),
      },
      mutations: {
        networkMode: 'online',
        // NUNCA reintentar escrituras a ciegas.
        retry: 0,
      },
    },
  });
}
