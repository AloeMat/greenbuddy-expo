/**
 * TanStack Query (React Query) Setup
 * Gestion centralisée du cache serveur et synchronisation des données
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration du QueryClient
 * Règles par défaut pour tout le caching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes par défaut
      staleTime: 5 * 60 * 1000,
      // Garder les données en cache pendant 10 minutes après unmount
      gcTime: 10 * 60 * 1000,
      // Retry une fois avant erreur
      retry: 1,
      // Timout de 10s par défaut
      networkMode: 'always',
    },
    mutations: {
      // Retry une fois avant erreur
      retry: 1,
      // Timout de 10s par défaut
      networkMode: 'always',
    },
  },
});

/**
 * Hook pour utiliser le QueryClient
 * Usage: const { invalidateQueries, resetQueries } = useQueryClientHook();
 */
export function useQueryClientHook() {
  return {
    invalidateQueries: (queryKey: string[]) =>
      queryClient.invalidateQueries({ queryKey }),
    resetQueries: (queryKey: string[]) =>
      queryClient.resetQueries({ queryKey }),
    prefetchQuery: (queryKey: string[], queryFn: () => Promise<any>) =>
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
      }),
  };
}
