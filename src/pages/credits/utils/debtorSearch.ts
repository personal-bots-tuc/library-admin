const REGEX_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

/**
 * El backend (`ListCreditAccounts`) compila `search` con `new RegExp`, así que los caracteres
 * especiales del input (`(`, `+`, `[`…) deben llegar escapados para buscar texto literal.
 * Devuelve `undefined` si no hay término, para no mandar el query param.
 */
export const toDebtorSearchTerm = (raw: string): string | undefined => {
  const term = raw.trim();
  return term ? term.replace(REGEX_SPECIAL_CHARS, '\\$&') : undefined;
};
