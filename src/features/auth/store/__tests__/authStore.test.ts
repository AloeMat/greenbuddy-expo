/**
 * authStore Unit Tests
 * Tests Zustand auth state management: login, logout, token refresh, JWT validation
 *
 * Uses getState() directly — no React rendering needed
 */

// Mock AuthRepository
const mockGetSession = jest.fn();
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockRefreshSession = jest.fn();

jest.mock('@/features/auth/repositories/AuthRepository', () => ({
  createAuthRepository: () => ({
    getSession: mockGetSession,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    refreshSession: mockRefreshSession,
  }),
}));

// Mock logger
jest.mock('@/lib/services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock dependent stores for logout()
jest.mock('@/features/plants/store/plantsStore', () => ({
  usePlantsStore: {
    getState: () => ({ clear: jest.fn() }),
  },
}));

jest.mock('@/features/gamification/store/gamificationStore', () => ({
  useGamificationStore: {
    getState: () => ({ clearGamification: jest.fn() }),
  },
}));

jest.mock('@/features/onboarding/store/onboardingStore', () => ({
  useOnboardingStore: {
    getState: () => ({ resetOnboarding: jest.fn() }),
  },
}));

import { useAuthStore } from '@/features/auth/store/authStore';

/** Helper: get current store state */
const getStore = () => useAuthStore.getState();

/** Helper: create a fake JWT token with given exp */
function createFakeJwt(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 'user-123', exp }));
  return `${header}.${payload}.fakesig`;
}

const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockSession = {
  access_token: 'access-token-abc',
  refresh_token: 'refresh-token-xyz',
};

