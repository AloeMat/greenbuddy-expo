/**
 * Haptics Feedback Service
 * Centralized haptic feedback for plant actions, achievements, etc.
 * Provides consistent haptic patterns across the app
 */

import * as Haptics from 'expo-haptics';
import { logger } from '@/lib/services/logger';

/**
 * Haptic feedback patterns
 */
export const HapticPatterns = {
  /**
   * Light haptic - Tab navigation, subtle interactions
   */
  light: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Medium haptic - FAB press, important actions
   */
  medium: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Heavy haptic - Achievement unlock, major milestones
   */
  heavy: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Success pattern - Water/Fertilize plant (Light then Medium)
   */
  success: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Error pattern - Failed action (Heavy then Light)
   */
  error: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Delete pattern - Dangerous action (Triple light taps)
   */
  delete: async () => {
    for (let i = 0; i < 3; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (i < 2) await new Promise((resolve) => setTimeout(resolve, 80));
    }
  },

  /**
   * Achievement unlock pattern - Celebration (Heavy pulse)
   */
  achievement: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((resolve) => setTimeout(resolve, 150));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Level up pattern - Major milestone
   */
  levelUp: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Selection pattern - Item selected/deselected
   */
  selection: async () => {
    await Haptics.selectionAsync();
  },

  /**
   * Notification pattern - Alert/message
   */
  notification: async (type: 'Success' | 'Warning' | 'Error' = 'Success') => {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType[type]
    );
  },
};

/**
 * Plant action haptics
 */
export const PlantActionHaptics = {
  /**
   * Water plant - Success pattern
   */
  water: async () => {
    await HapticPatterns.success();
  },

  /**
   * Fertilize plant - Success pattern
   */
  fertilize: async () => {
    await HapticPatterns.success();
  },

  /**
   * Delete plant - Delete pattern (warning)
   */
  delete: async () => {
    await HapticPatterns.delete();
  },

  /**
   * Add plant - Medium haptic
   */
  add: async () => {
    await HapticPatterns.medium();
  },
};

/**
 * Achievement & Gamification haptics
 */
export const GamificationHaptics = {
  /**
   * Achievement unlocked - Celebration pattern
   */
  achievementUnlocked: async () => {
    await HapticPatterns.achievement();
  },

  /**
   * Level up - Major milestone
   */
  levelUp: async () => {
    await HapticPatterns.levelUp();
  },

  /**
   * XP gained - Notification pattern
   */
  xpGained: async () => {
    await HapticPatterns.notification('Success');
  },

  /**
   * Streak milestone - Achievement pattern
   */
  streakMilestone: async () => {
    await HapticPatterns.achievement();
  },
};

/**
 * UI interaction haptics
 */
export const UIHaptics = {
  /**
   * Tab navigation - Light haptic
   */
  tabPress: async () => {
    await HapticPatterns.light();
  },

  /**
   * FAB press - Medium haptic
   */
  fabPress: async () => {
    await HapticPatterns.medium();
  },

  /**
   * Button press - Light haptic
   */
  buttonPress: async () => {
    await HapticPatterns.light();
  },

  /**
   * Modal open/close - Light haptic
   */
  modalToggle: async () => {
    await HapticPatterns.light();
  },

  /**
   * Confirmation - Medium haptic
   */
  confirm: async () => {
    await HapticPatterns.medium();
  },

  /**
   * Cancellation - Light haptic
   */
  cancel: async () => {
    await HapticPatterns.light();
  },
};

/**
 * Wrap haptic feedback with try-catch for safety
 * @param pattern - Async haptic pattern function
 * @param fallbackError - Log error silently if haptics fail
 */
export const triggerHaptic = async (
  pattern: () => Promise<void>,
  fallbackError = true
) => {
  try {
    await pattern();
  } catch (error) {
    if (fallbackError) {
      // Silently fail - haptics may not be available on all devices
      logger.debug('[Haptics] Not available or failed', { error: String(error) });
    }
  }
};
