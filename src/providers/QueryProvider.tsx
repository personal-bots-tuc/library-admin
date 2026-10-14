import { useMemo, type PropsWithChildren } from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useAuth } from '../hooks/useAuth';
import { createQueryClient, shouldPersistQuery } from '../lib/queryClient';
import { createCachePersister, PERSIST_MAX_AGE } from '../lib/persistence';

/**
 * Provider raíz de datos. Se remonta cuando cambia la identidad
 * (schoolId:userId): cada usuario/tenant trabaja sobre su propio cache
 * persistido, sin filtrar datos entre sesiones en la misma PC.
 */
export function QueryProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  const userId = user?.id;

  const query = useMemo(() => {
    const identityKey = schoolId && userId ? `${schoolId}:${userId}` : 'anon';
    return {
      identityKey,
      client: createQueryClient(),
      persister: createCachePersister(identityKey),
    };
  }, [schoolId, userId]);

  return (
    <PersistQueryClientProvider
      key={query.identityKey}
      client={query.client}
      persistOptions={{
        persister: query.persister,
        maxAge: PERSIST_MAX_AGE,
        dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
      }}
      onSuccess={() => {
        void query.client.getMutationCache().resumePausedMutations();
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
