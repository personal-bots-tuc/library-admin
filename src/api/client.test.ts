import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

// setup.ts mockea '../api/client' globalmente; acá testeamos la implementación real.
vi.unmock('./client');

// Handlers capturados al registrar los interceptores en la instancia axios.
const captured = vi.hoisted(() => ({
  onRequest: undefined as
    | ((config: { headers: Record<string, string> }) => { headers: Record<string, string> })
    | undefined,
  onResponseError: undefined as ((error: unknown) => Promise<never>) | undefined,
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: (onFulfilled: typeof captured.onRequest) => {
            captured.onRequest = onFulfilled;
            return 0;
          },
        },
        response: {
          use: (_onFulfilled: unknown, onRejected: typeof captured.onResponseError) => {
            captured.onResponseError = onRejected;
            return 0;
          },
        },
      },
    })),
  },
}));

import './client';

const SETUP_LOCATION = { href: '/' };

const stubLocation = (pathname: string) => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { pathname, href: pathname },
  });
};

const unauthorizedError = () => ({ response: { status: 401 } });

describe('api client — interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', { writable: true, value: SETUP_LOCATION });
  });

  describe('request interceptor', () => {
    it('adjunta Authorization Bearer cuando hay token', () => {
      localStorage.setItem('accessToken', 'token-123');

      const config = captured.onRequest!({ headers: {} });

      expect(config.headers.Authorization).toBe('Bearer token-123');
    });

    it('omite Authorization cuando no hay token', () => {
      const config = captured.onRequest!({ headers: {} });

      expect(config.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor — manejo de 401', () => {
    it('limpia storage y redirige a /login si el 401 ocurre fuera de /login', async () => {
      stubLocation('/products');
      localStorage.setItem('accessToken', 'token-123');
      localStorage.setItem('refreshToken', 'refresh-123');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));

      const error = unauthorizedError();
      await expect(captured.onResponseError!(error)).rejects.toBe(error);

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('NO redirige ni limpia storage si el 401 ocurre ya estando en /login (sin bucle de recarga)', async () => {
      stubLocation('/login');
      localStorage.setItem('accessToken', 'token-123');

      const error = unauthorizedError();
      await expect(captured.onResponseError!(error)).rejects.toBe(error);

      expect(window.location.href).toBe('/login');
      expect(localStorage.getItem('accessToken')).toBe('token-123');
    });

    it('no toca storage ni location ante errores que no son 401', async () => {
      stubLocation('/products');
      localStorage.setItem('accessToken', 'token-123');

      const error = { response: { status: 500 } };
      await expect(captured.onResponseError!(error)).rejects.toBe(error);

      expect(window.location.href).toBe('/products');
      expect(localStorage.getItem('accessToken')).toBe('token-123');
    });
  });
});
