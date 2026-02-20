/**
 * Plant Care Service - Business Logic Layer
 * Handles plant care operations and state updates
 * Includes achievement unlocking and XP reward logic
 */

import type { IPlantRepository, Plant } from '@/features/plants/repositories/PlantRepository';
import { xpRewardService, RewardType } from '@/features/gamification/services/xpRewardService';
import { logger } from '@/lib/services/logger';

export interface PlantWithRewards {
  plant: Plant;
  xpEarned: number;
  healthBonus?: number;
}

export interface IPlantCareService {
  waterPlant(plantId: string): Promise<PlantWithRewards>;
  fertilizePlant(plantId: string): Promise<PlantWithRewards>;
  checkHealthAchievements(healthScore: number): string[];
  calculateActionRewards(actionType: 'water' | 'fertilize', healthScore: number): number;
}

/**
 * Service for all plant care operations
 * Independent from React and UI concerns
 */
export class PlantCareService implements IPlantCareService {
  constructor(private repo: IPlantRepository) {}

  /**
   * Water a plant - updates watering dates and health
   */
  async waterPlant(plantId: string): Promise<PlantWithRewards> {
    try {
      const plant = await this.repo.findById(plantId);
      if (!plant) throw new Error('Plant not found');

      const nextWatering = this.calculateNextWatering(plant);
      const healthBonus = plant.sante_score < 100 ? 5 : 0;
      const newHealthScore = Math.min(100, plant.sante_score + healthBonus);

      const updatedPlant = await this.repo.update(plantId, {
        last_watered_at: new Date().toISOString(),
        next_watering_at: nextWatering.toISOString(),
        sante_score: newHealthScore
      });

      if (!updatedPlant) throw new Error('Failed to update plant');

      // Calculate XP reward
      const xpEarned = this.calculateActionRewards('water', newHealthScore);

      // Check for achievements
      const achievementsToUnlock = this.checkHealthAchievements(newHealthScore);
      if (achievementsToUnlock.length > 0) {
        logger.info(`🏆 Achievements unlocked: ${achievementsToUnlock.join(', ')}`);
      }

      logger.info('Plant watered', { plantId, healthBonus, xpEarned });

      return {
        plant: updatedPlant,
        xpEarned,
        healthBonus
      };
    } catch (err) {
      logger.error('Water plant failed:', err);
      throw err;
    }
  }

  /**
   * Fertilize a plant - increases health and XP
   */
  async fertilizePlant(plantId: string): Promise<PlantWithRewards> {
    try {
      const plant = await this.repo.findById(plantId);
      if (!plant) throw new Error('Plant not found');

      const healthBonus = 15;
      const newHealthScore = Math.min(100, plant.sante_score + healthBonus);

      const updatedPlant = await this.repo.update(plantId, {
        sante_score: newHealthScore
      });

      if (!updatedPlant) throw new Error('Failed to update plant');

      // Calculate XP reward
      const xpEarned = this.calculateActionRewards('fertilize', newHealthScore);

      // Check for achievements
      const achievementsToUnlock = this.checkHealthAchievements(newHealthScore);
      if (achievementsToUnlock.length > 0) {
        logger.info(`🏆 Achievements unlocked: ${achievementsToUnlock.join(', ')}`);
      }

      logger.info('Plant fertilized', { plantId, healthBonus, xpEarned });

      return {
        plant: updatedPlant,
        xpEarned,
        healthBonus
      };
    } catch (err) {
      logger.error('Fertilize plant failed:', err);
      throw err;
    }
  }

  /**
   * Check if plant health score qualifies for achievements
   * @param healthScore - Current health score (0-100)
   * @returns Array of achievement IDs to unlock
   */
  checkHealthAchievements(healthScore: number): string[] {
    const achievements: string[] = [];

    // Perfect health achievement
    if (healthScore === 100) {
      achievements.push('plant_healthy');
      logger.debug('🌟 Plant reached perfect health!');
    }

    return achievements;
  }

  /**
   * Calculate XP reward based on action and health status
   * @param actionType - Type of action: 'water' or 'fertilize'
   * @param healthScore - Current health score after action
   * @returns XP amount earned
   */
  calculateActionRewards(actionType: 'water' | 'fertilize', healthScore: number): number {
    let baseXp = 0;

    if (actionType === 'water') {
      baseXp = xpRewardService.getRewardAmount(RewardType.WATER_PLANT);
    } else if (actionType === 'fertilize') {
      baseXp = xpRewardService.getRewardAmount(RewardType.FERTILIZE_PLANT);
    }

    // Bonus XP for improving plant health
    const healthBonus = healthScore >= 80 ? 5 : 0;

    return baseXp + healthBonus;
  }

  /**
   * Calculate next watering date based on frequency
   */
  private calculateNextWatering(plant: Plant): Date {
    const now = new Date();
    const days = plant.arrosage_frequence_jours || 7;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }
}

// Factory function
export const createPlantCareService = (repo: IPlantRepository): PlantCareService => {
  return new PlantCareService(repo);
};
