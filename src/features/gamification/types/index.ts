/**
 * Gamification Feature Types — Localized
 * Source unique de vérité pour les types gamification
 * Import: import type { Achievement, GamificationState } from '@/features/gamification/types'
 */

export interface GamificationState {
  totalXp: number;
  currentTier: number;
  tierProgress: number;
  achievements: Achievement[];
  unlockedAchievements: string[];
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isLevelUp: boolean;

  // Actions
  addXp: (amount: number, source: RewardType) => void;
  addXpCustom: (amount: number, source: string) => void;
  unlockAchievement: (achievementId: string) => void;
  getAchievementsByCategory: (category: string) => Achievement[];
  updateStreak: () => void;
  resetStreak: () => void;
  initialize: () => Promise<void>;
  checkMilestones: () => void;
  getLifeTreeTier: (tier: number) => LifeTreeTier | undefined;
  getAllLifeTreeTiers: () => LifeTreeTier[];
  getTier: () => LifeTreeTier | undefined;
  getTierProgressPercentage: () => number;
  getNextTierXpNeeded: () => number;
  getProgress: () => number;
  dismissLevelUp: () => void;
  clearGamification: () => void;
  reset: () => void;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: number;
  xpReward: number;
  iconName: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  // Additional optional properties
  icon?: string;
  name?: string;
}

export type AchievementCategory =
  | 'watering'
  | 'health'
  | 'collection'
  | 'streak'
  | 'special'
  | 'botaniste'
  | 'soigneur'
  | 'social'
  | 'explorateur'
  | 'collectionneur';

export interface LifeTreeTier {
  tier: number;
  name: string;
  minXp?: number;
  maxXp?: number;
  color?: string;
  benefits?: string[];
  // Additional optional properties
  description?: string;
  requiredXp?: number;
  xpRequired?: number;  // Alias for requiredXp (used in lifetree.ts)
  totalXpRequired?: number;
  rewards?: string[];
  icon?: string;
  frenchName?: string;
}

export type RewardType =
  | 'watering'
  | 'health_milestone'
  | 'streak_milestone'
  | 'achievement'
  | 'daily_login'
  | 'add_plant'
  | 'first_plant'
  | 'collection_10'
  | 'collection_25'
  | 'fertilize'
  // Uppercase variants (for backward compatibility with lifetree.ts)
  | 'ADD_PLANT'
  | 'WATER_PLANT'
  | 'FERTILIZE_PLANT'
  | 'DELETE_PLANT'
  | 'FIRST_PLANT'
  | 'PLANT_HEALTHY'
  | 'STREAK_7'
  | 'STREAK_30'
  | 'STREAK_90'
  | 'LEVEL_5'
  | 'LEVEL_10'
  | 'COLLECTION_10'
  | 'COLLECTION_25'
  | 'CUSTOM';

export interface XpReward {
  amount: number;
  source?: RewardType;
  type?: RewardType;  // Alias for source
  description?: string;
  achievementId?: string;
  timestamp?: string;
}
