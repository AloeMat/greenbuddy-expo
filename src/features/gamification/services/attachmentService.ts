/**
 * Attachment Service
 * ════════════════════════════════
 *
 * Manages plant attachment progression (Tamagotchi-style bonding)
 * - Tracks days with user (relationship maturity)
 * - Determines attachment phase (discovery → familiarity → attachment → companion)
 * - Calculates attachment score (0-100%) based on care consistency
 * - Unlocks attachment-specific achievements & features
 * - Influences personality replies and emotional expressions
 *
 * Phase 4.2: Avatar Vocal Enrichi
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@lib/services/logger';

/**
 * Attachment phase progression
 */
export type AttachmentPhase = 'discovery' | 'familiarity' | 'attachment' | 'companion';

/**
 * Plant attachment state
 */
export interface AttachmentState {
  plantId: string;
  dayWithUser: number;           // Total days since plant added
  attachmentPhase: AttachmentPhase;
  attachmentScore: number;        // 0-100%
  careConsistencyDays: number;   // Days with watering/interactions
  missedCares: number;            // Days without care
  totalInteractions: number;      // Total care actions
  firstInteractionDate: Date;     // When user first interacted
  lastInteractionDate: Date;      // Last care action
  lastPhaseChangeDate: Date;      // When phase last changed
  achievementsUnlocked: string[]; // Attachment-specific achievements
}

/**
 * Attachment phase metadata
 */
export interface AttachmentPhaseMetadata {
  phase: AttachmentPhase;
  dayRange: { min: number; max: number };
  description: string;
  milestones: { day: number; name: string; reward?: number }[];
  unlockedFeatures: string[];
  emotionalDepth: 'surface' | 'developing' | 'strong' | 'deep';
}

/**
 * Phase progression schedule
 * Timings can be adjusted for testing
 */
export const ATTACHMENT_PHASES: Record<AttachmentPhase, AttachmentPhaseMetadata> = {
  discovery: {
    phase: 'discovery',
    dayRange: { min: 0, max: 7 },
    description: 'Première rencontre - Phase de découverte',
    milestones: [
      { day: 0, name: 'Première rencontre', reward: 0 },
      { day: 1, name: 'Premier jour ensemble', reward: 10 },
      { day: 3, name: '3 jours ensemble', reward: 15 },
      { day: 7, name: 'Une semaine!' },
    ],
    unlockedFeatures: ['basic_care', 'voice_greeting'],
    emotionalDepth: 'surface',
  },

  familiarity: {
    phase: 'familiarity',
    dayRange: { min: 8, max: 30 },
    description: 'Habitude formée - Phase de familiarité',
    milestones: [
      { day: 8, name: 'Nouvelle phase: Familiarité', reward: 25 },
      { day: 14, name: '2 semaines de soin', reward: 30 },
      { day: 21, name: '3 semaines ensemble', reward: 40 },
      { day: 30, name: 'Un mois! 🎉', reward: 50 },
    ],
    unlockedFeatures: ['health_insights', 'weather_aware_tips', 'personality_depth'],
    emotionalDepth: 'developing',
  },

  attachment: {
    phase: 'attachment',
    dayRange: { min: 31, max: 90 },
    description: 'Lien établi - Phase d\'attachement',
    milestones: [
      { day: 31, name: 'Nouvelle phase: Attachement', reward: 60 },
      { day: 45, name: '6 semaines ensemble', reward: 75 },
      { day: 60, name: '2 mois de compagnie', reward: 90 },
      { day: 90, name: 'Trimestre complet! 🏆', reward: 120 },
    ],
    unlockedFeatures: ['growth_tracking', 'customization_deep', 'seasonal_quests'],
    emotionalDepth: 'strong',
  },

  companion: {
    phase: 'companion',
    dayRange: { min: 91, max: Infinity },
    description: 'Compagnon fidèle - Phase de compagnonnage',
    milestones: [
      { day: 91, name: 'Nouveau statut: Compagnon', reward: 150 },
      { day: 180, name: '6 mois ensemble 💚', reward: 250 },
      { day: 365, name: 'Un an! Ami pour la vie! 👑', reward: 500 },
    ],
    unlockedFeatures: ['memory_album', 'legacy_tracking', 'expert_mode', 'social_sharing'],
    emotionalDepth: 'deep',
  },
};

/**
 * Attachment achievements (unlocked at phase transitions)
 */
export const ATTACHMENT_ACHIEVEMENTS = {
  FIRST_WEEK: { id: 'first_week_companion', name: 'Première Semaine', xp: 25 },
  ONE_MONTH: { id: 'one_month_companion', name: 'Un Mois de Soins', xp: 50 },
  THREE_MONTHS: { id: 'three_months_companion', name: 'Trimestre Ensemble', xp: 120 },
  ONE_YEAR: { id: 'one_year_companion', name: 'Ami pour la Vie', xp: 500 },
  PERFECT_CARE: { id: 'perfect_care_30', name: 'Soins Parfaits (30j)', xp: 100 },
};

