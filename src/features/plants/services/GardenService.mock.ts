/**
 * Mock Garden Service for Testing
 */

import type { IGardenService, PlantFormInput } from './GardenService';
import type { Plant } from '@/features/plants/repositories/PlantRepository';

/**
 * Create a mock garden service with custom implementations
 */
export const createMockGardenService = (overrides?: Partial<IGardenService>): IGardenService => {
  const defaults: IGardenService = {
    calculateAddPlantRewards: (plantsCount: number) => {
      const achievementsToUnlock: string[] = [];
      let totalXp = 50; // Base ADD_PLANT reward

      // First plant achievement
      if (plantsCount === 0) {
        achievementsToUnlock.push('first_plant');
        totalXp += 25; // FIRST_PLANT reward
      }

      // Collection milestone at 10 plants
      const newCount = plantsCount + 1;
      if (newCount === 10) {
        achievementsToUnlock.push('collection_10');
        totalXp += 75; // COLLECTION_10 reward
      }

      return { xpAmount: totalXp, achievementsToUnlock };
    },

    filterPlants: (plants: Plant[], filterBy: string) => {
      switch (filterBy) {
        case 'urgent': {
          const now = Date.now();
          return plants.filter((p) => {
            if (!p.next_watering_at) return false;
            const nextWaterTime = new Date(p.next_watering_at).getTime();
            return nextWaterTime - now <= 24 * 60 * 60 * 1000;
          });
        }
        case 'health':
          return plants.filter((p) => p.sante_score < 50);
        case 'personality':
          return plants;
        case 'all':
        default:
          return plants;
      }
    },

    mapPlantFormToDb: (formData: PlantFormInput) => ({
      nom_commun: formData.commonName,
      nom_scientifique: formData.scientificName,
      personnalite: formData.personality,
      surnom: formData.nickname,
      sante_score: formData.healthScore ?? 75,
      localisation: formData.location,
      notes: formData.notes,
      arrosage_frequence_jours: formData.wateringFrequency ?? 3,
      lumiere: formData.lightRequirements ?? 'indirect',
      temperature_min: formData.temperatureMin ?? 15,
      temperature_max: formData.temperatureMax ?? 25,
    }),

    getEmotionState: (healthScore: number) => {
      if (healthScore >= 80) return 'happy';
      if (healthScore >= 60) return 'idle';
      return 'sad';
    },

    calculateFilterStats: (plants: Plant[]) => {
      const now = Date.now();
      return {
        all: plants.length,
        urgent: plants.filter((p) => {
          if (!p.next_watering_at) return false;
          const nextWaterTime = new Date(p.next_watering_at).getTime();
          return nextWaterTime - now <= 24 * 60 * 60 * 1000;
        }).length,
        unhealthy: plants.filter((p) => p.sante_score < 50).length,
        uniquePersonalities: new Set(plants.map((p) => p.personnalite)).size,
      };
    },
  };

  return { ...defaults, ...overrides };
};

/**
 * Default mock instance
 */
export const mockGardenService = createMockGardenService();
