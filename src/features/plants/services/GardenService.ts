/**
 * Garden Service
 * Business logic for garden management
 * - Plant reward calculations
 * - Achievement unlocking conditions
 * - Data validation
 */

import { xpRewardService, RewardType } from '@gamification/services/xpRewardService';
import { logger } from '@lib/services/logger';

export interface IGardenService {
  /**
   * Calculate rewards for adding a new plant
   * @param plantsCount - Current number of plants before adding
   * @returns Object with XP amount and achievements to unlock
   */
  calculateAddPlantRewards(plantsCount: number): {
    xpAmount: number;
    achievementsToUnlock: string[];
  };

  /**
   * Filter plants based on criteria
   * @param plants - Array of plants to filter
   * @param filterBy - Filter type: 'all' | 'urgent' | 'health' | 'personality'
   * @returns Filtered plants array
   */
  filterPlants(plants: any[], filterBy: 'all' | 'urgent' | 'health' | 'personality'): any[];

  /**
   * Map plant form data to database format
   * @param formData - Form submission data
   * @returns Database-ready plant object
   */
  mapPlantFormToDb(formData: any): any;

  /**
   * Get emotion state based on health score
   * @param healthScore - Plant health percentage (0-100)
   * @returns Emotion state
   */
  getEmotionState(healthScore: number): 'happy' | 'idle' | 'sad';

  /**
   * Calculate filter tab statistics
   * @param plants - Array of all plants
   * @returns Object with counts for each filter
   */
  calculateFilterStats(plants: any[]): {
    all: number;
    urgent: number;
    unhealthy: number;
    uniquePersonalities: number;
  };
}

/**
 * Garden Service Implementation
 */
export class GardenServiceImpl implements IGardenService {
  /**
   * Calculate total XP and achievements for adding a plant
   */
  calculateAddPlantRewards(plantsCount: number): {
    xpAmount: number;
    achievementsToUnlock: string[];
  } {
    const achievementsToUnlock: string[] = [];
    let totalXp = 0;

    // Base XP for adding plant
    const baseXp = xpRewardService.getRewardAmount(RewardType.ADD_PLANT);
    totalXp += baseXp;
    logger.debug(`🌱 Add plant: +${baseXp} XP`);

    // First plant achievement
    if (plantsCount === 0) {
      achievementsToUnlock.push('first_plant');
      const firstPlantXp = xpRewardService.getRewardAmount(RewardType.FIRST_PLANT);
      totalXp += firstPlantXp;
      logger.debug(`🎉 First plant: +${firstPlantXp} XP (achievement unlocked)`);
    }

    // Collection milestones
    const newCount = plantsCount + 1;
    if (newCount === 10) {
      achievementsToUnlock.push('collection_10');
      const collectionXp = xpRewardService.getRewardAmount(RewardType.COLLECTION_10);
      totalXp += collectionXp;
      logger.debug(`🏆 Collection 10: +${collectionXp} XP (achievement unlocked)`);
    }

    return {
      xpAmount: totalXp,
      achievementsToUnlock,
    };
  }

  /**
   * Filter plants based on criteria
   */
  filterPlants(plants: any[], filterBy: 'all' | 'urgent' | 'health' | 'personality'): any[] {
    switch (filterBy) {
      case 'urgent':
        // Plants needing water soon (next watering within 1 day)
        const now = Date.now();
        return plants.filter((p) => {
          if (!p.next_watering_at) return false;
          const nextWaterTime = new Date(p.next_watering_at).getTime();
          return nextWaterTime - now <= 24 * 60 * 60 * 1000;
        });

      case 'health':
        // Unhealthy plants (health score < 50)
        return plants.filter((p) => p.sante_score < 50);

      case 'personality':
        // This filter just groups by personality in the UI
        // Return all plants (UI will handle grouping)
        return plants;

      case 'all':
      default:
        return plants;
    }
  }

  /**
   * Map plant form data to database format
   */
  mapPlantFormToDb(formData: any): any {
    return {
      nom_commun: formData.commonName,
      nom_scientifique: formData.scientificName,
      personnalite: formData.personality,
      surnom: formData.nickname,
      sante_score: formData.healthScore,
      localisation: formData.location,
      notes: formData.notes,
      arrosage_frequence_jours: formData.wateringFrequency,
      lumiere: formData.lightRequirements,
      temperature_min: formData.temperatureMin,
      temperature_max: formData.temperatureMax,
    };
  }

  /**
   * Get emotion state based on health score
   */
  getEmotionState(healthScore: number): 'happy' | 'idle' | 'sad' {
    if (healthScore >= 80) {
      return 'happy';
    } else if (healthScore >= 60) {
      return 'idle';
    } else {
      return 'sad';
    }
  }

  /**
   * Calculate filter tab statistics
   */
  calculateFilterStats(plants: any[]): {
    all: number;
    urgent: number;
    unhealthy: number;
    uniquePersonalities: number;
  } {
    const urgentPlants = this.filterPlants(plants, 'urgent');
    const unhealthyPlants = this.filterPlants(plants, 'health');
    const uniquePersonalities = new Set(plants.map((p) => p.personnalite)).size;

    return {
      all: plants.length,
      urgent: urgentPlants.length,
      unhealthy: unhealthyPlants.length,
      uniquePersonalities,
    };
  }
}

/**
 * Factory function for dependency injection
 */
export const createGardenService = (): IGardenService => {
  return new GardenServiceImpl();
};

/**
 * Default instance
 */
export const gardenService = createGardenService();
