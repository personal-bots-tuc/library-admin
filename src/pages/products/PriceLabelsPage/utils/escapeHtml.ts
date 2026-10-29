const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapa texto para insertarlo en HTML (ventana de impresión de etiquetas). */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, ch => HTML_ENTITIES[ch]);
}
