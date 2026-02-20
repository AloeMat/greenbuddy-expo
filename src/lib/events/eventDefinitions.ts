/**
 * GreenBuddy Event Definitions — FSD Architecture
 * 
 * Core event types for inter-feature communication (Feature-Sliced Design)
 * Maps to features and their event publishers
 * 
 * Event Emitter Pattern:
 * - features/plants/services/ → emits PLANT_* events
 * - features/gamification/services/ → emits GAMIFICATION_* events
 * - features/auth/services/ → emits AUTH_* events
 * 
 * Usage:
 * ```typescript
 * import { eventBus } from '@/lib/events';
 * 
 * // Subscribe to events
 * eventBus.on('PLANT_WATERED', (event) => console.log('Plant watered!', event));
 * 
 * // Emit events (from services)
 * eventBus.emit('PLANT_WATERED', { plantId: '123', xpGain: 10 });
 * ```
 */

// ============================================
// 🌱 PLANT EVENTS
// ============================================

export interface PlantWateredEvent {
  type: 'PLANT_WATERED';
  payload: {
    plantId: string;
    userId: string;
    healthIncrease: number;
    timestamp: number;
  };
}

export interface PlantAnalyzedEvent {
  type: 'PLANT_ANALYZED';
  payload: {
    plantId: string;
    userId: string;
    personality: string;
    healthScore: number;
    diagnosis?: string;
    timestamp: number;
  };
}

export interface PlantAddedEvent {
  type: 'PLANT_ADDED';
  payload: {
    plantId: string;
    userId: string;
    plantName: string;
    timestamp: number;
  };
}

// ============================================
// 🎮 GAMIFICATION EVENTS
// ============================================

export interface UserLevelUpEvent {
  type: 'USER_LEVEL_UP';
  payload: {
    userId: string;
    newLevel: number;
    totalXp: number;
    xpThisLevel: number;
    unlockReward?: string;
    timestamp: number;
  };
}

export interface AchievementUnlockedEvent {
  type: 'ACHIEVEMENT_UNLOCKED';
  payload: {
    userId: string;
    achievementId: string;
    achievementTitle: string;
    xpReward: number;
    timestamp: number;
  };
}

export interface StreakMilestoneEvent {
  type: 'STREAK_MILESTONE';
  payload: {
    userId: string;
    currentStreak: number;
    milestoneType: 'STREAK_7' | 'STREAK_30' | 'STREAK_90';
    xpReward: number;
    timestamp: number;
  };
}

// ============================================
// 👤 AUTH EVENTS
// ============================================

export interface UserLoginSuccessEvent {
  type: 'USER_LOGIN_SUCCESS';
  payload: {
    userId: string;
    email: string;
    isFirstLogin: boolean;
    timestamp: number;
  };
}

export interface UserLogoutSuccessEvent {
  type: 'USER_LOGOUT_SUCCESS';
  payload: {
    userId: string;
    timestamp: number;
  };
}

// ============================================
// 👋 ONBOARDING EVENTS
// ============================================

export interface OnboardingCompletedEvent {
  type: 'ONBOARDING_COMPLETED';
  payload: {
    userId: string;
    selectedPersonality: string;
    selectedHumanDesignType?: string;
    timestamp: number;
  };
}

// ============================================
// 📡 UNION TYPES
// ============================================

export type GreenBuddyEvent =
  // Plant events
  | PlantWateredEvent
  | PlantAnalyzedEvent
  | PlantAddedEvent
  // Gamification events
  | UserLevelUpEvent
  | AchievementUnlockedEvent
  | StreakMilestoneEvent
  // Auth events
  | UserLoginSuccessEvent
  | UserLogoutSuccessEvent
  // Onboarding events
  | OnboardingCompletedEvent;

/**
 * Event names enum for type-safe string literals
 */
export enum GreenBuddyEventName {
  PLANT_WATERED = 'PLANT_WATERED',
  PLANT_ANALYZED = 'PLANT_ANALYZED',
  PLANT_ADDED = 'PLANT_ADDED',
  USER_LEVEL_UP = 'USER_LEVEL_UP',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS',
  USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS',
  ONBOARDING_COMPLETED = 'ONBOARDING_COMPLETED',
}
