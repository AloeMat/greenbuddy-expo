/**
 * usePlants Hook
 * React hook wrapper around Zustand plantsStore
 * Provides backward compatibility while using global state management
 */

import { useEffect } from 'react';
import { supabase } from '@/lib/services/supabase';
import { logger } from '@/lib/services/logger';
import { usePlantsStore } from '@/features/plants/store/plantsStore';
// Re-export Plant type for consumers (e.g., useWateringReminders)
export type { Plant } from '@/features/plants/repositories/PlantRepository';
import type { Plant } from '@/features/plants/repositories/PlantRepository';

export interface UsePlantsReturn {
  // State
  plants: Plant[];
  loading: boolean;
  error: string | null;

  // Queries
  getPlant: (id: string) => Plant | undefined;
  getUpcomingWaterings: () => Plant[];
  getUrgentPlants: () => Plant[];

  // Mutations
  addPlant: (data: Partial<Plant>) => Promise<Plant | null>;
  updatePlant: (id: string, data: Partial<Plant>) => Promise<Plant | null>;
  deletePlant: (id: string) => Promise<boolean>;
  waterPlant: (id: string) => Promise<Plant | null>;
  fertilizePlant: (id: string) => Promise<Plant | null>;

  // Utilities
  refresh: () => Promise<void>;
  clear: () => void;
}

/**
 * Hook wrapper around plantsStore for backward compatibility
 * Automatically fetches user ID and initializes store on mount
 */
export const usePlants = (): UsePlantsReturn => {
  // Get store state and actions
  const store = usePlantsStore();

  // Get current user and fetch plants on mount
  useEffect(() => {
    const initializePlants = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await store.fetchPlants(data.user.id);
        }
      } catch (err) {
        logger.error('Failed to initialize plants:', err);
      }
    };

    initializePlants();
  }, [store]);

  return {
    plants: store.plants,
    loading: store.loading,
    error: store.error,
    getPlant: store.getPlant,
    getUpcomingWaterings: store.getUpcomingWaterings,
    getUrgentPlants: store.getUrgentPlants,
    addPlant: async (data: Partial<Plant>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        logger.error('Cannot add plant: No user ID');
        return null;
      }
      return store.addPlant(user.user.id, data);
    },
    updatePlant: store.updatePlant,
    deletePlant: store.deletePlant,
    waterPlant: store.waterPlant,
    fertilizePlant: store.fertilizePlant,
    refresh: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await store.refresh(user.user.id);
      }
    },
    clear: store.clear,
  };
};
