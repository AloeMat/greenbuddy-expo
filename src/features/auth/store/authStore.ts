/**
 * Auth Store - Zustand
 * Gestion de l'authentification JWT avec AuthRepository
 * Remplace AuthContext.tsx avec state management réactif
 */

import { create } from 'zustand';
import { createAuthRepository } from '@auth/repositories/AuthRepository';
import type { AuthState } from '@appTypes';
import { logger } from '@lib/services/logger';

const authRepository = createAuthRepository();

export const useAuthStore = create<AuthState>((set, get) => ({
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
   */
  initializeAuth: async () => {
    try {
      logger.debug('🔐 Initializing auth...');
      set({ isLoading: true });

      const { user, session } = await authRepository.getSession();

      if (user && session) {
        logger.debug('✅ Session found', { user: user.email });
        set({
          user,
          session,
          accessToken: session.access_token,
          refreshTokenValue: session.refresh_token,
          isAuthenticated: true,
        });
      } else {
        logger.debug('ℹ️ No active session (guest mode)');
        set({ isAuthenticated: false });
      }
    } catch (error) {
      logger.error('❌ Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Login avec email/password
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      logger.debug('🔐 Logging in', { email });
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
   * Logout
   */
  logout: async () => {
    try {
      logger.debug('🔐 Logging out...');
      await authRepository.signOut();

      set({
        user: null,
        session: null,
        accessToken: null,
        refreshTokenValue: null,
        isAuthenticated: false,
      });

      logger.debug('✅ Logout successful');
    } catch (error) {
      logger.error('❌ Logout error:', error);
      // Clear state even if logout fails
      set({
        user: null,
        session: null,
        accessToken: null,
        refreshTokenValue: null,
        isAuthenticated: false,
      });
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
   * Obtenir le token d'accès
   */
  getAccessToken: () => {
    return get().accessToken;
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
