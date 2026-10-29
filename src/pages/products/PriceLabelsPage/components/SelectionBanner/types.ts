export interface SelectionBannerProps {
  /** "offer": la página está completa y hay más resultados; "selected": el alcance ya está marcado. */
  state: 'offer' | 'selected';
  pageCount: number;
  scopeCount: number;
  /** Texto del alcance: ' de «Útiles»', ' de los filtrados' o ' del catálogo'. */
  scopeSuffix: string;
  onSelectScope: () => void;
  onDeselectScope: () => void;
}