/**
 * Attachment Service
 */
export class AttachmentService {
  private static readonly STORAGE_KEY = 'greenbuddy_attachment_';

  /**
   * Initialize attachment state for new plant
   */
  static initializeAttachment(plantId: string): AttachmentState {
    const now = new Date();
    return {
      plantId,
      dayWithUser: 0,
      attachmentPhase: 'discovery',
      attachmentScore: 0,
      careConsistencyDays: 0,
      missedCares: 0,
      totalInteractions: 0,
      firstInteractionDate: now,
      lastInteractionDate: now,
      lastPhaseChangeDate: now,
      achievementsUnlocked: [],
    };
  }

  /**
   * Calculate attachment phase from days with user
   */
  static getAttachmentPhase(dayWithUser: number): AttachmentPhase {
    if (dayWithUser <= 7) return 'discovery';
    if (dayWithUser <= 30) return 'familiarity';
    if (dayWithUser <= 90) return 'attachment';
    return 'companion';
  }

  /**
   * Calculate attachment score (0-100%) based on care consistency
   * Formula: (careConsistencyDays / expectedDays) * 80% + (interactions) * 20%
   */
  static calculateAttachmentScore(
    dayWithUser: number,
    careConsistencyDays: number,
    totalInteractions: number
  ): number {
    if (dayWithUser === 0) return 0;

    // Expected care days: 2-3 times per week = ~40% of days in period
    const expectedCareDays = Math.floor(dayWithUser * 0.4);
    const careScore = Math.min((careConsistencyDays / expectedCareDays) * 80, 80);

    // Interaction score: 10 interactions = 20% bonus
    const interactionScore = Math.min((totalInteractions / 10) * 20, 20);

    return Math.round(careScore + interactionScore);
  }

  /**
   * Record care action (water, fertilize, etc.)
   */
  static recordCareAction(
    state: AttachmentState,
    actionType: 'water' | 'fertilize' | 'interact' | 'check_in'
  ): AttachmentState {
    const now = new Date();
    const daysSinceLastCare = this.getDaysSince(state.lastInteractionDate);

    // Increment care consistency if action within 3 days
    const newCareConsistencyDays =
      daysSinceLastCare <= 3 ? state.careConsistencyDays + 1 : state.careConsistencyDays;

    return {
      ...state,
      totalInteractions: state.totalInteractions + 1,
      careConsistencyDays: newCareConsistencyDays,
      lastInteractionDate: now,
    };
  }

  /**
   * Update daily state (call once per day)
   * Tracks missed care days and updates phase
   */
  static updateDaily(state: AttachmentState): {
    updatedState: AttachmentState;
    phaseChanged: boolean;
    newPhase?: AttachmentPhase;
  } {
    const daysSinceAdded = this.getDaysSince(state.firstInteractionDate);
    const daysSinceLastCare = this.getDaysSince(state.lastInteractionDate);

    let updatedState = { ...state, dayWithUser: daysSinceAdded };

    // Track missed care (no interaction for 3+ days)
    if (daysSinceLastCare > 3 && daysSinceLastCare % 3 === 0) {
      updatedState.missedCares += 1;
    }

    // Recalculate attachment score
    updatedState.attachmentScore = this.calculateAttachmentScore(
      updatedState.dayWithUser,
      updatedState.careConsistencyDays,
      updatedState.totalInteractions
    );

    // Check phase transition
    const newPhase = this.getAttachmentPhase(updatedState.dayWithUser);
    const phaseChanged = newPhase !== state.attachmentPhase;

    if (phaseChanged) {
      updatedState.attachmentPhase = newPhase;
      updatedState.lastPhaseChangeDate = new Date();
    }

    return { updatedState, phaseChanged, newPhase: phaseChanged ? newPhase : undefined };
  }

  /**
   * Get phase metadata
   */
  static getPhaseMetadata(phase: AttachmentPhase): AttachmentPhaseMetadata {
    return ATTACHMENT_PHASES[phase];
  }

  /**
   * Get next phase milestone
   */
  static getNextMilestone(
    phase: AttachmentPhase,
    dayWithUser: number
  ): { day: number; name: string; reward?: number } | null {
    const metadata = ATTACHMENT_PHASES[phase];
    const nextMilestone = metadata.milestones.find(m => m.day > dayWithUser);
    return nextMilestone || null;
  }

  /**
   * Check if attachment phase milestone was reached
   */
  static isMilestoneDay(phase: AttachmentPhase, dayWithUser: number): boolean {
    const metadata = ATTACHMENT_PHASES[phase];
    return metadata.milestones.some(m => m.day === dayWithUser);
  }

