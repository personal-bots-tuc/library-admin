import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider } from './useAuth';
import { useSchool, SchoolProvider } from './useSchool';
import { getSettings, type Settings } from '../api/settings';

// Mock the schools API
vi.mock('../api/schools', () => ({
  getSchool: vi
    .fn()
    .mockResolvedValue({ id: 'school-1', name: 'Escuela Test', slug: 'escuela-test' }),
  listSchools: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 }),
  createSchool: vi.fn(),
  updateSchool: vi.fn(),
  deleteSchool: vi.fn(),
}));

// Mock the settings API (used by fallback chain)
vi.mock('../api/settings', () => ({
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
}));

// Mock the auth API (AuthProvider dependency)
vi.mock('../api/auth', () => ({
  loginWithEmail: vi.fn(),
  loginWithPin: vi.fn(),
  refreshToken: vi.fn(),
  getMe: vi.fn(),
}));

const mockGetSettings = vi.mocked(getSettings);

const BASE_SETTINGS: Settings = {
  libraryName: 'Biblioteca',
  currency: 'ARS',
  language: 'es',
  dateFormat: 'DD/MM/YYYY',
  defaultClient: 'CF',
  maxDiscountPerSeller: 10,
  allowSaleWithoutStock: false,
  scanSound: false,
};

const TestComponent = () => {
  const school = useSchool();
  return (
    <div>
      <span data-testid="school-name">{school.schoolName || 'no-school'}</span>
      <span data-testid="loading">{school.loading ? 'loading' : 'not-loading'}</span>
    </div>
  );
};

const renderSchool = (fallbackName: string) =>
  render(
    <AuthProvider>
      <SchoolProvider fallbackName={fallbackName}>
        <TestComponent />
      </SchoolProvider>
    </AuthProvider>
  );

const authenticate = (user: Record<string, unknown>) => {
  localStorage.setItem('accessToken', 'test-token');
  localStorage.setItem('user', JSON.stringify(user));
};

describe('useSchool', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockGetSettings.mockResolvedValue(BASE_SETTINGS);
  });

  it('provides school context with custom fallback name', async () => {
    const { getByTestId } = renderSchool('Fallback');
    expect(getByTestId('school-name')).toHaveTextContent('Fallback');
    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('does NOT fetch settings when there is no session (login page safe)', async () => {
    const { getByTestId } = renderSchool('Fallback');

    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('not-loading');
    });
    expect(mockGetSettings).not.toHaveBeenCalled();
    expect(getByTestId('school-name')).toHaveTextContent('Fallback');
  });

  it('prioritizes school.name over settings.labelBusinessName', async () => {
    authenticate({ schoolId: 'school-1', role: 'admin' });
    mockGetSettings.mockResolvedValue({ ...BASE_SETTINGS, labelBusinessName: 'Etiquetas SA' });

    const { findByTestId } = renderSchool('Test');

    await waitFor(async () => {
      expect(await findByTestId('school-name')).toHaveTextContent('Escuela Test');
    });
    expect(mockGetSettings).toHaveBeenCalled();
  });

  it('uses settings.labelBusinessName when the user has no school', async () => {
    authenticate({ email: 'admin@test.com', role: 'admin' }); // sin schoolId
    mockGetSettings.mockResolvedValue({ ...BASE_SETTINGS, labelBusinessName: 'Sucursal Centro' });

    const { findByTestId } = renderSchool('Test');

    expect(await findByTestId('school-name')).toHaveTextContent('Sucursal Centro');
    expect(mockGetSettings).toHaveBeenCalled();
  });

  it('falls back to fallbackName when getSettings fails (authenticated)', async () => {
    authenticate({ email: 'admin@test.com', role: 'admin' }); // sin schoolId
    mockGetSettings.mockRejectedValue(new Error('offline'));

    const { findByTestId } = renderSchool('Mi Negocio');

    expect(await findByTestId('school-name')).toHaveTextContent('Mi Negocio');
    expect(mockGetSettings).toHaveBeenCalled();
  });
});
