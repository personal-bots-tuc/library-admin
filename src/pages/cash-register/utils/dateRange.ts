/**
 * Convierte una fecha local `YYYY-MM-DD` (la que entrega `<input type="date">`) en el
 * ISO del inicio o fin de ese día en la zona horaria del navegador. Usar
 * `new Date("YYYY-MM-DD")` tomaría medianoche UTC y corre el rango un día en Argentina.
 */
const parseLocalDate = (ymd: string) => {
  const [year, month, day] = ymd.split('-').map(Number);
  return { year, month, day };
};

export const startOfDayIso = (ymd: string): string | undefined => {
  if (!ymd) return undefined;
  const { year, month, day } = parseLocalDate(ymd);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
};

export const endOfDayIso = (ymd: string): string | undefined => {
  if (!ymd) return undefined;
  const { year, month, day } = parseLocalDate(ymd);
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
};
