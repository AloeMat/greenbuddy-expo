/**
 * Auth Store - Zustand
 * Gestion de l'authentification JWT avec AuthRepository
 * Remplace AuthContext.tsx avec state management réactif
 */

import { create } from 'zustand';
import { createAuthRepository } from '@/features/auth/repositories/AuthRepository';
import type { AuthState } from '@/types';
import { logger } from '@/lib/services/logger';

const authRepository = createAuthRepository();

/**
 * Decode JWT payload without external library.
 * Returns null if token is invalid.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Buffer in seconds before actual expiry to trigger refresh */
const TOKEN_EXPIRY_BUFFER_S = 60;

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  refreshTokenValue: null,
  error: null,

  /**
   * Initialiser l'auth depuis AuthRepository
   * À appeler dans app/_layout.tsx au démarrage
   * Includes 3-second forced timeout to prevent infinite loading
   */
  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      // getSession() already has 5-second timeout in AuthRepository
      // No need for double timeout here
      const { user, session } = await authRepository.getSession();

      if (user && session) {
        set({
          user,
          session,
          accessToken: session.access_token,
          refreshTokenValue: session.refresh_token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      logger.error('[authStore] initializeAuth error:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  /**
   * Login avec email/password
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      logger.debug('🔐 Logging in');
      const { user, session } = await authRepository.signIn(email, password);

      logger.debug('✅ Login successful');
      set({
        user,
        session,
        accessToken: session.access_token,
        refreshTokenValue: session.refresh_token,
        isAuthenticated: true,
      });

      return user;
    } catch (error) {
      logger.error('❌ Login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Register avec email/password
   */
  register: async (email: string, password: string, role = 'User') => {
    set({ isLoading: true });
    try {
      logger.debug('🔐 Registering user', { email });
      await authRepository.signUp(email, password);

      logger.debug('✅ Registration successful', { email });
    } catch (error) {
      logger.error('❌ Registration error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Logout — clear auth + all user data stores
   */
  logout: async () => {
    try {
      logger.debug('🔐 Logging out...');
      await authRepository.signOut();
    } catch (error) {
      logger.error('❌ Logout signOut error:', error);
    }

    // Always clear auth state, even if signOut failed
    set({
      user: null,
      session: null,
      accessToken: null,
      refreshTokenValue: null,
      isAuthenticated: false,
    });

    // Clear all other stores to prevent data leaking between sessions
    try {
      // Lazy imports to avoid circular dependencies
      const { usePlantsStore } = await import('@/features/plants/store/plantsStore');
      const { useGamificationStore } = await import('@/features/gamification/store/gamificationStore');
      const { useOnboardingStore } = await import('@/features/onboarding/store/onboardingStore');

      usePlantsStore.getState().clear();
      useGamificationStore.getState().clearGamification();
      useOnboardingStore.getState().resetOnboarding();

      logger.debug('✅ Logout successful — all stores cleared');
    } catch (storeError) {
      logger.error('⚠️ Logout: failed to clear dependent stores:', storeError);
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      logger.debug('🔐 Refreshing token...');
      const { accessToken, refreshToken } = await authRepository.refreshSession();

      logger.debug('✅ Token refreshed');
      set({
        accessToken,
        refreshTokenValue: refreshToken,
      });
    } catch (error) {
      logger.error('❌ Token refresh error:', error);
      // Logout if refresh fails
      await get().logout();
    }
  },

  /**
   * Obtenir le token d'accès (sans vérification d'expiration)
   */
  getAccessToken: () => {
    return get().accessToken;
  },

  /**
   * Obtenir un token d'accès valide (S6 — vérifie l'expiration JWT)
   * Auto-refresh si le token expire dans les 60 secondes
   */
  getValidAccessToken: async () => {
    const token = get().accessToken;
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') {
      // Token malformé — tenter un refresh
      logger.warn('[authStore] Token malformé, tentative de refresh');
      try {
        await get().refreshToken();
        return get().accessToken;
      } catch {
        return null;
      }
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp - nowSec < TOKEN_EXPIRY_BUFFER_S) {
      // Token expiré ou sur le point d'expirer — refresh
      logger.debug('[authStore] Token expiring soon, refreshing...');
      try {
        await get().refreshToken();
        return get().accessToken;
      } catch {
        logger.error('[authStore] Token refresh failed');
        return null;
      }
    }

    return token;
  },

  /**
   * Aliases pour compatibilité (signIn = login, signUp = register, signOut = logout)
   */
  signIn: (email: string, password: string) => get().login(email, password),
  signUp: (email: string, password: string, role?: string) => get().register(email, password, role),
  signOut: () => get().logout(),

  /**
   * Réinitialiser l'état d'authentification
   */
  clearAuth: () => {
    set({
      user: null,
      session: null,
      accessToken: null,
      refreshTokenValue: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

// Export pour compatibilité avec ancien useAuth hook
export const useAuth = () => useAuthStore();