  /**
   * Get milestone reward for day
   */
  static getMilestoneReward(phase: AttachmentPhase, dayWithUser: number): number {
    const metadata = ATTACHMENT_PHASES[phase];
    const milestone = metadata.milestones.find(m => m.day === dayWithUser);
    return milestone?.reward || 0;
  }

  /**
   * Get progress to next phase (0-100%)
   */
  static getPhaseProgress(phase: AttachmentPhase, dayWithUser: number): number {
    const metadata = ATTACHMENT_PHASES[phase];
    const phaseStart = metadata.dayRange.min;
    const phaseEnd = Math.min(metadata.dayRange.max, 999); // Cap at 999 for display

    if (dayWithUser < phaseStart) return 0;
    if (dayWithUser >= phaseEnd) return 100;

    const progress = ((dayWithUser - phaseStart) / (phaseEnd - phaseStart)) * 100;
    return Math.round(progress);
  }

  /**
   * Get emotional depth for current phase
   * Used to determine reply intimacy level
   */
  static getEmotionalDepth(phase: AttachmentPhase): 'surface' | 'developing' | 'strong' | 'deep' {
    return ATTACHMENT_PHASES[phase].emotionalDepth;
  }

  /**
   * Check if feature is unlocked for this attachment state
   */
  static isFeatureUnlocked(phase: AttachmentPhase, feature: string): boolean {
    const metadata = ATTACHMENT_PHASES[phase];
    return metadata.unlockedFeatures.includes(feature);
  }

  /**
   * Get all unlocked features for attachment state
   */
  static getUnlockedFeatures(phase: AttachmentPhase): string[] {
    // Include features from all previous phases
    const phases: AttachmentPhase[] = ['discovery', 'familiarity', 'attachment', 'companion'];
    const currentIndex = phases.indexOf(phase);

    return phases
      .slice(0, currentIndex + 1)
      .flatMap(p => ATTACHMENT_PHASES[p].unlockedFeatures);
  }

  /**
   * Persist attachment state to AsyncStorage
   */
  static async saveAttachment(state: AttachmentState): Promise<void> {
    try {
      const key = `${this.STORAGE_KEY}${state.plantId}`;
      await AsyncStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      logger.error('[AttachmentService] Error saving attachment:', error);
      throw error;
    }
  }

  /**
   * Load attachment state from AsyncStorage
   */
  static async loadAttachment(plantId: string): Promise<AttachmentState | null> {
    try {
      const key = `${this.STORAGE_KEY}${plantId}`;
      const data = await AsyncStorage.getItem(key);
      if (!data) return null;

      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        firstInteractionDate: new Date(parsed.firstInteractionDate),
        lastInteractionDate: new Date(parsed.lastInteractionDate),
        lastPhaseChangeDate: new Date(parsed.lastPhaseChangeDate),
      };
    } catch (error) {
      logger.error('[AttachmentService] Error loading attachment:', error);
      return null;
    }
  }

  /**
   * Helper: Calculate days between two dates
   */
  private static getDaysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Generate attachment status string (for UI display)
   */
  static getAttachmentStatusText(phase: AttachmentPhase, dayWithUser: number): string {
    const phaseMetadata = ATTACHMENT_PHASES[phase];
    const progress = this.getPhaseProgress(phase, dayWithUser);

    return `${phaseMetadata.description} (${progress}%)`;
  }

  /**
   * Get attachment-related tip
   */
  static getAttachmentTip(phase: AttachmentPhase): string {
    const tips: Record<AttachmentPhase, string> = {
      discovery:
        'Prenez soin régulièrement pour commencer à créer un lien. Découvrez la personnalité de votre plante!',
      familiarity:
        'Vous commencez à développer une relation! Continuez les soins réguliers pour approfondir le lien.',
      attachment:
        'Un vrai lien s\'est formé! Votre plante commence à vous reconnaître et à réagir à vos soins.',
      companion:
        'Vous êtes maintenant des compagnons de vie. Votre plante est devenue une véritable amie fidèle!',
    };
    return tips[phase];
  }
}

/**
 * Hook-friendly helper to get attachment status
 */
export function getAttachmentStatus(state: AttachmentState): {
  phase: AttachmentPhase;
  score: number;
  progress: number;
  statusText: string;
  tip: string;
  nextMilestone: { day: number; name: string; reward?: number } | null;
} {
  const phase = state.attachmentPhase;
  return {
    phase,
    score: state.attachmentScore,
    progress: AttachmentService.getPhaseProgress(phase, state.dayWithUser),
    statusText: AttachmentService.getAttachmentStatusText(phase, state.dayWithUser),
    tip: AttachmentService.getAttachmentTip(phase),
    nextMilestone: AttachmentService.getNextMilestone(phase, state.dayWithUser),
  };
}
