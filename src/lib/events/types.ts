/**
 * GreenBuddy Events System — Localized
 * 
 * Core event types for inter-feature communication
 * Emitted from features, consumed by features (via listeners)
 * 
 * Design Pattern:
 * - Decoupled: Features emit events without knowing consumers
 * - Typed: All events have strict TypeScript types
 * - Centralized: All event types in one place
 * - Observable: EventEmitter-based (optional: Zustand listeners)
 */

// ============================================
// 🌱 PLANT EVENTS
// ============================================

export type PlantWatered = {
  name: 'PLANT_WATERED';
  data: {
    plantId: string;
    userId: string;
    healthIncrease: number;
    timestamp: number;
  };
};

export type PlantAnalyzed = {
  name: 'PLANT_ANALYZED';
  data: {
    plantId: string;
    userId: string;
    personality: string;
    healthScore: number;
    diagnosis?: string;
    timestamp: number;
  };
};

export type PlantDied = {
  name: 'PLANT_DIED';
  data: {
    plantId: string;
    userId: string;
    plantName: string;
    timestamp: number;
  };
};

// ============================================
// 🎮 GAMIFICATION EVENTS
// ============================================

export type UserLeveledUp = {
  name: 'USER_LEVELED_UP';
  data: {
    userId: string;
    newLevel: number;
    totalXp: number;
    xpThisLevel: number;
    unlockReward?: string;
    timestamp: number;
  };
};

export type AchievementUnlocked = {
  name: 'ACHIEVEMENT_UNLOCKED';
  data: {
    userId: string;
    achievementId: string;
    achievementTitle: string;
    xpReward: number;
    timestamp: number;
  };
};

export type StreakMilestone = {
  name: 'STREAK_MILESTONE';
  data: {
    userId: string;
    currentStreak: number;
    milestoneType: 'STREAK_7' | 'STREAK_30' | 'STREAK_90';
    xpReward: number;
    timestamp: number;
  };
};

// ============================================
// 👤 USER EVENTS
// ============================================

export type UserLoginSuccess = {
  name: 'USER_LOGIN_SUCCESS';
  data: {
    userId: string;
    email: string;
    isFirstLogin: boolean;
    timestamp: number;
  };
};

export type UserLogoutSuccess = {
  name: 'USER_LOGOUT_SUCCESS';
  data: {
    userId: string;
    timestamp: number;
  };
};

export type OnboardingCompleted = {
  name: 'ONBOARDING_COMPLETED';
  data: {
    userId: string;
    selectedPersonality: string;
    selectedHumanDesignType?: string;
    timestamp: number;
  };
};

// ============================================
// 📡 UNION TYPES & REGISTRY
// ============================================

export type AppEvent =
  | PlantWatered
  | PlantAnalyzed
  | PlantDied
  | UserLeveledUp
  | AchievementUnlocked
  | StreakMilestone
  | UserLoginSuccess
  | UserLogoutSuccess
  | OnboardingCompleted;

/**
 * Event names registry for type-safe event emissions
 */
export enum EventName {
  PLANT_WATERED = 'PLANT_WATERED',
  PLANT_ANALYZED = 'PLANT_ANALYZED',
  PLANT_DIED = 'PLANT_DIED',
  USER_LEVELED_UP = 'USER_LEVELED_UP',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS',
  USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS',
  ONBOARDING_COMPLETED = 'ONBOARDING_COMPLETED',
}

/**
 * Event emitter callback type
 * Usage: eventBus.on<PlantWatered>('PLANT_WATERED', (event) => { ... })
 */
export type EventCallback<T extends AppEvent = AppEvent> = (event: T) => void | Promise<void>;

/**
 * Simple event emitter interface (implementation in lib/events/emitter.ts)
 */
export interface IEventBus {
  on<T extends AppEvent>(eventName: T['name'], callback: EventCallback<T>): () => void;
  off<T extends AppEvent>(eventName: T['name'], callback: EventCallback<T>): void;
  emit<T extends AppEvent>(event: T): Promise<void>;
  clear(): void;
}
