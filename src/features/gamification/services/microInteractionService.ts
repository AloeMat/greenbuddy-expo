/**
 * Micro-Interaction Service
 * ════════════════════════════════
 *
 * Manages ephemeral animations triggered by user actions
 * - Water drop animation (watering)
 * - Confetti explosion (badge unlock)
 * - Fire pulse (streak milestone)
 * - Shake animation (danger/warning)
 * - Dance animation (celebration)
 * - Shock wave (surprise)
 *
 * Uses Reanimated 3 for 60 FPS smooth animations
 * Optionally includes haptics & sounds
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

import { MicroActionType } from '@appTypes';
import { logger } from '@lib/services/logger';

/**
 * Configuration for each micro-action
 */
export interface MicroActionConfig {
  animation: 'FallAnimation' | 'ParticleExplosion' | 'HorizontalShake' | 'BodyBounce' | 'GlowPulse' | 'ShockWave';
  sound?: string;                    // Sound file name (optional)
  haptics?: 'light' | 'medium' | 'heavy';
  duration: number;                  // ms
  colors?: string[];                 // For particle-based animations
  intensity?: number;                // 0.5-2.0
  repeatCount?: number;              // For pulsing animations
}

/**
 * Micro-action configurations
 */
export const MICRO_ACTION_CONFIGS: Record<MicroActionType, MicroActionConfig> = {
  water_drop: {
    animation: 'FallAnimation',
    sound: 'water_drop.mp3',
    haptics: 'light',
    duration: 1000,
    colors: ['#3B82F6', '#93C5FD'],  // Blue shades
    intensity: 1.0,
  },

  confetti: {
    animation: 'ParticleExplosion',
    sound: 'fanfare.mp3',
    haptics: 'heavy',
    duration: 2000,
    colors: ['#22C55E', '#FACC15', '#EC4899', '#3B82F6'],
    intensity: 1.5,
  },

  shake: {
    animation: 'HorizontalShake',
    sound: 'alert.mp3',
    haptics: 'light',
    duration: 500,
    intensity: 1.0,
  },

  dance: {
    animation: 'BodyBounce',
    sound: 'victory.mp3',
    haptics: 'medium',
    duration: 3000,
    intensity: 1.2,
  },

  shock: {
    animation: 'ShockWave',
    sound: 'shock.mp3',
    haptics: 'heavy',
    duration: 1500,
    intensity: 1.3,
  },

  fire_pulse: {
    animation: 'GlowPulse',
    sound: 'fire_sound.mp3',
    haptics: 'medium',
    duration: 2000,
    colors: ['#FF6B35', '#FFA500', '#FFD700'],  // Fire colors
    intensity: 1.4,
    repeatCount: 3,
  },

  none: {
    animation: 'FallAnimation',
    duration: 0,
  },
};

/**
 * Micro-Interaction Service
 */
export class MicroInteractionService {
  /**
   * Get configuration for a micro-action
   */
  static getConfig(action: MicroActionType): MicroActionConfig {
    return MICRO_ACTION_CONFIGS[action] || MICRO_ACTION_CONFIGS.none;
  }

  /**
   * Get sound file for action
   */
  static getSound(action: MicroActionType): string | undefined {
    return MICRO_ACTION_CONFIGS[action]?.sound;
  }

  /**
   * Get haptics strength for action
   */
  static getHaptics(action: MicroActionType): 'light' | 'medium' | 'heavy' | undefined {
    return MICRO_ACTION_CONFIGS[action]?.haptics;
  }

  /**
   * Get animation duration
   */
  static getDuration(action: MicroActionType): number {
    return MICRO_ACTION_CONFIGS[action]?.duration || 0;
  }

  /**
   * Get colors for particle animations
   */
  static getColors(action: MicroActionType): string[] {
    return MICRO_ACTION_CONFIGS[action]?.colors || ['#22C55E'];
  }

  /**
   * Get intensity (scale/speed multiplier)
   */
  static getIntensity(action: MicroActionType): number {
    return MICRO_ACTION_CONFIGS[action]?.intensity || 1.0;
  }

  /**
   * Determine micro-action from context
   * Useful for converting user actions → visual feedback
   */
  static actionToMicroInteraction(userAction: string): MicroActionType {
    const mapping: Record<string, MicroActionType> = {
      water: 'water_drop',
      watered: 'water_drop',
      fertilize: 'dance',
      fertilized: 'dance',
      badge_unlock: 'confetti',
      achievement_unlocked: 'confetti',
      check_in: 'fire_pulse',
      daily_check_in: 'fire_pulse',
      streak_milestone: 'fire_pulse',
      '7_day_streak': 'confetti',
      '30_day_streak': 'confetti',
      '90_day_streak': 'confetti',
      health_critical: 'shake',
      plant_dying: 'shock',
      plant_recovered: 'dance',
      photo_taken: 'shock',
      identify_successful: 'confetti',
    };

    return mapping[userAction.toLowerCase()] || 'none';
  }