describe('authStore (Zustand)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      accessToken: null,
      refreshTokenValue: null,
      error: null,
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────
  // Initial state
  // ─────────────────────────────────────────
  describe('Initial state', () => {
    it('should not be authenticated', () => {
      expect(getStore().isAuthenticated).toBe(false);
    });

    it('should have no user', () => {
      expect(getStore().user).toBeNull();
    });

    it('should have no tokens', () => {
      expect(getStore().accessToken).toBeNull();
      expect(getStore().refreshTokenValue).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // initializeAuth
  // ─────────────────────────────────────────
  describe('initializeAuth', () => {
    it('should set authenticated state when session exists', async () => {
      mockGetSession.mockResolvedValueOnce({ user: mockUser, session: mockSession });

      await getStore().initializeAuth();

      expect(getStore().isAuthenticated).toBe(true);
      expect(getStore().user).toEqual(mockUser);
      expect(getStore().accessToken).toBe('access-token-abc');
      expect(getStore().isLoading).toBe(false);
    });

    it('should remain unauthenticated when no session', async () => {
      mockGetSession.mockResolvedValueOnce({ user: null, session: null });

      await getStore().initializeAuth();

      expect(getStore().isAuthenticated).toBe(false);
      expect(getStore().user).toBeNull();
      expect(getStore().isLoading).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockGetSession.mockRejectedValueOnce(new Error('Network error'));

      await getStore().initializeAuth();

      expect(getStore().isAuthenticated).toBe(false);
      expect(getStore().isLoading).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // login
  // ─────────────────────────────────────────
  describe('login', () => {
    it('should authenticate user on successful login', async () => {
      mockSignIn.mockResolvedValueOnce({ user: mockUser, session: mockSession });

      const result = await getStore().login('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(getStore().isAuthenticated).toBe(true);
      expect(getStore().accessToken).toBe('access-token-abc');
      expect(getStore().refreshTokenValue).toBe('refresh-token-xyz');
      expect(getStore().isLoading).toBe(false);
    });

    it('should throw and set isLoading=false on failure', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(getStore().login('bad@email.com', 'wrong')).rejects.toThrow(
        'Invalid credentials'
      );
      expect(getStore().isAuthenticated).toBe(false);
      expect(getStore().isLoading).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // register
  // ─────────────────────────────────────────
  describe('register', () => {
    it('should call authRepository.signUp', async () => {
      mockSignUp.mockResolvedValueOnce({});

      await getStore().register('new@example.com', 'password123');

      expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'password123');
      expect(getStore().isLoading).toBe(false);
    });

    it('should throw on registration failure', async () => {
      mockSignUp.mockRejectedValueOnce(new Error('Email already used'));

      await expect(getStore().register('dup@example.com', 'pw')).rejects.toThrow(
        'Email already used'
      );
      expect(getStore().isLoading).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // logout
  // ─────────────────────────────────────────
  describe('logout', () => {
    it('should clear auth state', async () => {
      // Set up authenticated state
      useAuthStore.setState({
        user: mockUser,
        session: mockSession as any,
        isAuthenticated: true,
        accessToken: 'token',
        refreshTokenValue: 'refresh',
      });

      mockSignOut.mockResolvedValueOnce(undefined);

      await getStore().logout();

      expect(getStore().isAuthenticated).toBe(false);
      expect(getStore().user).toBeNull();
      expect(getStore().accessToken).toBeNull();
      expect(getStore().refreshTokenValue).toBeNull();
    });

    it('should clear auth even if signOut fails', async () => {
      useAuthStore.setState({ isAuthenticated: true, accessToken: 'token' });
      mockSignOut.mockRejectedValueOnce(new Error('Network'));

      await getStore().logout();

      expect(getStore().isAuthenticated).toBe(false);
      expect(getStore().accessToken).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // refreshToken
  // ─────────────────────────────────────────
  describe('refreshToken', () => {
    it('should update tokens on successful refresh', async () => {
      mockRefreshSession.mockResolvedValueOnce({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      await getStore().refreshToken();

      expect(getStore().accessToken).toBe('new-access');
      expect(getStore().refreshTokenValue).toBe('new-refresh');
    });

    it('should logout on refresh failure', async () => {
      useAuthStore.setState({ isAuthenticated: true, accessToken: 'old' });
      mockRefreshSession.mockRejectedValueOnce(new Error('expired'));
      mockSignOut.mockResolvedValueOnce(undefined);

      await getStore().refreshToken();

      expect(getStore().isAuthenticated).toBe(false);
      expect(getStore().accessToken).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // getValidAccessToken (S6 JWT expiry check)
  // ─────────────────────────────────────────
  describe('getValidAccessToken', () => {
    it('should return null when no token', async () => {
      const result = await getStore().getValidAccessToken();
      expect(result).toBeNull();
    });

    it('should return token when not expired', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1h in future
      const token = createFakeJwt(futureExp);
      useAuthStore.setState({ accessToken: token });

      const result = await getStore().getValidAccessToken();
      expect(result).toBe(token);
    });

    it('should refresh when token expires within 60s buffer', async () => {
      const nearExp = Math.floor(Date.now() / 1000) + 30; // 30s from now (< 60s buffer)
      const token = createFakeJwt(nearExp);
      useAuthStore.setState({ accessToken: token });

      mockRefreshSession.mockResolvedValueOnce({
        accessToken: 'refreshed-token',
        refreshToken: 'refreshed-refresh',
      });

      const result = await getStore().getValidAccessToken();
      expect(mockRefreshSession).toHaveBeenCalled();
      expect(result).toBe('refreshed-token');
    });

    it('should attempt refresh for malformed token', async () => {
      useAuthStore.setState({ accessToken: 'not-a-jwt' });

      mockRefreshSession.mockResolvedValueOnce({
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh',
      });

      const result = await getStore().getValidAccessToken();
      expect(mockRefreshSession).toHaveBeenCalled();
      expect(result).toBe('valid-token');
    });
  });

  // ─────────────────────────────────────────
  // clearAuth
  // ─────────────────────────────────────────
  describe('clearAuth', () => {
    it('should reset all auth state', () => {
      useAuthStore.setState({
        user: mockUser,
        isAuthenticated: true,
        accessToken: 'token',
        refreshTokenValue: 'refresh',
        isLoading: true,
      });

      getStore().clearAuth();

      expect(getStore().user).toBeNull();
      expect(getStore().isAuthenticated).toBe(false);
      expect(getStore().accessToken).toBeNull();
      expect(getStore().refreshTokenValue).toBeNull();
      expect(getStore().isLoading).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // Aliases
  // ─────────────────────────────────────────
  describe('Aliases', () => {
    it('signIn should delegate to login', async () => {
      mockSignIn.mockResolvedValueOnce({ user: mockUser, session: mockSession });
      await getStore().signIn('test@example.com', 'pw');
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'pw');
    });

    it('signOut should delegate to logout', async () => {
      mockSignOut.mockResolvedValueOnce(undefined);
      await getStore().signOut();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────
  // Composition (all methods exist)
  // ─────────────────────────────────────────
  describe('Composition', () => {
    it('should have all expected methods', () => {
      const store = getStore();
      const expectedMethods = [
        'initializeAuth',
        'login',
        'register',
        'logout',
        'refreshToken',
        'getAccessToken',
        'getValidAccessToken',
        'signIn',
        'signUp',
        'signOut',
        'clearAuth',
      ];
      for (const method of expectedMethods) {
        expect(typeof (store as any)[method]).toBe('function');
      }
    });
  });
});
