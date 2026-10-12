import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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

describe('useSchool', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockGetSettings.mockResolvedValue(BASE_SETTINGS);
  });

  it('provides school context with custom fallback name', async () => {
    const { getByTestId } = render(
      <SchoolProvider fallbackName="Fallback">
        <TestComponent />
      </SchoolProvider>
    );
    expect(getByTestId('school-name')).toHaveTextContent('Fallback');
    await waitFor(() => {
      expect(getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('prioritizes school.name over settings.labelBusinessName', async () => {
    localStorage.setItem('user', JSON.stringify({ schoolId: 'school-1' }));
    mockGetSettings.mockResolvedValue({ ...BASE_SETTINGS, labelBusinessName: 'Etiquetas SA' });

    const { findByTestId } = render(
      <SchoolProvider fallbackName="Test">
        <TestComponent />
      </SchoolProvider>
    );

    await waitFor(async () => {
      expect(await findByTestId('school-name')).toHaveTextContent('Escuela Test');
    });
  });

  it('uses settings.labelBusinessName when school has no name', async () => {
    localStorage.clear(); // sin school → school.name es undefined
    mockGetSettings.mockResolvedValue({ ...BASE_SETTINGS, labelBusinessName: 'Sucursal Centro' });

    const { findByTestId } = render(
      <SchoolProvider fallbackName="Test">
        <TestComponent />
      </SchoolProvider>
    );

    expect(await findByTestId('school-name')).toHaveTextContent('Sucursal Centro');
  });

  it('falls back to fallbackName when neither school name nor labelBusinessName exist', async () => {
    localStorage.clear();
    mockGetSettings.mockRejectedValue(new Error('offline'));

    const { findByTestId } = render(
      <SchoolProvider fallbackName="Mi Negocio">
        <TestComponent />
      </SchoolProvider>
    );

    expect(await findByTestId('school-name')).toHaveTextContent('Mi Negocio');
  });
});
