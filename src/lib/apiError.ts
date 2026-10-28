/** Extrae el mensaje que devuelve el backend en `response.data.message`, o usa `fallback`. */
export const getApiErrorMessage = (err: unknown, fallback: string): string =>
  (err as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ??
  fallback;
