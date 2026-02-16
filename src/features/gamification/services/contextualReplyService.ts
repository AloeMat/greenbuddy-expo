/**
 * Contextual Reply Service
 * ════════════════════════════════
 *
 * Generates intelligent, context-aware replies from plants using Gemini AI
 * - Evaluates plant health, weather, user behavior, attachment phase
 * - Uses personality-specific Gemini prompts
 * - Returns rich reply with emotion & optional micro-action
 * - Caches responses to minimize API calls
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

import { PlantPersonality, AvatarEmotion, MicroActionType } from '@appTypes';
import { AvatarService } from './avatarService';
import { PersonalizationService } from './personalizationService';
import {
  getPersonalityProfile,
  getGeminiPrompt,
  ALL_PERSONALITIES,
} from '@gamification/constants/personalities';
import type { AvatarPersonalityType } from '@/types/humanDesign';
import { logger } from '@lib/services/logger';
// Logger (conditional in production)
const log = {
  debug: (msg: string, data?: any) => logger.debug(`[DEBUG] ${msg}`, data),
  info: (msg: string, data?: any) => logger.debug(`[INFO] ${msg}`, data),
  error: (msg: string, error?: any) => logger.error(`[ERROR] ${msg}`, error),
};

/**
 * Plant context for reply generation
 */
export interface PlantContext {
  plantId: string;
  plantName: string;
  personality: PlantPersonality;
  plantHealth: number;          // 0-100%
  daysSinceWatered: number;
  daysSinceFertilized: number;
  temperature?: number;         // Celsius
  humidity?: number;            // Percentage
  dayWithUser: number;          // Days of attachment
  lastReplyAt?: Date;           // Last time avatar spoke
}

/**
 * User context
 */
export interface UserContext {
  userId?: string;
  userName?: string;
  totalPlantsOwned: number;
  userStreak: number;          // Days
  userLevel: number;
  recentInteractions: string[]; // Recent actions: 'water', 'fertilize', 'check-in', etc.
}

/**
 * Weather context
 */
export interface WeatherContext {
  temperature: number;
  humidity: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  hasRainedToday: boolean;
}

/**
 * Complete context for reply generation
 */
export interface ReplyContext {
  plant: PlantContext;
  user: UserContext;
  weather?: WeatherContext;
  recentAction?: string;       // 'water', 'fertilize', 'badge_unlock', etc.
}

/**
 * Generated reply from Gemini
 */
export interface ContextualReply {
  text: string;
  emotion: AvatarEmotion;
  action?: MicroActionType;
  confidence: number;          // 0-1
  isFromCache: boolean;
  generatedAt: Date;
}

/**
 * Attachment phases for progression
 */
export type AttachmentPhase = 'discovery' | 'familiarity' | 'attachment' | 'companion';

/**
 * Helper: Determine attachment phase based on days
 */
function getAttachmentPhase(dayWithUser: number): AttachmentPhase {
  if (dayWithUser <= 7) return 'discovery';
  if (dayWithUser <= 30) return 'familiarity';
  if (dayWithUser <= 90) return 'attachment';
  return 'companion';
}

/**
 * Simple in-memory cache for replies
 * Key: `${plantId}-${emotion}`
 */
const replyCache = new Map<string, ContextualReply>();
const CACHE_DURATION_MS = 3600000; // 1 hour

/**
 * Contextual Reply Service
 */
export class ContextualReplyService {
  /**
   * Build system prompt for Gemini based on personality and context
   * @param avatarPersonality - User's avatar personality preference (funny/gentle/expert)
   */
  static buildSystemPrompt(
    personality: PlantPersonality,
    attachmentPhase: AttachmentPhase,
    context: ReplyContext,
    avatarPersonality?: AvatarPersonalityType
  ): string {
    const profile = getPersonalityProfile(personality);
    let basePrompt = getGeminiPrompt(personality, attachmentPhase);

    // Apply avatar personality tone if provided
    if (avatarPersonality) {
      basePrompt = this.applyAvatarPersonalityTone(
        basePrompt,
        avatarPersonality
      );
    }

    // Add context enrichment based on plant state
    const contextEnrichment = this.buildContextEnrichment(context);

    return `${basePrompt}

## ADDITIONAL CONTEXT
${contextEnrichment}

## RESPONSE FORMAT
Respond naturally in French, 1-3 sentences. Do NOT include action descriptions. Just the reply text.
Example: "L'eau serait bienvenue, merci d'y penser."
`;
  }

