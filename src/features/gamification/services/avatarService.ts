/**
 * Avatar Service
 * ════════════════
 *
 * Manages avatar emotional expressions and animations
 * - Emotion states (happy, sad, tired, excited, worried)
 * - Expression evaluation based on plant health
 * - Animation configurations for Reanimated
 * - Color schemes per emotion
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

import { PlantPersonality, AvatarEmotion } from '@/types';
import { getPersonalityProfile } from '@/features/gamification/constants/personalities';

/**
 * Configuration for each emotion
 */
export interface EmotionConfig {
  eyes: {
    scale: number;           // Eye size (0.0-2.0)
    positionY: number;       // Vertical position (-10 to 10)
    blinkRate: number;       // Blink frequency (ms)
  };
  mouth: {
    openness: number;        // 0.0-1.0
    shape: 'smile' | 'frown' | 'neutral' | 'surprised';
  };
  eyebrows: {
    angle: number;           // Rotation in degrees
    position: number;        // Vertical offset
  };
  glow: {
    opacity: number;         // 0.0-1.0
    scale: number;           // 1.0-1.5
    pulseFast: boolean;      // Pulse speed
  };
  body: {
    scale: number;           // Overall scale
    shake: boolean;          // Shake animation
  };
}

/**
 * Emotion configurations
 * Defines visual appearance for each emotion
 */
export const EMOTION_CONFIGS: Record<AvatarEmotion, EmotionConfig> = {
  happy: {
    eyes: {
      scale: 1.3,
      positionY: -2,
      blinkRate: 4000,       // Less frequent blinking when happy
    },
    mouth: {
      openness: 0.8,
      shape: 'smile',
    },
    eyebrows: {
      angle: -15,            // Raised
      position: -3,
    },
    glow: {
      opacity: 1.0,
      scale: 1.3,
      pulseFast: false,
    },
    body: {
      scale: 1.05,           // Slightly larger when happy
      shake: false,
    },
  },

  sad: {
    eyes: {
      scale: 0.9,
      positionY: 3,          // Eyes point down
      blinkRate: 3000,
    },
    mouth: {
      openness: 0.2,
      shape: 'frown',
    },
    eyebrows: {
      angle: 20,             // Lowered/furrowed
      position: 2,
    },
    glow: {
      opacity: 0.4,
      scale: 0.8,
      pulseFast: false,
    },
    body: {
      scale: 0.95,           // Slightly smaller when sad
      shake: false,
    },
  },

  tired: {
    eyes: {
      scale: 0.4,            // Partially closed
      positionY: 0,
      blinkRate: 2000,       // Frequent blinking
    },
    mouth: {
      openness: 0.3,
      shape: 'neutral',
    },
    eyebrows: {
      angle: 0,
      position: 1,
    },
    glow: {
      opacity: 0.3,
      scale: 0.9,
      pulseFast: false,
    },
    body: {
      scale: 0.9,            // Slouched
      shake: false,
    },
  },

  excited: {
    eyes: {
      scale: 1.5,            // Wide eyes
      positionY: -4,
      blinkRate: 5000,       // Rare blinking
    },
    mouth: {
      openness: 1.0,         // Wide open
      shape: 'smile',
    },
    eyebrows: {
      angle: -25,            // Highly raised
      position: -5,
    },
    glow: {
      opacity: 1.2,
      scale: 1.5,
      pulseFast: true,       // Fast pulse
    },
    body: {
      scale: 1.1,            // Larger
      shake: true,           // Slight bounce
    },
  },

  worried: {
    eyes: {
      scale: 1.1,
      positionY: 2,          // Slightly worried look
      blinkRate: 2500,
    },
    mouth: {
      openness: 0.2,
      shape: 'frown',
    },
    eyebrows: {
      angle: 10,             // Furrowed
      position: 1,
    },
    glow: {
      opacity: 0.6,
      scale: 1.0,
      pulseFast: true,       // Fast anxious pulse
    },
    body: {
      scale: 0.98,
      shake: true,           // Nervous shake
    },
  },

  neutral: {
    eyes: {
      scale: 1.0,
      positionY: 0,
      blinkRate: 3000,
    },
    mouth: {
      openness: 0.3,
      shape: 'neutral',
    },
    eyebrows: {
      angle: 0,
      position: 0,
    },
    glow: {
      opacity: 0.7,
      scale: 1.0,
      pulseFast: false,
    },
    body: {
      scale: 1.0,
      shake: false,
    },
  },

  idle: {
    eyes: {
      scale: 1.0,
      positionY: 0,
      blinkRate: 3000,
    },
    mouth: {
      openness: 0.2,
      shape: 'neutral',
    },
    eyebrows: {
      angle: 0,
      position: 0,
    },
    glow: {
      opacity: 0.6,
      scale: 1.0,
      pulseFast: false,
    },
    body: {
      scale: 1.0,
      shake: false,
    },
  },

  sleeping: {
    eyes: {
      scale: 0.1,
      positionY: 0,
      blinkRate: 1000,
    },
    mouth: {
      openness: 0.1,
      shape: 'neutral',
    },
    eyebrows: {
      angle: 0,
      position: 0,
    },
    glow: {
      opacity: 0.2,
      scale: 0.8,
      pulseFast: false,
    },
    body: {
      scale: 0.95,
      shake: false,
    },
  },

  thirsty: {
    eyes: {
      scale: 1.2,
      positionY: 2,
      blinkRate: 2000,
    },
    mouth: {
      openness: 0.4,
      shape: 'frown',
    },
    eyebrows: {
      angle: 10,
      position: 1,
    },
    glow: {
      opacity: 0.8,
      scale: 1.1,
      pulseFast: true,
    },
    body: {
      scale: 0.98,
      shake: true,
    },
  },
};

