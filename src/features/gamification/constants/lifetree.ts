/**
 * Arbre de Vie (Tree of Life) - 9 Tier System
 * GreenBuddy v2.2 Gamification
 *
 * Inspired by plant lifecycle:
 * Graine → Germination → Pousse → Tige → Feuille → Fleur → Fruit → Arbre → Forêt
 */

import type { LifeTreeTier, XpReward, RewardType } from '@/types';

// ========================================
// ARBRE DE VIE - 9 TIERS
// ========================================

export const LIFE_TREE_TIERS: LifeTreeTier[] = [
  {
    tier: 1,
    name: 'Seed',
    frenchName: 'Graine',
    xpRequired: 0,
    totalXpRequired: 0,
    description: 'Beginning of the journey. You are a tiny seed, full of potential.',
    rewards: ['basic_profile', 'first_plant'],
    icon: '🌱',
  },
  {
    tier: 2,
    name: 'Germination',
    frenchName: 'Germination',
    xpRequired: 100,
    totalXpRequired: 100,
    description: 'Your roots are taking shape. You are starting to grow.',
    rewards: ['avatar_customization', 'plant_nickname'],
    icon: '🌿',
  },
  {
    tier: 3,
    name: 'Sprout',
    frenchName: 'Pousse',
    xpRequired: 200,
    totalXpRequired: 300,
    description: 'You are breaking through the soil. Growth is visible now.',
    rewards: ['daily_quests', 'streak_tracking'],
    icon: '🌱',
  },
  {
    tier: 4,
    name: 'Stem',
    frenchName: 'Tige',
    xpRequired: 300,
    totalXpRequired: 600,
    description: 'Your stem is strong. You are becoming resilient.',
    rewards: ['care_history', 'plant_tips'],
    icon: '🌾',
  },
  {
    tier: 5,
    name: 'Leaf',
    frenchName: 'Feuille',
    xpRequired: 400,
    totalXpRequired: 1000,
    description: 'Your first leaves are unfurling. You are thriving.',
    rewards: ['mood_tracking', 'meditation_hub'],
    icon: '🍃',
  },
  {
    tier: 6,
    name: 'Flower',
    frenchName: 'Fleur',
    xpRequired: 500,
    totalXpRequired: 1500,
    description: 'You are blooming. Beauty and potential shine through.',
    rewards: ['friends_system', 'plant_sharing'],
    icon: '🌸',
  },
  {
    tier: 7,
    name: 'Fruit',
    frenchName: 'Fruit',
    xpRequired: 600,
    totalXpRequired: 2100,
    description: 'You are bearing fruit. Your growth is bearing results.',
    rewards: ['leaderboard', 'achievement_badges'],
    icon: '🍎',
  },
  {
    tier: 8,
    name: 'Tree',
    frenchName: 'Arbre',
    xpRequired: 800,
    totalXpRequired: 2900,
    description: 'You have become a mighty tree. Strength and stability define you.',
    rewards: ['premium_features', 'custom_themes'],
    icon: '🌳',
  },
  {
    tier: 9,
    name: 'Forest',
    frenchName: 'Forêt',
    xpRequired: 1000,
    totalXpRequired: 3900,
    description: 'You are a thriving forest. You lead by example and inspire others.',
    rewards: ['legendary_status', 'exclusive_content', 'community_moderator'],
    icon: '🌲',
  },
];

// ========================================
// XP REWARD MATRIX
// ========================================