  /**
   * Suggest action based on emotion or event
   */
  static suggestActionForEmotion(emotion: string, recentAction?: string): MicroActionType {
    // Action-based suggestions (highest priority)
    if (recentAction) {
      const actionBased = this.actionToMicroInteraction(recentAction);
      if (actionBased !== 'none') return actionBased;
    }

    // Emotion-based suggestions
    const emotionMap: Record<string, MicroActionType> = {
      happy: 'dance',
      excited: 'confetti',
      worried: 'shake',
      sad: 'none',
      tired: 'none',
      neutral: 'none',
    };

    return emotionMap[emotion.toLowerCase()] || 'none';
  }

  /**
   * Get animation name for UI component
   */
  static getAnimationName(action: MicroActionType): string {
    const names: Record<MicroActionType, string> = {
      water_drop: 'Falling Water Drop',
      confetti: 'Confetti Burst',
      shake: 'Shake Warning',
      dance: 'Victory Dance',
      shock: 'Shock Wave',
      fire_pulse: 'Fire Pulse Glow',
      none: 'No Animation',
    };
    return names[action];
  }

  /**
   * Check if action should be silent (no sound/haptics)
   */
  static isSilent(action: MicroActionType): boolean {
    return action === 'none';
  }

  /**
   * Check if action is celebratory
   */
  static isCelebratory(action: MicroActionType): boolean {
    const celebratory = ['confetti', 'dance', 'fire_pulse'];
    return celebratory.includes(action);
  }

  /**
   * Check if action is warning/danger
   */
  static isWarning(action: MicroActionType): boolean {
    const warnings = ['shake', 'shock'];
    return warnings.includes(action);
  }

  /**
   * Get animation timing (easing curve)
   */
  static getEasingCurve(action: MicroActionType): string {
    const timings: Record<MicroActionType, string> = {
      water_drop: 'easeIn',        // Accelerates downward
      confetti: 'easeOut',          // Slows down
      shake: 'linear',              // Constant oscillation
      dance: 'easeInOut',           // Bouncy
      shock: 'easeOut',             // Shock dissipates
      fire_pulse: 'easeInOut',      // Pulsing
      none: 'linear',
    };
    return timings[action];
  }

  /**
   * Get recommended Z-index for stacking
   * Useful for rendering order in React Native
   */
  static getZIndex(action: MicroActionType): number {
    const zIndexMap: Record<MicroActionType, number> = {
      water_drop: 10,    // Behind avatar
      confetti: 100,     // Very front
      shake: 5,          // Avatar itself
      dance: 5,          // Avatar itself
      shock: 50,         // In front but not confetti
      fire_pulse: 20,    // Behind confetti
      none: 0,
    };
    return zIndexMap[action];
  }

  /**
   * Determine if multiple actions can run simultaneously
   */
  static canRunInParallel(action1: MicroActionType, action2: MicroActionType): boolean {
    // Can't run two full-screen animations together
    const fullScreen = ['confetti', 'shake', 'dance'];
    const action1IsFS = fullScreen.includes(action1);
    const action2IsFS = fullScreen.includes(action2);

    if (action1IsFS && action2IsFS) return false;

    // Fire pulse + confetti is OK (fire pulse is subtle glow)
    if ((action1 === 'fire_pulse' && action2 === 'confetti') ||
        (action1 === 'confetti' && action2 === 'fire_pulse')) {
      return true;
    }

    // Water drop + any is OK (subtle)
    if (action1 === 'water_drop' || action2 === 'water_drop') {
      return true;
    }

    return !action1IsFS || !action2IsFS;
  }

  /**
   * Queue multiple actions safely
   * Returns array of actions to execute sequentially
   */
  static queueActions(actions: MicroActionType[]): MicroActionType[] {
    if (actions.length <= 1) return actions;

    const queued: MicroActionType[] = [];

    for (let i = 0; i < actions.length; i++) {
      const current = actions[i];
      if (current === 'none') continue;

      const canAddToQueue = queued.length === 0 ||
        this.canRunInParallel(queued[queued.length - 1], current);

      if (canAddToQueue) {
        queued.push(current);
      } else {
        // This action will conflict, skip it
        // (or could implement queuing logic)
        continue;
      }
    }

    return queued.length > 0 ? queued : ['none'];
  }

  /**
   * Get total animation time for sequence of actions
   */
  static getTotalDuration(actions: MicroActionType[]): number {
    if (actions.length === 0) return 0;

    // If actions can run in parallel, return max duration
    // If sequential, return sum
    const maxDuration = Math.max(...actions.map(a => this.getDuration(a)));

    // For simplicity, assume sequential (sum durations)
    // In real implementation, check canRunInParallel
    return actions.reduce((total, action) => total + this.getDuration(action), 0);
  }

  /**
   * Clear all queued animations (if needed)
   */
  static clearQueue(): void {
    // This would be implemented in the component that manages the queue
    logger.debug('[MicroInteractionService] Queue cleared');
  }
}

/**
 * Hook-friendly helper
 * Usage: const config = getMicroActionConfig('confetti')
 */
export function getMicroActionConfig(action: MicroActionType): MicroActionConfig {
  return MicroInteractionService.getConfig(action);
}

/**
 * Convert emotion to visual action
 * Usage: const action = emotionToAction('happy') → 'dance'
 */
export function emotionToAction(emotion: string, recentAction?: string): MicroActionType {
  return MicroInteractionService.suggestActionForEmotion(emotion, recentAction);
}

// Re-export types for components
export type { MicroActionType } from '@appTypes';
