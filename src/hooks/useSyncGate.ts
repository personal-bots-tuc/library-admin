import { useSyncExternalStore } from 'react';

/**
 * useSyncGate — ÚNICA compuerta aprobada para sync/polling automático.
 *
 * Regla del repo (docs/agent/traps.md): está prohibido usar setInterval para
 * refetch fuera de este módulo. Cualquier polling sin compuertas mantiene
 * despiertos los servicios de Railway (App Sleep) y genera gasto idle.
 *
 * Devuelve `true` solo si:
 *   - la pestaña está visible (document.visibilityState)
 *   - hubo actividad del usuario en los últimos INACTIVITY_LIMIT_MS
 *
 * Store singleton con useSyncExternalStore: un solo set de listeners y un
 * solo timer para toda la app.
 */

export const INACTIVITY_LIMIT_MS = 10 * 60 * 1000;
const RECHECK_MS = 15_000;
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'mousemove'] as const;

let lastActivity = Date.now();

function isVisible(): boolean {
  return typeof document === 'undefined' ? true : document.visibilityState === 'visible';
}

function computeGate(): boolean {
  return isVisible() && Date.now() - lastActivity < INACTIVITY_LIMIT_MS;
}

let snapshot = computeGate();
const listeners = new Set<() => void>();

function emitAll() {
  for (const listener of listeners) listener();
}

function refreshSnapshot() {
  const next = computeGate();
  if (next !== snapshot) {
    snapshot = next;
    emitAll();
  }
}

function attachListeners(): () => void {
  const markActivity = () => {
    lastActivity = Date.now();
    refreshSnapshot();
  };
  const onVisibilityChange = () => refreshSnapshot();

  for (const event of ACTIVITY_EVENTS) {
    window.addEventListener(event, markActivity, { passive: true });
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Único timer permitido: detecta el cruce del umbral de inactividad.
  const recheck = setInterval(refreshSnapshot, RECHECK_MS);
  refreshSnapshot();

  return () => {
    for (const event of ACTIVITY_EVENTS) {
      window.removeEventListener(event, markActivity);
    }
    document.removeEventListener('visibilitychange', onVisibilityChange);
    clearInterval(recheck);
  };
}

let teardown: (() => void) | null = null;
let subscriberCount = 0;

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  subscriberCount += 1;
  if (!teardown) teardown = attachListeners();
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    subscriberCount -= 1;
    if (subscriberCount <= 0 && teardown) {
      teardown();
      teardown = null;
      subscriberCount = 0;
    }
  };
}

export function useSyncGate(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => true
  );
}

/** Utilidad de test: reinicia el estado del store entre tests. */
export function __resetSyncGateForTests(): void {
  lastActivity = Date.now();
  snapshot = computeGate();
}
