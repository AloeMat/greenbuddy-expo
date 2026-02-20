/**
 * Plant Repository - Data Access Layer
 * Handles all Supabase plant operations
 * Isolated from business logic and React
 */

import { supabase } from '@/lib/services/supabase';
import { logger } from '@/lib/services/logger';
import { z } from 'zod';

/**
 * Zod schema for runtime validation of Plant records from Supabase.
 * Ensures data integrity even if the DB shape drifts from the TS type.
 */
const PlantRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  nom_commun: z.string(),
  nom_scientifique: z.string().nullish(),
  famille: z.string().nullish(),
  personnalite: z.string(),
  surnom: z.string().nullish(),
  sante_score: z.number(),
  current_xp: z.number(),
  level: z.number(),
  localisation: z.string().nullish(),
  notes: z.string().nullish(),
  arrosage_frequence_jours: z.number(),
  lumiere: z.string().nullish(),
  temperature_min: z.number().nullish(),
  temperature_max: z.number().nullish(),
  humidite: z.string().nullish(),
  engrais_frequence_jours: z.number().nullish(),
  last_watered_at: z.string().nullish(),
  next_watering_at: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Parse a single Supabase row into a validated Plant, or null on failure */
function parsePlant(raw: unknown): Plant | null {
  const result = PlantRecordSchema.safeParse(raw);
  if (!result.success) {
    logger.warn('[PlantRepository] Invalid plant record from DB', {
      errors: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
    });
    return null;
  }
  // Convert nullish optional fields to match Plant interface (null → undefined)
  const d = result.data;
  return {
    ...d,
    nom_scientifique: d.nom_scientifique ?? undefined,
    famille: d.famille ?? undefined,
    surnom: d.surnom ?? undefined,
    localisation: d.localisation ?? undefined,
    notes: d.notes ?? undefined,
    lumiere: d.lumiere ?? undefined,
    temperature_min: d.temperature_min ?? undefined,
    temperature_max: d.temperature_max ?? undefined,
    humidite: d.humidite ?? undefined,
    engrais_frequence_jours: d.engrais_frequence_jours ?? undefined,
    last_watered_at: d.last_watered_at ?? undefined,
    next_watering_at: d.next_watering_at ?? undefined,
  };
}

export interface Plant {
  id: string;
  user_id: string;
  nom_commun: string;
  nom_scientifique?: string;
  famille?: string;
  personnalite: string;
  surnom?: string;
  sante_score: number;
  current_xp: number;
  level: number;
  localisation?: string;
  notes?: string;
  arrosage_frequence_jours: number;
  lumiere?: string;
  temperature_min?: number;
  temperature_max?: number;
  humidite?: string;
  engrais_frequence_jours?: number;
  last_watered_at?: string;
  next_watering_at?: string;
  created_at: string;
  updated_at: string;
}

export type CreatePlantDto = Partial<Plant>;
export type UpdatePlantDto = Partial<Plant>;

export interface IPlantRepository {
  findAll(userId: string): Promise<Plant[]>;
  findById(id: string): Promise<Plant | null>;
  findUpcomingWaterings(userId: string, days: number): Promise<Plant[]>;
  findUrgentPlants(userId: string): Promise<Plant[]>;
  create(data: CreatePlantDto): Promise<Plant | null>;
  update(id: string, data: UpdatePlantDto): Promise<Plant | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Supabase implementation of Plant Repository
 */
export class SupabasePlantRepository implements IPlantRepository {
  async findAll(userId: string): Promise<Plant[]> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      logger.info('✅ Plants fetched', { count: data?.length || 0 });
      return data || [];
    } catch (err) {
      logger.error('❌ Fetch plants failed:', err);
      throw err;
    }
  }

  async findById(id: string): Promise<Plant | null> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - not an error
          return null;
        }
        throw error;
      }

      return parsePlant(data);
    } catch (err) {
      logger.error('Failed to get plant:', err);
      throw err;
    }
  }

  async findUpcomingWaterings(userId: string, days: number): Promise<Plant[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .lte('next_watering_at', endDate.toISOString())
        .order('next_watering_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      logger.error('Failed to get upcoming waterings:', err);
      throw err;
    }
  }

  async findUrgentPlants(userId: string): Promise<Plant[]> {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .lt('sante_score', 50)
        .order('sante_score', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err) {
      logger.error('Failed to get urgent plants:', err);
      throw err;
    }
  }

  async create(data: CreatePlantDto): Promise<Plant | null> {
    try {
      const plantData = {
        user_id: data.user_id,
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

      const { data: insertedPlant, error } = await supabase
        .from('plants')
        .insert([plantData])
        .select()
        .single();

      if (error) throw error;

      logger.info('✅ Plant added', { name: insertedPlant.nom_commun });
      return parsePlant(insertedPlant);
    } catch (err) {
      logger.error('❌ Add plant failed:', err);
      throw err;
    }
  }

  async update(id: string, data: UpdatePlantDto): Promise<Plant | null> {
    try {
      const { data: updatedPlant, error } = await supabase
        .from('plants')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      logger.info('✅ Plant updated', { id });
      return parsePlant(updatedPlant);
    } catch (err) {
      logger.error('❌ Update plant failed:', err);
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      logger.info('✅ Plant deleted', { id });
      return true;
    } catch (err) {
      logger.error('❌ Delete plant failed:', err);
      throw err;
    }
  }
}

// Factory function for DI
export const createPlantRepository = (): IPlantRepository => {
  return new SupabasePlantRepository();
};
