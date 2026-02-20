/**
 * Haptic Feedback Service — Localized to Gamification Feature
 * Moved from: lib/services/hapticFeedback.ts
 * 
 * Provides tactile feedback for game achievements and level-ups
 * Uses expo-haptics for mobile/PWA compatibility
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { logger } from '@/lib/services/logger';

/**
 * Haptic intensity patterns for different game events
 */
export const hapticPatterns = {
  /**
   * Light tap — button press, card selection
   */
  light: async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      logger.warn('Light haptic failed', error);
    }
  },

  /**
   * Medium vibration — successful action, item unlocked
   */
  medium: async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      logger.warn('Medium haptic failed', error);
    }
  },

  /**
   * Strong vibration — critical event, milestone reached
   */
  strong: async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      logger.warn('Strong haptic failed', error);
    }
  },

  /**
   * Success pattern — achievement unlocked, level up
   */
  success: async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      logger.warn('Success haptic failed', error);
    }
  },

  /**
   * Error pattern — action failed, streak broken
   */
  error: async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      logger.warn('Error haptic failed', error);
    }
  },

  /**
   * Level up celebration — 3-pulse pattern
   */
  levelUp: async () => {
    try {
      if (Platform.OS !== 'web') {
        // Pulse pattern: strong-pause-medium-pause-light
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise(resolve => setTimeout(resolve, 100));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await new Promise(resolve => setTimeout(resolve, 100));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      logger.warn('Level up haptic failed', error);
    }
  },

  /**
   * Streak milestone — double pulse
   */
  milestone: async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise(resolve => setTimeout(resolve, 150));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      logger.warn('Milestone haptic failed', error);
    }
  },

  /**
   * Achievement unlock — triple pulse crescendo
   */
  achievement: async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await new Promise(resolve => setTimeout(resolve, 80));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await new Promise(resolve => setTimeout(resolve, 80));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      logger.warn('Achievement haptic failed', error);
    }
  },
} as const;

/**
 * Exported as object for easy function reference
 * Usage: hapticFeedback.light(), hapticFeedback.levelUp(), etc.
 */
export const hapticFeedback = hapticPatterns;

export default hapticFeedback;
