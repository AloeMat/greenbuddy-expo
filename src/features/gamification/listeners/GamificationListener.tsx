/**
 * Gamification Listener
 * Demonstrates Mediator Pattern in action
 * Listens to plant events and updates gamification state
 *
 * This component is invisible (returns null) but listens to all plant events
 * and updates XP, achievements, and streaks accordingly
 *
 * Benefits:
 * - Plants feature doesn't know about gamification
 * - Gamification is decoupled from plants
 * - Easy to add new listeners without modifying existing code
 * - Event-driven architecture
 */

import React, { useCallback } from 'react';
import { useEventBus, useEventBusManager } from '@/lib/events';
import { useGamification } from '@/features/gamification/store';
import { logger } from '@/lib/services/logger';

/**
 * Listener component - invisible but reactive
 * Registers in React tree, subscribes to events, updates state
 */
export const GamificationListener: React.FC = () => {
  const { addXp } = useGamification();
  const { getListenerCount } = useEventBusManager();

  /**
   * Handle plant watered event
   * Awards XP and checks for achievements
   */
  const handlePlantWatered = useCallback(
    async ({ plantId, plantName, xpEarned }: { plantId: string; plantName: string; xpEarned: number }) => {
      logger.info('🌱 PLANT_WATERED event received', {
        plant: plantName,
        xp: xpEarned
      });

      // Award XP
      addXp(xpEarned, 'WATER_PLANT');

      // Log achievement
      logger.info('✅ XP awarded for watering', {
        plantName,
        xpEarned,
        totalListeners: getListenerCount('PLANT_WATERED')
      });
    },
    [addXp, getListenerCount]
  );

  /**
   * Handle plant added event
   * Awards XP and checks for "First Plant" achievement
   */
  const handlePlantAdded = useCallback(
    async ({ plantId, plantName }: { plantId: string; plantName: string }) => {
      logger.info('🌿 PLANT_ADDED event received', {
        plant: plantName
      });

      // Award XP for adding plant
      addXp(50, 'ADD_PLANT');

      // Check for "First Plant" achievement
      // In a real app, you'd fetch plant count from repository
      logger.info('🎁 Plant added - first plant achievement possible', {
        plantName
      });
    },
    [addXp]
  );

  /**
   * Handle plant fertilized event
   * Awards XP and health bonus
   */
  const handlePlantFertilized = useCallback(
    async ({ plantId, plantName, xpEarned }: { plantId: string; plantName: string; xpEarned: number }) => {
      logger.info('🌻 PLANT_FERTILIZED event received', {
        plant: plantName,
        xp: xpEarned
      });

      // Award XP for fertilizing
      addXp(xpEarned, 'FERTILIZE_PLANT');

      logger.info('✅ XP awarded for fertilizing', {
        plantName,
        xpEarned
      });
    },
    [addXp]
  );

  /**
   * Handle plant deleted event
   * Penalizes XP (negative incentive to keep plants alive)
   */
  const handlePlantDeleted = useCallback(
    async ({ plantId, plantName }: { plantId: string; plantName: string }) => {
      logger.info('💔 PLANT_DELETED event received', {
        plant: plantName
      });

      // Penalty for deleting plant
      addXp(-10, 'DELETE_PLANT');

      logger.warn('⚠️ XP penalty for deleting plant', {
        plantName
      });
    },
    [addXp]
  );

  /**
   * Handle achievement unlocked event
   * Log for analytics
   */
  const handleAchievementUnlocked = useCallback(
    async ({ achievementId, achievementName, xpRewarded }: {
      achievementId: string;
      achievementName: string;
      xpRewarded: number;
    }) => {
      logger.info('🏆 Achievement unlocked!', {
        achievement: achievementName,
        xp: xpRewarded
      });

      // Award XP from achievement
      // Note: Achievement unlocking handled through event, XP already awarded in achievementService
    },
    [addXp]
  );

  /**
   * Handle level up event
   * Could trigger celebrations, animations, notifications
   */
  const handleLevelUp = useCallback(
    async ({ newLevel, totalXp }: { newLevel: number; totalXp: number }) => {
      logger.info('🎉 Level Up!', {
        newLevel,
        totalXp
      });

      // Could show modal, animation, notification here
      // For now, just log it
    },
    []
  );

  /**
   * Handle XP gained event
   * Generic XP gain (could be from various sources)
   */
  const handleXpGained = useCallback(
    async ({ amount, reason }: { amount: number; reason: string }) => {
      logger.info('💎 XP Gained', {
        amount,
        reason
      });

      // XP already awarded via addXp in specific handlers above
      // This is just for tracking/logging
    },
    []
  );

  // Subscribe to all plant events
  useEventBus('PLANT_WATERED', handlePlantWatered);
  useEventBus('PLANT_ADDED', handlePlantAdded);
  useEventBus('PLANT_FERTILIZED', handlePlantFertilized);
  useEventBus('PLANT_DELETED', handlePlantDeleted);

  // Subscribe to gamification events
  useEventBus('ACHIEVEMENT_UNLOCKED', handleAchievementUnlocked);
  useEventBus('LEVEL_UP', handleLevelUp);
  useEventBus('XP_GAINED', handleXpGained);

  // This component is invisible - it only handles events
  return null;
};

export default GamificationListener;
