import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { Toast } from './index';
import type { ToastKind } from './types';

export type { ToastKind } from './types';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, kind, message }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      success: msg => show('success', msg),
      error: msg => show('error', msg),
      warning: msg => show('warning', msg),
      info: msg => show('info', msg),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map(t => (
        <Toast key={t.id} kind={t.kind} message={t.message} onClose={() => remove(t.id)} />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
