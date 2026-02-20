/**
 * useAuthHook - Migration wrapper
 * Fournit une interface cohérente entre l'ancien Context et le nouveau Zustand store
 * Permet une migration progressive sans casser les composants existants
 */

import { useAuthStore } from '@/features/auth/store/authStore';
import type { AuthState } from '@/types';

/**
 * Hook unifiée pour l'authentification
 * Remplace l'ancien useAuth() du Context
 */
export function useAuthHook(): Omit<AuthState, 'initializeAuth' | 'clearAuth'> {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signUp,
    signOut,
    login,
    register,
    logout,
    refreshToken,
    getAccessToken,
    getValidAccessToken,
  } = useAuthStore();

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    accessToken: getAccessToken(),
    refreshTokenValue: null, // Pas exposé (privé)
    error,
    signIn,
    signUp,
    signOut,
    login,
    register,
    logout,
    refreshToken,
    getAccessToken,
    getValidAccessToken,
  };
}

// Export pour compatibilité directe avec ancien useAuth
export { useAuthStore as useAuth };
