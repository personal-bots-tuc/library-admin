import { createStore, get, set, del, clear } from 'idb-keyval';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';

/**
 * Persistencia del cache de React Query en IndexedDB, namespaced por
 * tenant+usuario (`schoolId:userId`) para no filtrar datos entre usuarios
 * de la misma PC.
 */

const DB_NAME = 'admin-offline-cache';
const STORE_PREFIX = 'rq';
const PERSIST_KEY_PREFIX = 'admin-query';

interface CachedIdentity {
  schoolId?: string;
  id?: string;
}

export function getCacheNamespace(): string {
  try {
    const raw = localStorage.getItem('user');
    const user = raw ? (JSON.parse(raw) as CachedIdentity) : null;
    if (user?.schoolId && user?.id) return `${user.schoolId}:${user.id}`;
  } catch {
    // storage inaccesible o JSON corrupto → namespace anónimo
  }
  return 'anon';
}

function storeFor(namespace: string) {
  return createStore(DB_NAME, `${STORE_PREFIX}-${namespace}`);
}

export function createCachePersister(namespace: string): Persister {
  const store = storeFor(namespace);
  const key = `${PERSIST_KEY_PREFIX}-${namespace}`;
  return {
    persistClient: (client: PersistedClient) => set(key, client, store),
    restoreClient: () => get<PersistedClient>(key, store),
    removeClient: () => del(key, store),
  };
}

export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

/**
 * Purga el cache persistido del usuario ACTUAL (best-effort: nunca lanza).
 * Llamar ANTES de limpiar localStorage en logout.
 */
export async function purgePersistedCache(): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    await clear(storeFor(getCacheNamespace()));
  } catch {
    // El store aún no existe para este namespace: nada que purgar.
  }
}
