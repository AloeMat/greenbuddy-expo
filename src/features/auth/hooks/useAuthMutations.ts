/**
 * TanStack Query hooks for authentication mutations
 * Handles login and signup with automatic caching, retry logic, and error handling
 */

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/store';
import { logger } from '@/lib/services/logger';

/**
 * Map raw Supabase/auth error messages to user-friendly French messages.
 * Prevents leaking internal implementation details to the UI.
 */
function mapAuthError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (lower.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (lower.includes('email not confirmed')) return 'Veuillez confirmer votre email avant de vous connecter.';
  if (lower.includes('user already registered')) return 'Un compte existe déjà avec cet email.';
  if (lower.includes('password')) return 'Le mot de passe ne respecte pas les critères requis.';
  if (lower.includes('rate limit') || lower.includes('too many requests')) return 'Trop de tentatives. Veuillez patienter.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Erreur réseau. Vérifiez votre connexion.';
  if (lower.includes('timeout')) return 'Connexion expirée. Veuillez réessayer.';

  return 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Mutation hook for user login
 * Handles email/password authentication
 */
export function useLoginMutation() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      if (!signIn) {
        throw new Error('Service d\'authentification indisponible');
      }
      return await signIn(credentials.email, credentials.password);
    },
    onSuccess: () => {
      logger.info('User logged in successfully');
    },
    onError: (error) => {
      logger.error('Login failed', error);
    },
    /** Maps raw error to a user-friendly French message for UI consumption */
    meta: { getErrorMessage: mapAuthError },
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Mutation hook for user registration (signup)
 * Handles new account creation
 */
export function useSignupMutation() {
  const { signUp } = useAuth();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      if (!signUp) {
        throw new Error('Service d\'authentification indisponible');
      }
      return await signUp(credentials.email, credentials.password);
    },
    onSuccess: () => {
      logger.info('User registered successfully');
    },
    onError: (error) => {
      logger.error('Registration failed', error);
    },
    meta: { getErrorMessage: mapAuthError },
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/** Re-export for UI consumption */
export { mapAuthError };
