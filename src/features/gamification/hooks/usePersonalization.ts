/**
 * usePersonalization Hook
 * ════════════════════════════════════════════════════════════════════
 *
 * React hook to load and use personalization (human design setup)
 * Caches setup and clears cache when user logs out
 *
 * Phase 4.2: Human Design Integration
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@auth/store/authStore';
import { PersonalizationService } from '@gamification/services/personalizationService';
import type { HumanDesignSetup } from '@/types/humanDesign';
import { logger } from '@lib/services/logger';

interface UsePersonalizationResult {
  setup: HumanDesignSetup | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to load and manage user's personalization setup
 *
 * @returns setup, isLoading, error, refetch
 *
 * @example
 * const { setup, isLoading } = usePersonalization();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <Text>{setup?.avatar_personality}</Text>
 * );
 */
export function usePersonalization(): UsePersonalizationResult {
  const { user } = useAuth();
  const [setup, setSetup] = useState<HumanDesignSetup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSetup = async () => {
    if (!user?.id) {
      setSetup(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const loadedSetup = await PersonalizationService.loadSetup(user.id);
      setSetup(loadedSetup);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('[usePersonalization] Error loading setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load setup on mount and when user changes
  useEffect(() => {
    loadSetup();
  }, [user?.id]);

  // Clear cache on logout
  useEffect(() => {
    if (!user) {
      PersonalizationService.clearCache();
    }
  }, [user]);

  return {
    setup,
    isLoading,
    error,
    refetch: loadSetup,
  };
}

/**
 * Hook to get only notification style
 * Simpler variant when you only need the style
 */
export function useNotificationStyle() {
  const { setup, isLoading } = usePersonalization();

  return {
    style: setup?.notification_style || 'motivational',
    isLoading,
  };
}

/**
 * Hook to get only avatar personality
 * Simpler variant when you only need the personality
 */
export function useAvatarPersonality() {
  const { setup, isLoading } = usePersonalization();

  return {
    personality: setup?.avatar_personality || 'gentle',
    isLoading,
  };
}
