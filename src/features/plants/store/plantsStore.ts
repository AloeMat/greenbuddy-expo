/**
 * Plants Store - Zustand
 * Global state management for plants with caching
 * Replaces useState-based usePlants hook
 */

import { create } from 'zustand';
import { supabase } from '@/lib/services/supabase';
import { logger } from '@/lib/services/logger';
import { Plant, createPlantRepository } from '@/features/plants/repositories/PlantRepository';
import { createPlantCareService } from '@/features/plants/services/PlantCareService';

// Initialize services
const plantRepository = createPlantRepository();
const plantCareService = createPlantCareService(plantRepository);

export interface PlantsState {
  // State
  plants: Plant[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null; // For caching (5 min ttl)

  // Queries
  getPlant: (id: string) => Plant | undefined;
  getUpcomingWaterings: () => Plant[];
  getUrgentPlants: () => Plant[];

  // Mutations
  fetchPlants: (userId: string, forceRefresh?: boolean) => Promise<void>;
  addPlant: (userId: string, data: Partial<Plant>) => Promise<Plant | null>;
  updatePlant: (id: string, data: Partial<Plant>) => Promise<Plant | null>;
  deletePlant: (id: string) => Promise<boolean>;
  waterPlant: (id: string) => Promise<Plant | null>;
  fertilizePlant: (id: string) => Promise<Plant | null>;

  // Utilities
  refresh: (userId: string) => Promise<void>;
  clear: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export const usePlantsStore = create<PlantsState>((set, get) => ({
  // Initial state
  plants: [],
  loading: false,
  error: null,
  lastFetchTime: null,

  /**
   * Query: Get single plant by ID
   */
  getPlant: (id: string) => {
    return get().plants.find(p => p.id === id);
  },

  /**
   * Query: Get plants with upcoming watering in next 7 days
   */
  getUpcomingWaterings: () => {
    const plants = get().plants;
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return plants.filter(p => {
      if (!p.next_watering_at) return false;
      const nextWatering = new Date(p.next_watering_at);
      return nextWatering >= now && nextWatering <= in7Days;
    });
  },

  /**
   * Query: Get plants that need urgent watering (< 2 days)
   */
  getUrgentPlants: () => {
    const plants = get().plants;
    const now = new Date();
    const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    return plants.filter(p => {
      if (!p.next_watering_at) return false;
      const nextWatering = new Date(p.next_watering_at);
      return nextWatering <= in2Days;
    });
  },

  /**
   * Fetch all plants for user with caching
   */
  fetchPlants: async (userId: string, forceRefresh = false) => {
    const state = get();
    const now = Date.now();

    // Check cache (5 min TTL)
    if (!forceRefresh && state.lastFetchTime && now - state.lastFetchTime < CACHE_TTL) {
      logger.debug('📦 Plants cache hit (TTL not expired)');
      return;
    }

    try {
      set({ loading: true, error: null });

      const data = await plantRepository.findAll(userId);
      set({
        plants: data,
        lastFetchTime: now,
      });

      logger.info('✅ Plants fetched', { count: data.length });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch plants';
      logger.error('❌ Fetch plants failed:', err);
      set({ error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Add new plant
   */
  addPlant: async (userId: string, data: Partial<Plant>) => {
    try {
      set({ error: null });

      const plantData = {
        user_id: userId,
        nom_commun: data.nom_commun || 'Unknown Plant',
        nom_scientifique: data.nom_scientifique,
        famille: data.famille,
        personnalite: data.personnalite || 'succulente',
        surnom: data.surnom,
        sante_score: data.sante_score || 50,
        level: data.level || 1,
        current_xp: data.current_xp || 0,
        localisation: data.localisation,
        notes: data.notes,
        arrosage_frequence_jours: data.arrosage_frequence_jours || 7,
        lumiere: data.lumiere,
        temperature_min: data.temperature_min,
        temperature_max: data.temperature_max,
        humidite: data.humidite,
        engrais_frequence_jours: data.engrais_frequence_jours || 30,
        last_watered_at: new Date().toISOString(),
        next_watering_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const insertedPlant = await plantRepository.create(plantData);
      if (!insertedPlant) throw new Error('Failed to create plant');

      set(state => ({
        plants: [insertedPlant, ...state.plants],
      }));

      logger.info('✅ Plant added', { name: insertedPlant.nom_commun });
      return insertedPlant;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add plant';
      logger.error('❌ Add plant failed:', err);
      set({ error: errorMsg });
      return null;
    }
  },

  /**
   * Update plant
   */
  updatePlant: async (id: string, data: Partial<Plant>) => {
    try {
      set({ error: null });

      const updatedPlant = await plantRepository.update(id, data);
      if (!updatedPlant) throw new Error('Failed to update plant');

      set(state => ({
        plants: state.plants.map(p => (p.id === id ? updatedPlant : p)),
      }));

      logger.info('✅ Plant updated', { id });
      return updatedPlant;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update plant';
      logger.error('❌ Update plant failed:', err);
      set({ error: errorMsg });
      return null;
    }
  },

  /**
   * Delete plant
   */
  deletePlant: async (id: string) => {
    try {
      set({ error: null });

      const success = await plantRepository.delete(id);
      if (!success) throw new Error('Failed to delete plant');

      set(state => ({
        plants: state.plants.filter(p => p.id !== id),
      }));

      logger.info('✅ Plant deleted', { id });
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete plant';
      logger.error('❌ Delete plant failed:', err);
      set({ error: errorMsg });
      return false;
    }
  },

  /**
   * Water plant using PlantCareService
   */
  waterPlant: async (id: string) => {
    try {
      set({ error: null });

      const result = await plantCareService.waterPlant(id);
      const plant = result.plant;

      set(state => ({
        plants: state.plants.map(p => (p.id === id ? plant : p)),
      }));

      logger.info('✅ Plant watered', { id, xpEarned: result.xpEarned });
      return plant;
    } catch (err) {
      logger.error('❌ Water plant failed:', err);
      return null;
    }
  },

  /**
   * Fertilize plant using PlantCareService
   */
  fertilizePlant: async (id: string) => {
    try {
      set({ error: null });

      const result = await plantCareService.fertilizePlant(id);
      const plant = result.plant;

      set(state => ({
        plants: state.plants.map(p => (p.id === id ? plant : p)),
      }));

      logger.info('✅ Plant fertilized', { id, xpEarned: result.xpEarned });
      return plant;
    } catch (err) {
      logger.error('❌ Fertilize plant failed:', err);
      return null;
    }
  },

  /**
   * Manual refresh (force refetch)
   */
  refresh: async (userId: string) => {
    await get().fetchPlants(userId, true);
  },

  /**
   * Clear all data
   */
  clear: () => {
    set({
      plants: [],
      error: null,
      lastFetchTime: null,
    });
  },
}));
