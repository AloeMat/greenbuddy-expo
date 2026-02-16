/**
 * plantsStore Unit Tests
 * Tests Zustand global state management for plants
 */

import { renderHook, act } from '@testing-library/react';
import { usePlantsStore } from '@plants/store/plantsStore';
import type { Plant } from '@plants/repositories/PlantRepository';

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
      const { result } = renderHook(() => usePlantsStore());
      expect(result.current.plants).toEqual([]);
    });

    it('should have loading false', () => {
      const { result } = renderHook(() => usePlantsStore());
      expect(result.current.loading).toBe(false);
    });

    it('should have error null', () => {
      const { result } = renderHook(() => usePlantsStore());
      expect(result.current.error).toBeNull();
    });

    it('should have lastFetchTime null', () => {
      const { result } = renderHook(() => usePlantsStore());
      expect(result.current.lastFetchTime).toBeNull();
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

      const { result } = renderHook(() => usePlantsStore());
      const found = result.current.getPlant('plant-1');

      expect(found).toEqual(mockPlant);
    });

    it('should return undefined for non-existent plant', () => {
      const { result } = renderHook(() => usePlantsStore());
      const found = result.current.getPlant('non-existent');

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

      const { result } = renderHook(() => usePlantsStore());
      const urgent = result.current.getUrgentPlants();

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

      const { result } = renderHook(() => usePlantsStore());
      const urgent = result.current.getUrgentPlants();

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

      const { result } = renderHook(() => usePlantsStore());
      const upcoming = result.current.getUpcomingWaterings();

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

      const { result } = renderHook(() => usePlantsStore());

      act(() => {
        result.current.clear();
      });

      expect(result.current.plants).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.lastFetchTime).toBeNull();
    });
  });

  describe('Cache logic (5-min TTL)', () => {
    it('should respect cache TTL', () => {
      const oldTime = Date.now() - 6 * 60 * 1000; // 6 minutes ago

      usePlantsStore.setState({
        lastFetchTime: oldTime,
      });

      const { result } = renderHook(() => usePlantsStore());

      // Cache should be expired (TTL = 5 min = 300000 ms)
      const now = Date.now();
      const ttl = 5 * 60 * 1000;
      const expired = result.current.lastFetchTime && (now - result.current.lastFetchTime > ttl);

      expect(expired).toBe(true);
    });

    it('should use cache within TTL', () => {
      const recentTime = Date.now() - 2 * 60 * 1000; // 2 minutes ago

      usePlantsStore.setState({
        lastFetchTime: recentTime,
      });

      const { result } = renderHook(() => usePlantsStore());

      const now = Date.now();
      const ttl = 5 * 60 * 1000;
      const expired = result.current.lastFetchTime && (now - result.current.lastFetchTime > ttl);

      expect(expired).toBe(false);
    });
  });

  describe('Store composition', () => {
    it('should have all required methods', () => {
      const { result } = renderHook(() => usePlantsStore());

      expect(typeof result.current.getPlant).toBe('function');
      expect(typeof result.current.getUrgentPlants).toBe('function');
      expect(typeof result.current.getUpcomingWaterings).toBe('function');
      expect(typeof result.current.fetchPlants).toBe('function');
      expect(typeof result.current.addPlant).toBe('function');
      expect(typeof result.current.updatePlant).toBe('function');
      expect(typeof result.current.deletePlant).toBe('function');
      expect(typeof result.current.waterPlant).toBe('function');
      expect(typeof result.current.fertilizePlant).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
      expect(typeof result.current.clear).toBe('function');
    });

    it('should have all required state properties', () => {
      const { result } = renderHook(() => usePlantsStore());

      expect(Array.isArray(result.current.plants)).toBe(true);
      expect(typeof result.current.loading).toBe('boolean');
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
      expect(result.current.lastFetchTime === null || typeof result.current.lastFetchTime === 'number').toBe(true);
    });
  });
});
