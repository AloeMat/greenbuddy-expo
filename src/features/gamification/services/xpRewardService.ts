/**
 * XP Reward Service
 * Centralizes XP reward logic for different plant care actions
 * Used to track and award gamification points
 */

import { logger } from '@/lib/services/logger';

export enum RewardType {
  // Plant Management
  ADD_PLANT = 'add_plant',  // +50 XP
  WATER_PLANT = 'water_plant',  // +10 XP
  FERTILIZE_PLANT = 'fertilize_plant',  // +20 XP
  DELETE_PLANT = 'delete_plant',  // -10 XP (penalty)

  // Achievements
  FIRST_PLANT = 'first_plant',  // +25 XP (achievement)
  PLANT_HEALTHY = 'plant_healthy',  // +15 XP (health = 100)
  STREAK_7 = 'streak_7',  // +100 XP (7-day streak)
  LEVEL_5 = 'level_5',  // +50 XP (reach level 5)
  COLLECTION_10 = 'collection_10',  // +75 XP (10 plants)
}

interface RewardConfig {
  amount: number;
  description: string;
  achievementId?: string;
}

const REWARD_AMOUNTS: Record<RewardType, RewardConfig> = {
  // Plant Management (regular rewards)
  [RewardType.ADD_PLANT]: {
    amount: 50,
    description: 'Nouvelle plante ajoutée',
  },
  [RewardType.WATER_PLANT]: {
    amount: 10,
    description: 'Plante arrosée',
  },
  [RewardType.FERTILIZE_PLANT]: {
    amount: 20,
    description: 'Plante fertilisée',
  },
  [RewardType.DELETE_PLANT]: {
    amount: -10,
    description: 'Plante supprimée',
  },

  // Achievements (unlocks)
  [RewardType.FIRST_PLANT]: {
    amount: 25,
    description: 'Trophée: Main Verte',
    achievementId: 'first_plant',
  },
  [RewardType.PLANT_HEALTHY]: {
    amount: 15,
    description: 'Plante en parfaite santé',
  },
  [RewardType.STREAK_7]: {
    amount: 100,
    description: 'Trophée: Jardinier Dévoué',
    achievementId: 'streak_7',
  },
  [RewardType.LEVEL_5]: {
    amount: 50,
    description: 'Trophée: Expert Botaniste',
    achievementId: 'level_5',
  },
  [RewardType.COLLECTION_10]: {
    amount: 75,
    description: 'Trophée: Jungle Urbaine',
    achievementId: 'collection_10',
  },
};

export const xpRewardService = {
  /**
   * Get XP reward amount for a specific action
   */
  getRewardAmount(rewardType: RewardType): number {
    const config = REWARD_AMOUNTS[rewardType];
    return config?.amount || 0;
  },

  /**
   * Get reward configuration including description and achievement ID
   */
  getRewardConfig(rewardType: RewardType): RewardConfig | null {
    return REWARD_AMOUNTS[rewardType] || null;
  },

  /**
   * Log XP reward (for analytics/debugging)
   */
  logReward(rewardType: RewardType, plantName?: string): void {
    const config = REWARD_AMOUNTS[rewardType];
    if (!config) return;

    const amount = config.amount;
    const sign = amount >= 0 ? '+' : '';
    const emoji = amount >= 0 ? '⭐' : '❌';

    if (plantName) {
      logger.info(`${emoji} ${sign}${amount} XP - ${config.description} (${plantName})`);
    } else {
      logger.info(`${emoji} ${sign}${amount} XP - ${config.description}`);
    }
  },

  /**
   * Get all reward types
   */
  getAllRewardTypes(): RewardType[] {
    return Object.values(RewardType);
  },

  /**
   * Get total XP from multiple rewards
   */
  getTotalReward(rewardTypes: RewardType[]): number {
    return rewardTypes.reduce((total, type) => {
      return total + this.getRewardAmount(type);
    }, 0);
  },
};