  /**
   * Apply user's avatar personality tone to the prompt
   */
  private static applyAvatarPersonalityTone(
    prompt: string,
    avatarPersonality: AvatarPersonalityType
  ): string {
    const toneInstructions = {
      funny:
        '\nHumor Style: Add light humor, puns about plants, or playful teasing. Keep it fun and uplifting!',
      gentle:
        '\nTone: Be warm, encouraging, and supportive. Avoid any criticism. Use gentle language.',
      expert:
        '\nStyle: Use botanical knowledge when relevant. Be informative and scientifically accurate. Educational tone.',
    };

    return prompt + (toneInstructions[avatarPersonality] || '');
  }

  /**
   * Build context enrichment string for more intelligent replies
   */
  private static buildContextEnrichment(context: ReplyContext): string {
    const lines: string[] = [];

    // Plant health
    lines.push(`Plant Health: ${context.plant.plantHealth}%`);

    // Last watered
    if (context.plant.daysSinceWatered > 10) {
      lines.push(`Thirsty: Not watered for ${context.plant.daysSinceWatered} days`);
    }

    // Recent action
    if (context.recentAction) {
      lines.push(`User just performed: ${context.recentAction}`);
    }

    // Weather
    if (context.weather) {
      lines.push(
        `Weather: ${context.weather.condition}, ${context.weather.temperature}°C, ${context.weather.humidity}% humidity`
      );
    }

    // User context
    if (context.user.totalPlantsOwned > 1) {
      lines.push(`User owns ${context.user.totalPlantsOwned} plants (experienced)`);
    } else {
      lines.push(`User owns 1 plant (beginner)`);
    }

    if (context.user.userStreak > 0) {
      lines.push(`User has ${context.user.userStreak} day streak (committed)`);
    }

    return lines.join('\n');
  }

  /**
   * Evaluate which emotion should accompany the reply
   */
  static evaluateEmotion(
    context: ReplyContext,
    recentAction?: string
  ): AvatarEmotion {
    const { plant, weather } = context;

    // Micro-action based emotions
    if (recentAction === 'badge_unlock') return 'excited';
    if (recentAction === 'water' && plant.plantHealth < 30) return 'happy';
    if (recentAction === 'check_in') return 'happy';

    // Health-based emotions
    const emotion = AvatarService.evaluateEmotion(
      plant.plantHealth,
      plant.daysSinceWatered,
      plant.daysSinceFertilized,
      plant.temperature || 20,
      plant.humidity || 50
    );

    return emotion;
  }

  /**
   * Suggest micro-action based on context
   */
  static suggestMicroAction(
    context: ReplyContext,
    recentAction?: string
  ): MicroActionType {
    // Badge unlocked
    if (recentAction === 'badge_unlock') return 'confetti';

    // Watering
    if (recentAction === 'water') return 'water_drop';

    // Fertilizing
    if (recentAction === 'fertilize') return 'dance';

    // Check-in
    if (recentAction === 'check_in') return 'fire_pulse';

    // Health improvement
    if (context.plant.plantHealth >= 80 && context.plant.daysSinceWatered <= 3) {
      return 'fire_pulse';
    }

    // Critical health
    if (context.plant.plantHealth < 20) return 'shake';

    return 'none';
  }

