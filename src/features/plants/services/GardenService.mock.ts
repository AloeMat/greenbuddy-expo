/**
 * Mock Garden Service for Testing
 */

import type { IGardenService } from './GardenService';

/**
 * Create a mock garden service with custom implementations
 */
export const createMockGardenService = (overrides?: Partial<IGardenService>): IGardenService => {
  const defaults: IGardenService = {
    calculateAddPlantRewards: (plantsCount: number) => ({
      xpAmount: 50 + (plantsCount === 0 ? 25 : 0),
      achievementsToUnlock: plantsCount === 0 ? ['first_plant'] : [],
    }),

    filterPlants: (plants: any[], filterBy: string) => {
      switch (filterBy) {
        case 'urgent':
          return plants.filter((p) => p.sante_score < 70);
        case 'health':
          return plants.filter((p) => p.sante_score < 50);
        case 'personality':
          return plants;
        case 'all':
        default:
          return plants;
      }
    },

    mapPlantFormToDb: (formData: any) => ({
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

    calculateFilterStats: (plants: any[]) => ({
      all: plants.length,
      urgent: plants.filter((p) => p.sante_score < 70).length,
      unhealthy: plants.filter((p) => p.sante_score < 50).length,
      uniquePersonalities: new Set(plants.map((p) => p.personnalite)).size,
    }),
  };

  return { ...defaults, ...overrides };
};

/**
 * Default mock instance
 */
export const mockGardenService = createMockGardenService();
