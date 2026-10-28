import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CreditsPage from './CreditsPage';
import {
  listCredits,
  getCreditsSummary,
  getRecentHistory,
  settleDebt,
  type CreditsListResult,
  type DebtorItem,
} from '../../api/credits';

vi.mock('../../api/credits', () => ({
  getCreditsSummary: vi.fn(),
  listCredits: vi.fn(),
  getRecentHistory: vi.fn(),
  settleDebt: vi.fn(),
}));

const debtor = (id: string, fullName: string, dni: string): DebtorItem => ({
  client: { id, fullName, dni, balance: 1000 },
  balance: 1000,
  lastCreditAt: new Date().toISOString(),
});

const page = (items: DebtorItem[]): CreditsListResult => ({
  items,
  total: items.length,
  page: 1,
  limit: 50,
  totalPages: 1,
  summary: { totalOutstanding: 0, overdueCount: 0, overdueAmount: 0 },
});

const ANA = debtor('c1', 'Ana Gómez', '30123456');
const LUIS = debtor('c2', 'Luis Pérez', '28999000');

const searchInput = () => screen.getByRole('searchbox', { name: /buscar deudores/i });

describe('CreditsPage — búsqueda de deudores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCreditsSummary).mockResolvedValue({
      totalOutstanding: 0,
      clientsWithDebt: 0,
      totalCreditsThisMonth: 0,
      totalPaymentsThisMonth: 0,
      overdueCount: 0,
      overdueAmount: 0,
    });
    vi.mocked(getRecentHistory).mockResolvedValue([]);
    vi.mocked(listCredits).mockResolvedValue(page([ANA, LUIS]));
  });

  it('carga los deudores sin filtro al montar', async () => {
    render(<CreditsPage />);
    expect(await screen.findByText('Ana Gómez')).toBeInTheDocument();
    expect(listCredits).toHaveBeenCalledWith({ limit: 50, search: undefined });
  });

  it('busca en el API tras el debounce con el término recortado', async () => {
    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    vi.mocked(listCredits).mockClear();
    vi.mocked(listCredits).mockResolvedValue(page([ANA]));

    fireEvent.change(searchInput(), { target: { value: '  Ana ' } });

    await waitFor(() => expect(listCredits).toHaveBeenCalledWith({ limit: 50, search: 'Ana' }));
    expect(listCredits).toHaveBeenCalledTimes(1);
  });

  it('no dispara una búsqueda por cada tecla (debounce)', async () => {
    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    vi.mocked(listCredits).mockClear();

    fireEvent.change(searchInput(), { target: { value: 'G' } });
    fireEvent.change(searchInput(), { target: { value: 'Gó' } });
    fireEvent.change(searchInput(), { target: { value: 'Gómez' } });

    await waitFor(() => expect(listCredits).toHaveBeenCalledWith({ limit: 50, search: 'Gómez' }));
    expect(listCredits).toHaveBeenCalledTimes(1);
  });

  it('envía el término escapado para que el backend busque texto literal', async () => {
    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    vi.mocked(listCredits).mockClear();

    fireEvent.change(searchInput(), { target: { value: 'a(b' } });

    await waitFor(() => expect(listCredits).toHaveBeenCalledWith({ limit: 50, search: 'a\\(b' }));
  });

  it('muestra el mensaje de sin resultados cuando la búsqueda no coincide', async () => {
    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    vi.mocked(listCredits).mockResolvedValue(page([]));

    fireEvent.change(searchInput(), { target: { value: 'zzz' } });

    expect(
      await screen.findByText('No se encontraron deudores para la búsqueda')
    ).toBeInTheDocument();
  });

  it('no queda cargando si el usuario vuelve al mismo término dentro del debounce', async () => {
    const { container } = render(<CreditsPage />);
    await screen.findByText('Ana Gómez');

    fireEvent.change(searchInput(), { target: { value: 'Ana' } });
    fireEvent.change(searchInput(), { target: { value: 'Anax' } });
    fireEvent.change(searchInput(), { target: { value: 'Ana' } });

    await waitFor(() => expect(container.querySelector('.animate-pulse')).toBeNull());
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
  });

  it('limpiar la búsqueda vuelve a cargar la lista completa', async () => {
    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    fireEvent.change(searchInput(), { target: { value: 'Ana' } });
    await waitFor(() => expect(listCredits).toHaveBeenLastCalledWith({ limit: 50, search: 'Ana' }));

    fireEvent.click(screen.getByRole('button', { name: /limpiar búsqueda/i }));

    await waitFor(() =>
      expect(listCredits).toHaveBeenLastCalledWith({ limit: 50, search: undefined })
    );
    expect(searchInput()).toHaveValue('');
  });

  it('no vuelve a pedir la lista al montar (sin duplicar la carga inicial)', async () => {
    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    await new Promise(r => setTimeout(r, 400));
    expect(listCredits).toHaveBeenCalledTimes(1);
  });

  it('si la búsqueda falla, muestra un error en vez de datos que no coinciden con el filtro', async () => {
    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    vi.mocked(listCredits).mockRejectedValueOnce(new Error('500'));

    fireEvent.change(searchInput(), { target: { value: 'Ana' } });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los deudores'
    );
    expect(screen.queryByText('Luis Pérez')).not.toBeInTheDocument();
    expect(screen.queryByText('Ana Gómez')).not.toBeInTheDocument();
  });

  it('al saldar con una búsqueda activa, recarga la lista conservando el filtro', async () => {
    const { container } = render(<CreditsPage />);
    await screen.findByText('Ana Gómez');
    vi.mocked(listCredits).mockResolvedValue(page([ANA]));
    fireEvent.change(searchInput(), { target: { value: 'Ana' } });
    await waitFor(() => expect(listCredits).toHaveBeenLastCalledWith({ limit: 50, search: 'Ana' }));
    expect(await screen.findByRole('button', { name: 'Saldar' })).toBeInTheDocument();
    vi.mocked(listCredits).mockClear();
    vi.mocked(getCreditsSummary).mockClear();
    vi.mocked(settleDebt).mockResolvedValue({} as never);

    fireEvent.click(await screen.findByRole('button', { name: 'Saldar' }));
    fireEvent.change(container.querySelector('input[type="number"]')!, {
      target: { value: '100' },
    });
    fireEvent.submit(document.getElementById('settle-form')!);

    await waitFor(() =>
      expect(settleDebt).toHaveBeenCalledWith('c1', expect.objectContaining({ amount: 100 }))
    );
    await waitFor(() => expect(listCredits).toHaveBeenCalledWith({ limit: 50, search: 'Ana' }));
    expect(getCreditsSummary).toHaveBeenCalledTimes(1);
  });

  it('descarta la respuesta de una búsqueda vieja si llega después de la nueva', async () => {
    let resolveStale!: (value: CreditsListResult) => void;
    const stale = new Promise<CreditsListResult>(resolve => {
      resolveStale = resolve;
    });

    render(<CreditsPage />);
    await screen.findByText('Ana Gómez');

    vi.mocked(listCredits).mockReturnValueOnce(stale);
    fireEvent.change(searchInput(), { target: { value: 'Luis' } });
    await waitFor(() =>
      expect(listCredits).toHaveBeenLastCalledWith({ limit: 50, search: 'Luis' })
    );

    vi.mocked(listCredits).mockResolvedValueOnce(page([LUIS]));
    fireEvent.change(searchInput(), { target: { value: 'Luis P' } });
    expect(await screen.findByText('Luis Pérez')).toBeInTheDocument();

    await act(async () => {
      resolveStale(page([ANA]));
      await stale;
    });

    expect(screen.queryByText('Ana Gómez')).not.toBeInTheDocument();
    expect(screen.getByText('Luis Pérez')).toBeInTheDocument();
  });
});
