/**
 * Personalization Service
 * ════════════════════════════════════════════════════════════════════
 *
 * Loads human design setup and applies personalization to:
 * - Notification frequency & style
 * - Avatar personality responses (funny/gentle/expert)
 * - Watering schedules
 * - Gamification messaging
 *
 * Phase 4.2: Human Design Integration
 */

import { supabase } from '@/lib/services/supabase';
import type {
  CaregiverProfile,
  LivingPlace,
  WateringRhythm,
  GuiltSensitivity,
  AvatarPersonalityType,
  HumanDesignSetup,
} from '@/types/humanDesign';
import { logger } from '@/lib/services/logger';
import {
  calculateCheckFrequency,
  calculateNotificationStyle,
} from '@/types/humanDesign';

const log = {
  debug: (msg: string, data?: any) => logger.debug(`[PERSONALIZATION] ${msg}`, data),
  error: (msg: string, error?: any) => logger.error(`[PERSONALIZATION] ${msg}`, error),
};

/**
 * Notification style types
 */
export type NotificationStyle = 'gentle' | 'strict' | 'motivational';

/**
 * Default personalization (fallback)
 */
const DEFAULT_SETUP: HumanDesignSetup = {
  user_id: 'default',
  caregiver_profile: 'passionate',
  living_place: 'apartment',
  watering_rhythm: '2x_week',
  guilt_sensitivity: 'no',
  avatar_personality: 'gentle',
  recommended_check_frequency: 3,
  notification_style: 'casual',  // Changed from 'motivational' for type safety
  completed_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} as HumanDesignSetup;

/**
 * In-memory cache for personalization data
 */
let cachedSetup: HumanDesignSetup | null = null;
let cacheExpiry = 0;
const CACHE_DURATION_MS = 3600000; // 1 hour

/**
 * Personalization Service
 */
export class PersonalizationService {
  /**
   * Load human design setup for user
   * Uses cache if available and not expired
   */
  static async loadSetup(userId: string): Promise<HumanDesignSetup> {
    try {
      // Check cache
      if (
        cachedSetup &&
        cachedSetup.user_id === userId &&
        Date.now() < cacheExpiry
      ) {
        log.debug('Using cached personalization setup', { userId });
        return cachedSetup;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('human_design_setups')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned (expected for new users)
        throw error;
      }

      // No setup found - user hasn't completed human design questionnaire yet
      if (!data) {
        log.debug('No human design setup found for user, using defaults', { userId });
        return DEFAULT_SETUP;
      }

      // Cache the result
      cachedSetup = data;
      cacheExpiry = Date.now() + CACHE_DURATION_MS;

      log.debug('Loaded human design setup from database', {
        userId,
        setup: data,
      });

      return data;
    } catch (error) {
      log.error('Error loading personalization setup', error);
      return DEFAULT_SETUP;
    }
  }

  /**
   * Clear cache when setup changes
   */
  static clearCache(): void {
    cachedSetup = null;
    cacheExpiry = 0;
    log.debug('Personalization cache cleared');
  }

  /**
   * Get notification frequency in days based on watering rhythm
   * Used to calculate how often daily check-in should appear
   */
  static getNotificationFrequency(setup: HumanDesignSetup): number {
    return setup.recommended_check_frequency ?? 3;  // Default to 3 days if undefined
  }

  /**
   * Get notification style type
   */
  static getNotificationStyle(setup: HumanDesignSetup): NotificationStyle {
    return setup.notification_style as NotificationStyle;
  }

  /**
   * Get avatar personality type
   */
  static getAvatarPersonality(setup: HumanDesignSetup): AvatarPersonalityType {
    return setup.avatar_personality;
  }

  /**
   * Get notification message based on style and caregiver profile
   * For gentle style: encouraging, non-demanding language
   * For strict style: reminder-based, matter-of-fact
   * For motivational style: achievement-focused, gamification-heavy
   */
  static getNotificationMessage(
    setup: HumanDesignSetup,
    context: 'daily_checkin' | 'watering_reminder' | 'achievement'
  ): { title: string; body: string } {
    const style = setup.notification_style as NotificationStyle;

    if (context === 'daily_checkin') {
      return this.getDailyCheckInMessage(style);
    } else if (context === 'watering_reminder') {
      return this.getWateringReminderMessage(style);
    } else {
      return this.getAchievementMessage(style);
    }
  }

