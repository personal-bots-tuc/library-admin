import { describe, it, expect } from 'vitest';
import { formatCurrency, formatSignedCurrency, formatTime } from './format';

describe('formatCurrency', () => {
  it('debería formatear el monto con signo de pesos y separador de miles', () => {
    expect(formatCurrency(3500)).toBe('$3.500');
  });
});

describe('formatSignedCurrency', () => {
  it('debería anteponer + cuando el monto es positivo', () => {
    expect(formatSignedCurrency(3000)).toBe('+$3.000');
  });

  it('debería anteponer - cuando el monto es negativo', () => {
    expect(formatSignedCurrency(-200)).toBe('-$200');
  });

  it('debería no poner signo cuando el monto es cero', () => {
    expect(formatSignedCurrency(0)).toBe('$0');
  });
});

describe('formatTime', () => {
  it('debería devolver un guion cuando no hay fecha', () => {
    expect(formatTime(undefined)).toBe('—');
    expect(formatTime(null)).toBe('—');
  });
});
