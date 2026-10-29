import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaginationFooter } from './index';

describe('PaginationFooter', () => {
  it('con cero resultados no muestra un rango inventado', () => {
    render(
      <PaginationFooter page={1} pageSize={25} total={0} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(screen.getByText('Mostrando 0 a 0 de 0')).toBeInTheDocument();
  });
});