  /**
   * Daily check-in messages by notification style
   */
  private static getDailyCheckInMessage(
    style: NotificationStyle
  ): { title: string; body: string } {
    const messages = {
      gentle: {
        title: '🌱 Bonjour!',
        body: 'Prenez un moment pour vérifier vos plantes quand vous avez un instant.',
      },
      strict: {
        title: '📋 Check-in Quotidien',
        body: 'N\'oubliez pas votre check-in d\'aujourd\'hui. Vous êtes en série!',
      },
      motivational: {
        title: '🔥 Check-in Quotidien',
        body: 'Venez maintenir votre série et gagner +5 XP!',
      },
    };

    return messages[style];
  }

  /**
   * Watering reminder messages by notification style
   */
  private static getWateringReminderMessage(
    style: NotificationStyle
  ): { title: string; body: string } {
    const messages = {
      gentle: {
        title: '💧 Petite attention',
        body: 'Une de vos plantes aimerait un peu d\'eau quand vous avez le temps.',
      },
      strict: {
        title: '💧 Arrosage Nécessaire',
        body: 'Une ou plusieurs plantes ont besoin d\'eau aujourd\'hui.',
      },
      motivational: {
        title: '💧 Arrosez & Gagnez!',
        body: 'Arrosez vos plantes et gagnez +10 XP!',
      },
    };

    return messages[style];
  }

  /**
   * Achievement messages by notification style
   */
  private static getAchievementMessage(
    style: NotificationStyle
  ): { title: string; body: string } {
    const messages = {
      gentle: {
        title: '⭐ Bien joué!',
        body: 'Vous avez déverrouillé un nouvel accomplissement.',
      },
      strict: {
        title: '🏆 Accomplissement Déverrouillé',
        body: 'Vous avez atteint une nouvelle étape!',
      },
      motivational: {
        title: '🎉 Succès!',
        body: 'Nouvel accomplissement! Vous gagnez des XP!',
      },
    };

    return messages[style];
  }

  /**
   * Get watering schedule adjustment based on caregiver profile
   * Returns a multiplier for base watering frequency
   *
   * Forgetful users: more frequent reminders (1.5x)
   * Stressed users: less frequent, optimized reminders (0.8x)
   * Passionate users: standard frequency (1.0x)
   */
  static getWateringFrequencyMultiplier(
    caregiverProfile: CaregiverProfile
  ): number {
    const multipliers = {
      forgetful: 1.5,
      stressed: 0.8,
      passionate: 1.0,
    };
    return multipliers[caregiverProfile];
  }

  /**
   * Determine if user should receive guilt-inducing messages
   * Helps adapt notification tone based on guilt sensitivity
   */
  static shouldUseGentleMessaging(
    guiltSensitivity: GuiltSensitivity
  ): boolean {
    return guiltSensitivity === 'yes';
  }

  /**
   * Get personality-based reply filters
   * Returns an array of emotion keywords to prioritize in replies
   *
   * Funny: excited, happy, playful
   * Gentle: happy, calm, kind
   * Expert: neutral, informative, wise
   */
  static getPersonalityEmotionFilter(
    personality: AvatarPersonalityType
  ): string[] {
    const filters = {
      funny: ['excited', 'happy', 'playful'],
      gentle: ['happy', 'calm', 'kind'],
      expert: ['neutral', 'informative', 'wise'],
    };
    return filters[personality];
  }

  /**
   * Get dashboard tips based on caregiver profile
   * Provides personalized guidance on the home screen
   */
  static getDashboardTip(caregiverProfile: CaregiverProfile): string {
    const tips = {
      forgetful:
        'Conseil: Gardez votre téléphone près de vous pour ne pas oublier vos check-ins!',
      stressed:
        'Conseil: Respirez! Vos plantes ne demandent qu\'un peu d\'attention régulière.',
      passionate:
        'Conseil: Explorez les quêtes saisonnières pour relever de nouveaux défis!',
    };
    return tips[caregiverProfile];
  }

  /**
   * Update cached setup after user changes preferences
   */
  static updateCache(setup: HumanDesignSetup): void {
    cachedSetup = setup;
    cacheExpiry = Date.now() + CACHE_DURATION_MS;
    log.debug('Personalization cache updated');
  }
}

/**
 * Hook-friendly wrapper to load personalization
 * Usage: const setup = await loadPersonalizationSetup(userId)
 */
export async function loadPersonalizationSetup(
  userId: string
): Promise<HumanDesignSetup> {
  return PersonalizationService.loadSetup(userId);
}

/**
 * Get notification message for a context
 * Usage: const msg = getPersonalizedNotification(setup, 'daily_checkin')
 */
export function getPersonalizedNotification(
  setup: HumanDesignSetup,
  context: 'daily_checkin' | 'watering_reminder' | 'achievement'
): { title: string; body: string } {
  return PersonalizationService.getNotificationMessage(setup, context);
}
