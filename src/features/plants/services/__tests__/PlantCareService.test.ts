/**
 * PlantCareService Unit Tests
 * Tests plant care operations and reward calculations
 */

import { createMockPlantCareService } from '@plants/services';

describe('PlantCareService', () => {
  const service = createMockPlantCareService();

  describe('checkHealthAchievements', () => {
    it('should unlock plant_healthy achievement at 100% health', () => {
      const achievements = service.checkHealthAchievements(100);
      expect(achievements).toContain('plant_healthy');
    });

    it('should not unlock achievement below 100%', () => {
      const achievements = service.checkHealthAchievements(99);
      expect(achievements).toEqual([]);
    });

    it('should return empty array for low health', () => {
      const achievements = service.checkHealthAchievements(50);
      expect(achievements).toEqual([]);
    });

    it('should return empty array for 0% health', () => {
      const achievements = service.checkHealthAchievements(0);
      expect(achievements).toEqual([]);
    });
  });

  describe('calculateActionRewards', () => {
    it('should award base XP for watering', () => {
      const xp = service.calculateActionRewards('water', 50);
      expect(xp).toBe(10); // Base water reward
    });

    it('should award base XP for fertilizing', () => {
      const xp = service.calculateActionRewards('fertilize', 50);
      expect(xp).toBe(20); // Base fertilize reward
    });

    it('should award bonus XP when health >= 80% after watering', () => {
      const xp = service.calculateActionRewards('water', 85);
      expect(xp).toBe(15); // 10 base + 5 bonus
    });

    it('should award bonus XP when health >= 80% after fertilizing', () => {
      const xp = service.calculateActionRewards('fertilize', 80);
      expect(xp).toBe(25); // 20 base + 5 bonus
    });

    it('should not award bonus XP below 80% health', () => {
      const waterXp = service.calculateActionRewards('water', 79);
      const fertilizeXp = service.calculateActionRewards('fertilize', 79);

      expect(waterXp).toBe(10);
      expect(fertilizeXp).toBe(20);
    });

    it('should award max bonus at 100% health', () => {
      const waterXp = service.calculateActionRewards('water', 100);
      const fertilizeXp = service.calculateActionRewards('fertilize', 100);

      expect(waterXp).toBe(15);
      expect(fertilizeXp).toBe(25);
    });
  });

  describe('waterPlant', () => {
    it('should return plant with XP earned', async () => {
      const result = await service.waterPlant('test-plant-id');

      expect(result).toHaveProperty('plant');
      expect(result).toHaveProperty('xpEarned');
      expect(result.xpEarned).toBeGreaterThan(0);
    });

    it('should include health bonus in result', async () => {
      const result = await service.waterPlant('test-plant-id');

      expect(result).toHaveProperty('healthBonus');
      expect(result.healthBonus).toBeGreaterThan(0);
    });
  });

  describe('fertilizePlant', () => {
    it('should return plant with XP earned', async () => {
      const result = await service.fertilizePlant('test-plant-id');

      expect(result).toHaveProperty('plant');
      expect(result).toHaveProperty('xpEarned');
      expect(result.xpEarned).toBeGreaterThan(0);
    });

    it('should include health bonus in result', async () => {
      const result = await service.fertilizePlant('test-plant-id');

      expect(result).toHaveProperty('healthBonus');
      expect(result.healthBonus).toBeGreaterThan(0);
    });

    it('fertilize should award more XP than water', async () => {
      const waterResult = await service.waterPlant('test-1');
      const fertilizeResult = await service.fertilizePlant('test-2');

      expect(fertilizeResult.xpEarned).toBeGreaterThan(waterResult.xpEarned);
    });
  });

  describe('Mock service overrides', () => {
    it('should allow custom implementations', async () => {
      const customService = createMockPlantCareService({
        calculateActionRewards: (actionType: string, healthScore: number) => 999
      });

      const xp = customService.calculateActionRewards('water', 50);
      expect(xp).toBe(999);
    });

    it('should preserve other methods when overriding', async () => {
      const customService = createMockPlantCareService({
        calculateActionRewards: () => 100
      });

      const achievements = customService.checkHealthAchievements(100);
      expect(achievements).toContain('plant_healthy');
    });
  });
});
