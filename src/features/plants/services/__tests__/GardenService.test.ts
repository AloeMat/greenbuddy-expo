/**
 * GardenService Unit Tests
 * Tests business logic for garden management
 */

import { createMockGardenService } from '@plants/services';

describe('GardenService', () => {
  const service = createMockGardenService();

  describe('calculateAddPlantRewards', () => {
    it('should award base XP for adding a plant', () => {
      const result = service.calculateAddPlantRewards(5);
      expect(result.xpAmount).toBe(50); // Base ADD_PLANT reward
      expect(result.achievementsToUnlock).toEqual([]);
    });

    it('should unlock first_plant achievement for first plant', () => {
      const result = service.calculateAddPlantRewards(0);
      expect(result.xpAmount).toBe(75); // Base 50 + First Plant 25
      expect(result.achievementsToUnlock).toContain('first_plant');
    });

    it('should unlock collection_10 achievement at 10 plants', () => {
      const result = service.calculateAddPlantRewards(9);
      expect(result.xpAmount).toBe(125); // Base 50 + Collection 10 75
      expect(result.achievementsToUnlock).toContain('collection_10');
    });

    it('should not unlock collection_10 before 10 plants', () => {
      const result = service.calculateAddPlantRewards(8);
      expect(result.achievementsToUnlock).not.toContain('collection_10');
    });
  });

  describe('filterPlants', () => {
    const mockPlants = [
      {
        id: '1',
        nom_commun: 'Monstera',
        sante_score: 90,
        next_watering_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        personnalite: 'monstera'
      },
      {
        id: '2',
        nom_commun: 'Cactus',
        sante_score: 30,
        next_watering_at: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours
        personnalite: 'cactus'
      },
      {
        id: '3',
        nom_commun: 'Orchidee',
        sante_score: 75,
        next_watering_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
        personnalite: 'orchidee'
      },
    ];

    it('should return all plants for "all" filter', () => {
      const result = service.filterPlants(mockPlants, 'all');
      expect(result).toHaveLength(3);
    });

    it('should filter urgent plants (< 2 days)', () => {
      const result = service.filterPlants(mockPlants, 'urgent');
      expect(result).toHaveLength(2); // Cactus (0.5d) + Monstera (1d)
      expect(result[0].id).toBe('2'); // Cactus should be first (most urgent)
    });

    it('should filter unhealthy plants (< 50 health)', () => {
      const result = service.filterPlants(mockPlants, 'health');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2'); // Only Cactus
    });

    it('should return all plants for personality filter', () => {
      const result = service.filterPlants(mockPlants, 'personality');
      expect(result).toHaveLength(3);
    });
  });

  describe('getEmotionState', () => {
    it('should return "happy" for high health (>= 80)', () => {
      expect(service.getEmotionState(100)).toBe('happy');
      expect(service.getEmotionState(80)).toBe('happy');
    });

    it('should return "idle" for medium health (60-79)', () => {
      expect(service.getEmotionState(79)).toBe('idle');
      expect(service.getEmotionState(60)).toBe('idle');
    });

    it('should return "sad" for low health (< 60)', () => {
      expect(service.getEmotionState(59)).toBe('sad');
      expect(service.getEmotionState(0)).toBe('sad');
    });
  });

  describe('calculateFilterStats', () => {
    const mockPlants = [
      {
        id: '1',
        nom_commun: 'Monstera',
        sante_score: 90,
        next_watering_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        personnalite: 'monstera'
      },
      {
        id: '2',
        nom_commun: 'Cactus',
        sante_score: 30,
        next_watering_at: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(),
        personnalite: 'cactus'
      },
      {
        id: '3',
        nom_commun: 'Orchidee',
        sante_score: 75,
        next_watering_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        personnalite: 'orchidee'
      },
    ];

    it('should calculate correct stats', () => {
      const stats = service.calculateFilterStats(mockPlants);

      expect(stats.all).toBe(3);
      expect(stats.urgent).toBe(2); // Plants watering within 2 days
      expect(stats.unhealthy).toBe(1); // Cactus with health < 50
      expect(stats.uniquePersonalities).toBe(3);
    });

    it('should return 0 stats for empty plants array', () => {
      const stats = service.calculateFilterStats([]);

      expect(stats.all).toBe(0);
      expect(stats.urgent).toBe(0);
      expect(stats.unhealthy).toBe(0);
      expect(stats.uniquePersonalities).toBe(0);
    });
  });

  describe('mapPlantFormToDb', () => {
    it('should map all form fields to database format', () => {
      const formData = {
        commonName: 'Test Plant',
        scientificName: 'Testus planticus',
        personality: 'monstera',
        nickname: 'My Plant',
        healthScore: 75,
        location: 'Window',
        notes: 'Test notes',
        wateringFrequency: 3,
        lightRequirements: 'indirect',
        temperatureMin: 15,
        temperatureMax: 25
      };

      const result = service.mapPlantFormToDb(formData);

      expect(result.nom_commun).toBe('Test Plant');
      expect(result.nom_scientifique).toBe('Testus planticus');
      expect(result.personnalite).toBe('monstera');
      expect(result.surnom).toBe('My Plant');
      expect(result.sante_score).toBe(75);
      expect(result.localisation).toBe('Window');
      expect(result.notes).toBe('Test notes');
      expect(result.arrosage_frequence_jours).toBe(3);
      expect(result.lumiere).toBe('indirect');
      expect(result.temperature_min).toBe(15);
      expect(result.temperature_max).toBe(25);
    });
  });
});
