/**
 * Human Design Types & Utilities
 * Personalization setup for user onboarding
 */

// ============================================
// 🎯 HUMAN DESIGN TYPES
// ============================================

export type CaregiverProfile = 'forgetful' | 'stressed' | 'passionate';
export type LivingPlace = 'apartment' | 'house' | 'office';
export type WateringRhythm = 'daily' | '3x_week' | '2x_week' | 'weekly' | 'bi_weekly';
export type GuiltSensitivity = 'yes' | 'somewhat' | 'no';
export type AvatarPersonalityType = 'funny' | 'gentle' | 'expert';

export interface HumanDesignSetup {
  user_id: string;
  caregiver_profile: CaregiverProfile;
  living_place: LivingPlace;
  watering_rhythm: WateringRhythm;
  guilt_sensitivity: GuiltSensitivity;
  avatar_personality: AvatarPersonalityType;
  recommended_check_frequency?: number;
  notification_style?: 'formal' | 'casual' | 'poetic' | 'scientific';
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

/**
 * Calculate check frequency (days) based on watering rhythm
 */
export function calculateCheckFrequency(rhythm: WateringRhythm): number {
  const frequencies: Record<WateringRhythm, number> = {
    'daily': 1,
    '3x_week': 2,
    '2x_week': 3,
    'weekly': 7,
    'bi_weekly': 14,
  };
  return frequencies[rhythm] || 7;
}

/**
 * Calculate notification style based on caregiver profile & guilt sensitivity
 */
export function calculateNotificationStyle(
  caregiverProfile: CaregiverProfile,
  guiltSensitivity: GuiltSensitivity
): 'formal' | 'casual' | 'poetic' {
  if (guiltSensitivity === 'no') return 'casual';
  if (caregiverProfile === 'passionate') return 'poetic';
  return 'formal';
}

/**
 * Get human-readable caregiver profile label
 */
export function getCaregiverLabel(profile: CaregiverProfile): string {
  const labels: Record<CaregiverProfile, string> = {
    'forgetful': '🙈 Oublieux/se',
    'stressed': '😰 Stressé/e',
    'passionate': '🔥 Passionné/e',
  };
  return labels[profile] || profile;
}

/**
 * Get human-readable living place label
 */
export function getLivingPlaceLabel(place: LivingPlace): string {
  const labels: Record<LivingPlace, string> = {
    'apartment': '🏢 Appartement',
    'house': '🏠 Maison',
    'office': '🏢 Bureau',
  };
  return labels[place] || place;
}

/**
 * Get human-readable watering rhythm label
 */
export function getWateringRhythmLabel(rhythm: WateringRhythm): string {
  const labels: Record<WateringRhythm, string> = {
    'daily': '⏰ Chaque jour',
    '3x_week': '📅 3x par semaine',
    '2x_week': '📅 2x par semaine',
    'weekly': '📅 1x par semaine',
    'bi_weekly': '📅 Tous les 14 jours',
  };
  return labels[rhythm] || rhythm;
}
