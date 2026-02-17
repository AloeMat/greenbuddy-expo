/**
 * useAvatarImage Hook
 * Provides convenient access to shared avatar images
 * Implements Flyweight pattern for memory efficiency
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { avatarFactory, AvatarImage, AvatarFactoryStats } from '@plants/factories/AvatarImageFactory';
import { PlantPersonality } from '@appTypes';
import { logger } from '@lib/services/logger';

/**
 * Get avatar image for a plant personality
 * All plants with same personality get the same image (Flyweight)
 *
 * @param personality - Plant personality type
 * @return Avatar image object with source and metadata
 *
 * Usage: const avatar = useAvatarImage(plant.personality);
 *        Then use avatar.source for Image component
 */
export const useAvatarImage = (personality: PlantPersonality): AvatarImage => {
  return useMemo(() => {
    const avatar = avatarFactory.getAvatar(personality);
    return avatar;
  }, [personality]);
};

/**
 * Get all available avatars
 * Useful for avatar selector/gallery
 *
 * Usage: const allAvatars = useAllAvatars();
 *        Then iterate over array to render avatar options
 */
export const useAllAvatars = (): AvatarImage[] => {
  return useMemo(() => {
    return avatarFactory.getAllAvatars();
  }, []);
};

/**
 * Get avatar by index (for cycling through avatars)
 *
 * Usage: const avatar = useAvatarByIndex(currentIndex);
 *        Index wraps around automatically
 */
export const useAvatarByIndex = (index: number): AvatarImage => {
  return useMemo(() => {
    return avatarFactory.getAvatarByIndex(index);
  }, [index]);
};

/**
 * Preload all avatar images on app start
 * Call this once in app initialization (e.g., in root layout)
 *
 * Usage: Call usePreloadAvatars() in your App root component
 */
export const usePreloadAvatars = (): void => {
  useEffect(() => {
    const preload = async () => {
      try {
        await avatarFactory.preloadAvatarImages();
        logger.info('✅ Avatar images preloaded');
      } catch (error) {
        logger.error('❌ Failed to preload avatar images', error);
      }
    };

    preload();
  }, []);
};

/**
 * Monitor avatar factory statistics
 * Useful for debugging and performance monitoring
 *
 * @param autoRefresh - Refresh interval in ms (0 = no auto-refresh)
 *
 * Usage: const { stats, memorySavings } = useAvatarFactoryStats(1000);
 */
export const useAvatarFactoryStats = (autoRefresh: number = 0): {
  stats: AvatarFactoryStats;
  memorySavings: {
    withoutFlyweight: string;
    withFlyweight: string;
    savings: string;
    savingsPercent: string;
  };
  refresh: () => void;
} => {
  const [stats, setStats] = useState<AvatarFactoryStats>(avatarFactory.getStats());

  const refresh = useCallback(() => {
    setStats(avatarFactory.getStats());
  }, []);

  useEffect(() => {
    refresh();

    if (autoRefresh > 0) {
      const interval = setInterval(refresh, autoRefresh);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refresh]);

  const memorySavings = useMemo(() => {
    return avatarFactory.getMemorySavingsEstimate(100);
  }, []);

  return { stats, memorySavings, refresh };
};

/**
 * Batch load avatars by personality list
 * Useful for preloading specific avatars before use
 *
 * @param personalities - Array of personalities to preload
 *
 * Usage: useBatchLoadAvatars([plant1.personality, plant2.personality]);
 *        Call before rendering avatars to ensure they're loaded
 */
export const useBatchLoadAvatars = (personalities: PlantPersonality[]): void => {
  useEffect(() => {
    // Pre-fetch all avatars in the list
    personalities.forEach(personality => {
      avatarFactory.getAvatar(personality);
    });
  }, [personalities]);
};

/**
 * Get color scheme for a personality
 * Useful for theming UI based on plant personality
 *
 * Usage: const colors = useAvatarColors(plant.personality);
 *        Then use colors.primary, colors.secondary, colors.accent for styling
 */
export const useAvatarColors = (personality: PlantPersonality) => {
  return useMemo(() => {
    const avatar = avatarFactory.getAvatar(personality);
    return avatar.colors;
  }, [personality]);
};
