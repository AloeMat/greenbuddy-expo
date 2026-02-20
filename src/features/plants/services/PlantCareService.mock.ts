/**
 * Mock Plant Care Service for Testing
 */

import type { IPlantCareService, PlantWithRewards } from './PlantCareService';
import type { Plant } from '@/features/plants/repositories/PlantRepository';

/**
 * Create a mock plant care service with custom implementations
 */
export const createMockPlantCareService = (overrides?: Partial<IPlantCareService>): IPlantCareService => {
  const defaults: IPlantCareService = {
    async waterPlant(plantId: string): Promise<PlantWithRewards> {
      return {
        plant: {
          id: plantId,
          nom_commun: 'Mock Plant',
          sante_score: 85,
          arrosage_frequence_jours: 3,
          level: 1,
        } as unknown as Plant,
        xpEarned: 15,
        healthBonus: 5,
      };
    },

    async fertilizePlant(plantId: string): Promise<PlantWithRewards> {
      return {
        plant: {
          id: plantId,
          nom_commun: 'Mock Plant',
          sante_score: 95,
          arrosage_frequence_jours: 3,
          level: 1,
        } as unknown as Plant,
        xpEarned: 35,
        healthBonus: 15,
      };
    },

    checkHealthAchievements(healthScore: number): string[] {
      return healthScore === 100 ? ['plant_healthy'] : [];
    },

    calculateActionRewards(actionType: 'water' | 'fertilize', healthScore: number): number {
      const baseXp = actionType === 'water' ? 10 : 20;
      const healthBonus = healthScore >= 80 ? 5 : 0;
      return baseXp + healthBonus;
    },
  };

  return { ...defaults, ...overrides };
};

/**
 * Default mock instance
 */
export const mockPlantCareService = createMockPlantCareService();
