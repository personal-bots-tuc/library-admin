import { useEffect, useRef, useState } from 'react';
import { useIsMutating } from '@tanstack/react-query';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Badge de conectividad — icono informativo, SIN acciones del usuario.
 * Detección 100% pasiva. PROHIBIDO agregar health-pings (rompen App Sleep).
 */
export function ConnectivityBadge() {
  const online = useOnlineStatus();
  const pendingMutations = useIsMutating();
  const [justRecovered, setJustRecovered] = useState(false);
  const wasOfflineRef = useRef(!online);

  useEffect(() => {
    if (online && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setJustRecovered(true);
      const timeout = setTimeout(() => setJustRecovered(false), 3_000);
      return () => clearTimeout(timeout);
    }
    if (!online) wasOfflineRef.current = true;
    return undefined;
  }, [online]);

  if (!online) {
    return (
      <output
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-white" />
        Sin conexión — se completa solo al reconectar
      </output>
    );
  }

  if (justRecovered) {
    return (
      <output
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-white" />
        Conexión recuperada
      </output>
    );
  }

  if (pendingMutations > 0) {
    return (
      <output
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
      >
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
        Guardando…
      </output>
    );
  }

  return null;
}
