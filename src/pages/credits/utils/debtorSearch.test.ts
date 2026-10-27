import { describe, it, expect } from 'vitest';
import { toDebtorSearchTerm } from './debtorSearch';

describe('toDebtorSearchTerm', () => {
  it('devuelve undefined si no hay término (no se manda el query param)', () => {
    expect(toDebtorSearchTerm('')).toBeUndefined();
    expect(toDebtorSearchTerm('   ')).toBeUndefined();
  });

  it('recorta espacios alrededor del término', () => {
    expect(toDebtorSearchTerm('  Ana  ')).toBe('Ana');
  });

  it('deja nombres y DNI parciales sin cambios', () => {
    expect(toDebtorSearchTerm('González')).toBe('González');
    expect(toDebtorSearchTerm('30123')).toBe('30123');
  });

  it('escapa caracteres especiales de regex para que el backend busque texto literal', () => {
    expect(toDebtorSearchTerm('(')).toBe('\\(');
    expect(toDebtorSearchTerm('a+b')).toBe('a\\+b');
    expect(toDebtorSearchTerm('[x]')).toBe('\\[x\\]');
    expect(toDebtorSearchTerm('a.b*c?')).toBe('a\\.b\\*c\\?');
    expect(toDebtorSearchTerm('^$|{}')).toBe('\\^\\$\\|\\{\\}');
    expect(toDebtorSearchTerm('a\\b')).toBe('a\\\\b');
  });

  it('una expresión regex válida queda como texto literal', () => {
    const escaped = toDebtorSearchTerm('.*')!;
    expect(new RegExp(escaped, 'i').test('.*')).toBe(true);
    expect(new RegExp(escaped, 'i').test('Juan')).toBe(false);
  });
});
