export const money = (v: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  })
    .format(v)
    .replace('ARS', '$');

export const initials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const dateOptions = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** Monto en pesos con separador de miles local, sin decimales forzados: `$3.500`. */
export const formatCurrency = (v: number) => `$${v.toLocaleString('es-AR')}`;

/** Monto con signo explícito (`+$3.000`, `-$200`); cero se muestra sin signo. */
export const formatSignedCurrency = (v: number) =>
  `${v > 0 ? '+' : v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString('es-AR')}`;

/** Hora `HH:mm`, o `—` si no hay fecha. */
export const formatTime = (iso?: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

/** Fecha corta con hora, `dd/mm HH:mm`. */
export const formatShortDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