/**
 * Color schemes for each emotion (for glow effect)
 */
export const EMOTION_COLORS: Record<AvatarEmotion, { primary: string; secondary: string }> = {
  happy: {
    primary: '#FACC15',     // Yellow/Gold
    secondary: '#FCD34D',   // Light gold
  },
  sad: {
    primary: '#3B82F6',     // Blue
    secondary: '#93C5FD',   // Light blue
  },
  tired: {
    primary: '#8B5CF6',     // Purple
    secondary: '#D8B4FE',   // Light purple
  },
  excited: {
    primary: '#EC4899',     // Pink
    secondary: '#F9A8D4',   // Light pink
  },
  worried: {
    primary: '#F97316',     // Orange (warning)
    secondary: '#FDBF8C',   // Light orange
  },
  neutral: {
    primary: '#10B981',     // Green (default)
    secondary: '#6EE7B7',   // Light green
  },
  idle: {
    primary: '#10B981',     // Green (neutral)
    secondary: '#6EE7B7',   // Light green
  },
  sleeping: {
    primary: '#8B5CF6',     // Purple (rest)
    secondary: '#D8B4FE',   // Light purple
  },
  thirsty: {
    primary: '#EF4444',     // Red (urgent)
    secondary: '#FCA5A5',   // Light red
  },
};

/**
 * Service class for avatar operations
 */
export class AvatarService {
  /**
   * Evaluate emotion based on plant health
   * - Healthy (80-100%) → happy
   * - Good (60-79%) → neutral/happy
   * - Okay (40-59%) → tired/neutral
   * - Bad (20-39%) → sad/worried
   * - Critical (<20%) → worried/sad
   */
  static evaluateEmotion(
    plantHealth: number,           // 0-100
    daysSinceWatered: number,
    daysSinceFertilized: number,
    temperature: number = 20,      // Celsius
    humidity: number = 50          // Percentage
  ): AvatarEmotion {
    // Critical state
    if (plantHealth < 20) {
      return daysSinceWatered > 14 ? 'sad' : 'worried';
    }

    // Poor state
    if (plantHealth < 40) {
      return 'worried';
    }

    // Okay state
    if (plantHealth < 60) {
      return daysSinceWatered > 10 ? 'tired' : 'neutral';
    }

    // Good state
    if (plantHealth < 80) {
      return 'neutral';
    }

    // Excellent state - can be excited or happy
    if (plantHealth >= 90) {
      return 'excited';
    }

    return 'happy';
  }

  /**
   * Get emotion config
   */
  static getEmotionConfig(emotion: AvatarEmotion): EmotionConfig {
    return EMOTION_CONFIGS[emotion];
  }

  /**
   * Get emotion color scheme
   */
  static getEmotionColors(emotion: AvatarEmotion): { primary: string; secondary: string } {
    return EMOTION_COLORS[emotion];
  }

  /**
   * Get personality-specific color override
   * Some personalities have distinct colors that override emotion colors
   */
  static getPersonalityColor(personality: PlantPersonality): string {
    const profile = getPersonalityProfile(personality);
    return profile.colors.primary;
  }

  /**
   * Determine if animation should be "talking" (mouth moving)
   */
  static shouldAnimateMouth(isSpeaking: boolean): boolean {
    return isSpeaking;
  }

