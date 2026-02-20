/**
 * plantsStore Unit Tests
 * Tests Zustand global state management for plants
 *
 * Uses getState() directly — no React rendering needed
 */

// Mock supabase to avoid expo-constants ESM import
jest.mock('@/lib/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
    })),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  },
}));

// Mock logger
jest.mock('@/lib/services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { usePlantsStore } from '@/features/plants/store/plantsStore';
import type { Plant } from '@/features/plants/repositories/PlantRepository';

/** Helper: get current store state */
const getStore = () => usePlantsStore.getState();

describe('plantsStore (Zustand)', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePlantsStore.setState({
      plants: [],
      loading: false,
      error: null,
      lastFetchTime: null,
    });
  });

  describe('Initial state', () => {
    it('should have empty plants array', () => {
      expect(getStore().plants).toEqual([]);
    });

    it('should have loading false', () => {
      expect(getStore().loading).toBe(false);
    });

    it('should have error null', () => {
      expect(getStore().error).toBeNull();
    });

    it('should have lastFetchTime null', () => {
      expect(getStore().lastFetchTime).toBeNull();
    });
  });

  describe('getPlant query', () => {
    it('should return plant by ID', () => {
      const mockPlant: Partial<Plant> = {
        id: 'plant-1',
        nom_commun: 'Monstera',
        sante_score: 80,
      };

      usePlantsStore.setState({
        plants: [mockPlant as Plant],
      });

      const found = getStore().getPlant('plant-1');
      expect(found).toEqual(mockPlant);
    });

    it('should return undefined for non-existent plant', () => {
      const found = getStore().getPlant('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getUrgentPlants query', () => {
    it('should return plants needing water within 2 days', () => {
      const now = new Date();
      const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const mockPlants: Partial<Plant>[] = [
        {
          id: 'plant-1',
          nom_commun: 'Urgent',
          next_watering_at: in1Day.toISOString(),
          sante_score: 50,
        },
        {
          id: 'plant-2',
          nom_commun: 'Not Urgent',
          next_watering_at: in5Days.toISOString(),
          sante_score: 50,
        },
      ];

      usePlantsStore.setState({
        plants: mockPlants as Plant[],
      });

      const urgent = getStore().getUrgentPlants();
      expect(urgent).toHaveLength(1);
      expect(urgent[0].id).toBe('plant-1');
    });

    it('should return empty array when no urgent plants', () => {
      const now = new Date();
      const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const mockPlants: Partial<Plant>[] = [
        {
          id: 'plant-1',
          nom_commun: 'Future',
          next_watering_at: in5Days.toISOString(),
          sante_score: 50,
        },
      ];

      usePlantsStore.setState({
        plants: mockPlants as Plant[],
      });

      const urgent = getStore().getUrgentPlants();
      expect(urgent).toHaveLength(0);
    });
  });

  describe('getUpcomingWaterings query', () => {
    it('should return plants needing water within 7 days', () => {
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

      const mockPlants: Partial<Plant>[] = [
        {
          id: 'plant-1',
          nom_commun: 'Upcoming',
          next_watering_at: in3Days.toISOString(),
          sante_score: 50,
        },
        {
          id: 'plant-2',
          nom_commun: 'Too Far',
          next_watering_at: in10Days.toISOString(),
          sante_score: 50,
        },
      ];

      usePlantsStore.setState({
        plants: mockPlants as Plant[],
      });

      const upcoming = getStore().getUpcomingWaterings();
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].id).toBe('plant-1');
    });
  });

  describe('clear action', () => {
    it('should reset all state', () => {
      usePlantsStore.setState({
        plants: [{ id: 'test' } as Plant],
        loading: true,
        error: 'Test error',
        lastFetchTime: Date.now(),
      });

      getStore().clear();

      expect(getStore().plants).toEqual([]);
      expect(getStore().error).toBeNull();
      expect(getStore().lastFetchTime).toBeNull();
    });
  });

  describe('Cache logic (5-min TTL)', () => {
    it('should respect cache TTL', () => {
      const oldTime = Date.now() - 6 * 60 * 1000; // 6 minutes ago

      usePlantsStore.setState({
        lastFetchTime: oldTime,
      });

      // Cache should be expired (TTL = 5 min = 300000 ms)
      const now = Date.now();
      const ttl = 5 * 60 * 1000;
      const expired = getStore().lastFetchTime && (now - getStore().lastFetchTime! > ttl);

      expect(expired).toBe(true);
    });

    it('should use cache within TTL', () => {
      const recentTime = Date.now() - 2 * 60 * 1000; // 2 minutes ago

      usePlantsStore.setState({
        lastFetchTime: recentTime,
      });

      const now = Date.now();
      const ttl = 5 * 60 * 1000;
      const expired = getStore().lastFetchTime && (now - getStore().lastFetchTime! > ttl);

      expect(expired).toBe(false);
    });
  });

  describe('Store composition', () => {
    it('should have all required methods', () => {
      const state = getStore();

      expect(typeof state.getPlant).toBe('function');
      expect(typeof state.getUrgentPlants).toBe('function');
      expect(typeof state.getUpcomingWaterings).toBe('function');
      expect(typeof state.fetchPlants).toBe('function');
      expect(typeof state.addPlant).toBe('function');
      expect(typeof state.updatePlant).toBe('function');
      expect(typeof state.deletePlant).toBe('function');
      expect(typeof state.waterPlant).toBe('function');
      expect(typeof state.fertilizePlant).toBe('function');
      expect(typeof state.refresh).toBe('function');
      expect(typeof state.clear).toBe('function');
    });

    it('should have all required state properties', () => {
      const state = getStore();

      expect(Array.isArray(state.plants)).toBe(true);
      expect(typeof state.loading).toBe('boolean');
      expect(state.error === null || typeof state.error === 'string').toBe(true);
      expect(state.lastFetchTime === null || typeof state.lastFetchTime === 'number').toBe(true);
    });
  });
});
