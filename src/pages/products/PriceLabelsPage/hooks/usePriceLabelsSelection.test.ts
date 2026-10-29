import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePriceLabelsSelection } from './usePriceLabelsSelection';

const p = (id: string) => ({ id });

describe('usePriceLabelsSelection — operaciones en lote', () => {
  it('selectMany agrega sin desmarcar los ya seleccionados y conserva su cantidad', () => {
    const { result } = renderHook(() => usePriceLabelsSelection());
    act(() => result.current.setQty('a', 3));
    act(() => result.current.selectMany([p('a'), p('b'), p('c')]));
    expect(result.current.getQty('a')).toBe(3);
    expect(result.current.isSelected('b')).toBe(true);
    expect(result.current.isSelected('c')).toBe(true);
    expect(result.current.totalLabels).toBe(5);
  });

  it('deselectMany quita solo los ids indicados', () => {
    const { result } = renderHook(() => usePriceLabelsSelection());
    act(() => result.current.selectMany([p('a'), p('b'), p('c')]));
    act(() => result.current.deselectMany(['a', 'c']));
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.isSelected('b')).toBe(true);
    expect(result.current.isSelected('c')).toBe(false);
  });

  it('setQty limita la cantidad a 999 por producto', () => {
    const { result } = renderHook(() => usePriceLabelsSelection());
    act(() => result.current.setQty('a', 5000));
    expect(result.current.getQty('a')).toBe(999);
  });

  it('pruneTo elimina los ids que ya no están en el catálogo', () => {
    const { result } = renderHook(() => usePriceLabelsSelection());
    act(() => result.current.selectMany([p('a'), p('b')]));
    act(() => result.current.pruneTo(['b']));
    expect(result.current.isSelected('a')).toBe(false);
    expect(result.current.isSelected('b')).toBe(true);
  });

  it('pruneTo sin cambios no reemplaza el estado', () => {
    const { result } = renderHook(() => usePriceLabelsSelection());
    act(() => result.current.selectMany([p('a')]));
    const before = result.current.selected;
    act(() => result.current.pruneTo(['a']));
    expect(result.current.selected).toBe(before);
  });
});
