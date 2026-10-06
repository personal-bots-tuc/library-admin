import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithAdminProviders } from '../test/utils';
import { useAuth, AuthProvider } from './useAuth';

// Mock the auth API
vi.mock('../api/auth', () => ({
  loginWithEmail: vi.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      role: 'admin',
      schoolId: 'school-1',
    },
  }),
  refreshToken: vi.fn().mockResolvedValue({ accessToken: 'new-access-token' }),
  getMe: vi
    .fn()
    .mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      role: 'admin',
      schoolId: 'school-1',
    }),
  loginWithPin: vi.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      role: 'admin',
      schoolId: 'school-1',
    },
  }),
}));

const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="user">{auth.user?.name || 'no-user'}</span>
      <span data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</span>
      <span data-testid="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</span>
      <button onClick={() => auth.login('test@test.com', 'password')} data-testid="login">
        Login
      </button>
      <button onClick={auth.logout} data-testid="logout">
        Logout
      </button>
    </div>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides auth context with no user initially', () => {
    const { getByTestId } = renderWithAdminProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(getByTestId('user')).toHaveTextContent('no-user');
    expect(getByTestId('loading')).toHaveTextContent('not-loading');
    expect(getByTestId('authenticated')).toHaveTextContent('no');
  });

  it('has login and logout functions', () => {
    const { getByTestId } = renderWithAdminProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(getByTestId('login')).toBeInTheDocument();
    expect(getByTestId('logout')).toBeInTheDocument();
  });

  it('sets user after login', async () => {
    const { getByTestId, findByTestId } = renderWithAdminProviders(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    getByTestId('login').click();
    await findByTestId('user');
    expect(getByTestId('user')).toHaveTextContent('Test User');
    expect(getByTestId('authenticated')).toHaveTextContent('yes');
  });
});
