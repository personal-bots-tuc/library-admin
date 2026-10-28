/** Extrae el mensaje que devuelve el backend en `response.data.message`, o usa `fallback`. */
export const getApiErrorMessage = (err: unknown, fallback: string): string =>
  (err as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ??
  fallback;

/**
 * Convierte `response.data.details` (claves tipo `body.campo`) en un mapa `campo -> primer mensaje`.
 * Solo devuelve errores de validación del body; cualquier otra forma devuelve `{}`.
 */
export const getApiFieldErrors = (err: unknown): Record<string, string> => {
  const details = (err as { response?: { data?: { details?: Record<string, unknown> } } } | null)
    ?.response?.data?.details;
  if (!details || typeof details !== 'object') return {};

  const result: Record<string, string> = {};
  for (const [key, messages] of Object.entries(details)) {
    if (!key.startsWith('body.')) continue;
    const field = key.slice('body.'.length);
    const first = Array.isArray(messages) ? messages[0] : undefined;
    if (typeof first === 'string') result[field] = first;
  }
  return result;
};