  /**
   * Generate contextual reply using Gemini API
   * Falls back to hardcoded reply if API fails
   * @param avatarPersonality - User's avatar personality preference for tone
   */
  static async generateReply(
    context: ReplyContext,
    avatarPersonality?: AvatarPersonalityType
  ): Promise<ContextualReply> {
    try {
      // Determine attachment phase
      const attachmentPhase = getAttachmentPhase(context.plant.dayWithUser);

      // Evaluate emotion
      const emotion = this.evaluateEmotion(context, context.recentAction);

      // Check cache
      const cacheKey = `${context.plant.plantId}-${emotion}-${avatarPersonality || 'default'}`;
      const cached = replyCache.get(cacheKey);
      if (cached && Date.now() - cached.generatedAt.getTime() < CACHE_DURATION_MS) {
        log.debug('Using cached reply', { cacheKey, attachmentPhase });
        return { ...cached, isFromCache: true };
      }

      // Call Gemini API
      const systemPrompt = this.buildSystemPrompt(
        context.plant.personality,
        attachmentPhase,
        context,
        avatarPersonality
      );

      const reply = await this.callGeminiAPI(systemPrompt, context);

      // Evaluate emotion after generation
      const emotion2 = this.evaluateEmotion(context, context.recentAction);
      const action = this.suggestMicroAction(context, context.recentAction);

      const result: ContextualReply = {
        text: reply,
        emotion: emotion2,
        action: action !== 'none' ? action : undefined,
        confidence: 0.85,
        isFromCache: false,
        generatedAt: new Date(),
      };

      // Cache it
      replyCache.set(cacheKey, result);

      return result;
    } catch (error) {
      log.error('Error generating contextual reply', error);

      // Fallback to hardcoded reply based on personality
      return this.getFallbackReply(context);
    }
  }

  /**
   * Call Gemini API (mocked for now, use actual API in production)
   */
  private static async callGeminiAPI(
    systemPrompt: string,
    context: ReplyContext
  ): Promise<string> {
    // TODO: Replace with actual Gemini API call
    // For now, return a contextual fallback

    const profile = getPersonalityProfile(context.plant.personality);
    const attachmentPhase = getAttachmentPhase(context.plant.dayWithUser);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return personality-based reply
    if (context.plant.plantHealth < 30 && context.plant.daysSinceWatered > 7) {
      return profile.exampleReplies.thirsty[0];
    }
    if (context.plant.plantHealth >= 80) {
      return profile.exampleReplies.happy[0];
    }
    if (context.recentAction === 'water') {
      return profile.exampleReplies.happy[0];
    }

    return profile.greetings[attachmentPhase];
  }

  /**
   * Fallback reply if Gemini fails
   */
  private static getFallbackReply(context: ReplyContext): ContextualReply {
    const profile = getPersonalityProfile(context.plant.personality);
    const attachmentPhase = getAttachmentPhase(context.plant.dayWithUser);
    const emotion = this.evaluateEmotion(context, context.recentAction);
    const action = this.suggestMicroAction(context, context.recentAction);

    return {
      text: profile.greetings[attachmentPhase],
      emotion,
      action: action !== 'none' ? action : undefined,
      confidence: 0.5,
      isFromCache: false,
      generatedAt: new Date(),
    };
  }

  /**
   * Build context from plant data (convenience method)
   * Usually called from components/screens
   */
  static buildPlantContext(
    plantId: string,
    plantName: string,
    personality: PlantPersonality,
    plantHealth: number,
    daysSinceWatered: number,
    daysSinceFertilized: number,
    dayWithUser: number,
    temperature?: number,
    humidity?: number
  ): PlantContext {
    return {
      plantId,
      plantName,
      personality,
      plantHealth,
      daysSinceWatered,
      daysSinceFertilized,
      temperature,
      humidity,
      dayWithUser,
    };
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  static clearCache(): void {
    replyCache.clear();
    log.debug('Reply cache cleared');
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: replyCache.size,
      entries: Array.from(replyCache.keys()),
    };
  }
}

/**
 * Hook-friendly wrapper for reply generation
 * Usage: const reply = await generateContextualReply(context, avatarPersonality)
 */
export async function generateContextualReply(
  context: ReplyContext,
  avatarPersonality?: AvatarPersonalityType
): Promise<ContextualReply> {
  return ContextualReplyService.generateReply(context, avatarPersonality);
}

/**
 * Quick helper to get greeting for onboarding
 * Usage: getOnboardingGreeting('monstera', true) → personality greeting
 */
export function getOnboardingGreeting(
  personality: PlantPersonality,
  isFirstMeeting: boolean = true
): string {
  const profile = getPersonalityProfile(personality);
  const phase = isFirstMeeting ? 'discovery' : 'familiarity';
  return profile.greetings[phase];
}
