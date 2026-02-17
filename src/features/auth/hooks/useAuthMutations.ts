/**
 * TanStack Query hooks for authentication mutations
 * Handles login and signup with automatic caching, retry logic, and error handling
 */

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/store';
import { logger } from '@/lib/services/logger';

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
    onSuccess: (data) => {
      logger.info('User logged in successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      logger.error('Login failed', error);
    },
    retry: 1, // Retry once on failure
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
    onSuccess: (data) => {
      logger.info('User registered successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      logger.error('Registration failed', error);
    },
    retry: 1, // Retry once on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