  /**
   * Get breathing animation speed based on emotion
   */
  static getBreathingSpeed(emotion: AvatarEmotion): number {
    const speeds: Record<AvatarEmotion, number> = {
      happy: 2500,        // Fast, energetic
      excited: 2000,      // Very fast
      sad: 3500,          // Slow, lethargic
      tired: 4000,        // Very slow
      worried: 2800,      // Anxious
      neutral: 3000,      // Normal
      idle: 3000,         // Normal
      sleeping: 4500,     // Very slow
      thirsty: 2300,      // Fast, urgent
    };
    return speeds[emotion];
  }

  /**
   * Get blink interval based on emotion
   */
  static getBlinkInterval(emotion: AvatarEmotion): number {
    const config = EMOTION_CONFIGS[emotion];
    return config.eyes.blinkRate;
  }

  /**
   * Recommend an expression based on context
   * Useful for micro-interactions (water, badge, danger)
   */
  static recommendExpression(context: 'watering' | 'badge' | 'danger' | 'check_in'): AvatarEmotion {
    const recommendations: Record<string, AvatarEmotion> = {
      watering: 'happy',    // Happy when watered
      badge: 'excited',     // Excited for achievements
      danger: 'worried',    // Worried when health drops
      check_in: 'happy',    // Happy for check-in
    };
    return recommendations[context] || 'neutral';
  }

  /**
   * Get animation description for UI purposes
   */
  static getEmotionDescription(emotion: AvatarEmotion): string {
    const descriptions: Record<AvatarEmotion, string> = {
      happy: '😊 Épanouie - Bien soignée',
      sad: '😢 Assoiffée - Besoin d\'eau',
      tired: '😴 Fatiguée - Manque de lumière',
      excited: '🎉 Célébration - Badge débloqué!',
      worried: '😟 Inquiète - À surveiller',
      neutral: '😐 Neutre - Tout va bien',
      idle: '💤 Pausée - En attente',
      sleeping: '😴 Endormie - Repos',
      thirsty: '🌵 Assoiffée - Urgent!',
    };
    return descriptions[emotion];
  }

  /**
   * Check if emotion warrants urgent notification
   */
  static isUrgent(emotion: AvatarEmotion): boolean {
    return emotion === 'worried' || emotion === 'sad';
  }

  /**
   * Get micro-animation suggestion based on emotion change
   * Example: Health drops → Shake animation
   */
  static suggestMicroAnimation(
    previousEmotion: AvatarEmotion,
    currentEmotion: AvatarEmotion
  ): 'none' | 'shake' | 'bounce' | 'pulse' {
    // Health drop
    if (previousEmotion === 'neutral' && currentEmotion === 'worried') {
      return 'shake';
    }

    // Health improvement
    if (previousEmotion === 'sad' && currentEmotion === 'happy') {
      return 'bounce';
    }

    // Excitement
    if (currentEmotion === 'excited') {
      return 'bounce';
    }

    // Concern
    if (currentEmotion === 'worried') {
      return 'pulse';
    }

    return 'none';
  }
}

/**
 * Hook-friendly helper to get emotion and colors
 */
export interface AvatarState {
  emotion: AvatarEmotion;
  config: EmotionConfig;
  colors: { primary: string; secondary: string };
  description: string;
  isUrgent: boolean;
}

export function getAvatarState(
  plantHealth: number,
  daysSinceWatered: number,
  daysSinceFertilized: number,
  personality: PlantPersonality,
  temperature?: number,
  humidity?: number
): AvatarState {
  const emotion = AvatarService.evaluateEmotion(
    plantHealth,
    daysSinceWatered,
    daysSinceFertilized,
    temperature,
    humidity
  );

  const config = AvatarService.getEmotionConfig(emotion);
  const emotionColors = AvatarService.getEmotionColors(emotion);
  const personalityColor = AvatarService.getPersonalityColor(personality);

  return {
    emotion,
    config,
    colors: {
      primary: emotionColors.primary,
      secondary: emotionColors.secondary,
    },
    description: AvatarService.getEmotionDescription(emotion),
    isUrgent: AvatarService.isUrgent(emotion),
  };
}

/**
 * Calculate progress (0-1) towards next tier
 */
export function calculateTierProgress(totalXp: number): number {
  const currentTier = Math.floor(totalXp / 500) + 1;
  const tierMinXp = (currentTier - 1) * 500;
  const tierMaxXp = currentTier * 500;
  const xpInTier = totalXp - tierMinXp;
  const tierRange = tierMaxXp - tierMinXp;

  return Math.max(0, Math.min(1, xpInTier / tierRange));
}

// Re-export types for components
export type { AvatarEmotion } from '@/types';
