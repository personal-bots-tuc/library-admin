import { describe, it, expect } from 'vitest';
import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  it('escapa los caracteres peligrosos de HTML', () => {
    expect(escapeHtml(`<script>"a" & 'b'</script>`)).toBe(
      '&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;'
    );
  });

  it('no altera texto sin caracteres especiales', () => {
    expect(escapeHtml('Cuaderno A4 40 hojas')).toBe('Cuaderno A4 40 hojas');
  });
});