export const XP_REWARDS: Record<RewardType, XpReward> = {
  // Lowercase variants (modern naming convention)
  watering: {
    type: 'watering',
    amount: 10,
    description: 'Watered a plant',
  },
  health_milestone: {
    type: 'health_milestone',
    amount: 15,
    description: 'Plant reached 100% health',
  },
  streak_milestone: {
    type: 'streak_milestone',
    amount: 50,
    description: 'Daily streak milestone',
  },
  achievement: {
    type: 'achievement',
    amount: 0,
    description: 'Achievement unlocked',
  },
  daily_login: {
    type: 'daily_login',
    amount: 5,
    description: 'Daily login bonus',
  },
  add_plant: {
    type: 'add_plant',
    amount: 50,
    description: 'Added a new plant',
  },
  first_plant: {
    type: 'first_plant',
    amount: 25,
    description: 'Added your first plant',
    achievementId: 'first_plant',
  },
  collection_10: {
    type: 'collection_10',
    amount: 75,
    description: 'Collected 10 plants',
    achievementId: 'collection_10',
  },
  collection_25: {
    type: 'collection_25',
    amount: 150,
    description: 'Collected 25 plants',
    achievementId: 'collection_25',
  },
  fertilize: {
    type: 'fertilize',
    amount: 20,
    description: 'Fertilized a plant',
  },

  // Uppercase variants (backward compatibility with existing code)
  ADD_PLANT: {
    type: 'ADD_PLANT',
    amount: 50,
    description: 'Added a new plant',
  },
  WATER_PLANT: {
    type: 'WATER_PLANT',
    amount: 10,
    description: 'Watered a plant',
  },
  FERTILIZE_PLANT: {
    type: 'FERTILIZE_PLANT',
    amount: 20,
    description: 'Fertilized a plant',
  },
  DELETE_PLANT: {
    type: 'DELETE_PLANT',
    amount: -10,
    description: 'Deleted a plant (penalty)',
  },

  // Milestones
  FIRST_PLANT: {
    type: 'FIRST_PLANT',
    amount: 25,
    description: 'Added your first plant',
    achievementId: 'first_plant',
  },
  PLANT_HEALTHY: {
    type: 'PLANT_HEALTHY',
    amount: 15,
    description: 'Plant reached 100% health',
  },

  // Streaks
  STREAK_7: {
    type: 'STREAK_7',
    amount: 50,
    description: '7-day streak milestone',
    achievementId: 'streak_7',
  },
  STREAK_30: {
    type: 'STREAK_30',
    amount: 200,
    description: '30-day streak milestone',
    achievementId: 'streak_30',
  },
  STREAK_90: {
    type: 'STREAK_90',
    amount: 500,
    description: '90-day streak milestone',
    achievementId: 'streak_90',
  },

  // Level Milestones
  LEVEL_5: {
    type: 'LEVEL_5',
    amount: 50,
    description: 'Reached tier 5 (Feuille)',
    achievementId: 'level_5',
  },
  LEVEL_10: {
    type: 'LEVEL_10',
    amount: 200,
    description: 'Reached tier 10 (Forêt)',
    achievementId: 'level_10',
  },

  // Collection Milestones
  COLLECTION_10: {
    type: 'COLLECTION_10',
    amount: 75,
    description: 'Collected 10 plants',
    achievementId: 'collection_10',
  },
  COLLECTION_25: {
    type: 'COLLECTION_25',
    amount: 150,
    description: 'Collected 25 plants',
    achievementId: 'collection_25',
  },

  // Custom
  CUSTOM: {
    type: 'CUSTOM',
    amount: 0,
    description: 'Custom reward',
  },
};

// ========================================
// HELPERS
// ========================================

/**
 * Get XP requirement for a specific tier
 */
export function getXpForTier(tier: number): number {
  const tierData = LIFE_TREE_TIERS.find(t => t.tier === tier);
  return tierData?.totalXpRequired ?? 0;
}

/**
 * Calculate current tier from total XP
 */
export function calculateTierFromXp(totalXp: number): number {
  let currentTier = 1;
  for (let i = LIFE_TREE_TIERS.length - 1; i >= 0; i--) {
    const tierData = LIFE_TREE_TIERS[i];
    if (totalXp >= (tierData.totalXpRequired ?? 0)) {
      currentTier = tierData.tier;
      break;
    }
  }
  return currentTier;
}

/**
 * Calculate progress to next tier (0-100%)
 */
export function calculateTierProgress(totalXp: number): number {
  const currentTier = calculateTierFromXp(totalXp);
  if (currentTier === 9) return 100; // Max tier

  const currentTierData = LIFE_TREE_TIERS[currentTier - 1];
  const nextTierData = LIFE_TREE_TIERS[currentTier];

  const currentXpRequired = currentTierData?.totalXpRequired ?? 0;
  const nextXpRequired = nextTierData?.totalXpRequired ?? 0;

  const xpInCurrentTier = totalXp - currentXpRequired;
  const xpNeededForNextTier = nextXpRequired - currentXpRequired;

  return Math.round((xpInCurrentTier / xpNeededForNextTier) * 100);
}

/**
 * Get XP needed to reach next tier
 */
export function getXpNeededForNextTier(totalXp: number): number {
  const currentTier = calculateTierFromXp(totalXp);
  if (currentTier === 9) return 0; // Max tier

  const nextTierData = LIFE_TREE_TIERS[currentTier];
  const nextXpRequired = nextTierData?.totalXpRequired ?? 0;
  return Math.max(0, nextXpRequired - totalXp);
}
