/**
 * PlantNet Service for Expo
 * Simplified plant identification using PlantNet API via Supabase proxy
 *
 * Free Tier: 500 requests per day
 * Fallback: Use Gemini if quota exceeded or API fails
 */

import { supabase } from '@/lib/services/supabase';
import { logger } from '@/lib/services/logger';

export interface PlantIdentificationResult {
  commonName: string;
  scientificName: string;
  genus: string;
  family: string;
  confidence: number; // 0-100
  description: string;
  source: 'plantnet' | 'gemini' | 'cache';
}

/**
 * Interface for PlantNet Service - enables DI and mocking
 */
export interface IPlantNetService {
  identifyPlant(base64Image: string): Promise<PlantIdentificationResult>;
  identifyPlantByName(plantName: string): Promise<PlantIdentificationResult>;
}

class PlantNetService implements IPlantNetService {
  private readonly PLANTNET_API = 'https://my-api.plantnet.org/v2/identify/all';
  private readonly FREE_QUOTA = 500;
  private readonly CACHE_KEY_PREFIX = 'plantnet_cache_';

  /**
   * Identify plant by name using Gemini (for manual "Je connais le nom" flow)
   * Looks up plant information based on common or scientific name
   */
  async identifyPlantByName(plantName: string): Promise<PlantIdentificationResult> {
    try {
      logger.info('🌿 Identifying plant by name...', { plantName });

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          prompt: `Find information about a plant with this name: "${plantName}".
          Return accurate plant data in JSON format with EXACTLY these fields:
          {
            "commonName": "common name in English",
            "scientificName": "Scientific name (Genus species)",
            "genus": "Genus",
            "family": "Plant family",
            "confidence": 85,
            "description": "Brief description of this plant"
          }
          Make sure the JSON is valid and parseable.`,
          type: 'text_analysis'
        }
      });

      if (error || !data) {
        logger.warn('⚠️ Plant name lookup failed:', error);
        return this.createResultFromName(plantName);
      }

      try {
        const result = typeof data === 'string' ? JSON.parse(data) : data;

        return {
          commonName: result.commonName || plantName,
          scientificName: result.scientificName || 'Unknown sp.',
          genus: result.genus || 'Unknown',
          family: result.family || 'Unknown',
          confidence: result.confidence || 75,
          description: result.description || `A plant species: ${plantName}`,
          source: 'gemini'
        };
      } catch (parseError) {
        logger.warn('⚠️ Failed to parse Gemini response, using plant name as fallback', { error: String(parseError) });
        return this.createResultFromName(plantName);
      }

    } catch (error) {
      if (error instanceof Error) {
        logger.error('❌ Plant name identification failed', { message: error.message });
      } else {
        logger.error('❌ Plant name identification failed', { error: String(error) });
      }
      return this.createResultFromName(plantName);
    }
  }

  /**
   * Identify plant from image using PlantNet API
   * Falls back to Gemini if quota exceeded or API fails
   */
  async identifyPlant(base64Image: string): Promise<PlantIdentificationResult> {
    try {
      logger.info('🌿 Starting plant identification...');

      // 1. Try PlantNet first (fast, accurate)
      const plantNetResult = await this.tryPlantNetIdentification(base64Image);

      if (plantNetResult) {
        logger.info('✅ Plant identified via PlantNet', {
          name: plantNetResult.commonName,
          confidence: plantNetResult.confidence
        });
        return plantNetResult;
      }

      // 2. Fallback to Gemini if PlantNet fails
      logger.info('⚠️ PlantNet failed, falling back to Gemini...');
      return await this.identifyViaGemini(base64Image);

    } catch (error) {
      logger.error('❌ Plant identification failed:', error);
      // Last resort: return a placeholder result
      return {
        commonName: 'Unknown Plant',
        scientificName: 'Unknown sp.',
        genus: 'Unknown',
        family: 'Unknown',
        confidence: 0,
        description: 'Unable to identify plant. Please try again.',
        source: 'cache'
      };
    }
  }

  /**
   * Call PlantNet API via Supabase Edge Function (to avoid CORS)
   */
  private async tryPlantNetIdentification(base64Image: string): Promise<PlantIdentificationResult | null> {
    try {
      logger.info('📸 Calling PlantNet API via proxy...');

      // Call Supabase Edge Function that handles PlantNet API
      // The proxy expects JSON { image_base64, content_type }
      const { data, error } = await supabase.functions.invoke('plantnet-proxy', {
        body: {
          image_base64: base64Image,
          content_type: 'image/jpeg'
        }
      });

      if (error) {
        logger.warn('⚠️ PlantNet API error:', error);
        return null;
      }

      if (!data || !data.results || data.results.length === 0) {
        logger.info('ℹ️ No plant identification results found');
        return null;
      }

      // Get the best result (first one = highest confidence)
      const bestResult = data.results[0];

      const result: PlantIdentificationResult = {
        commonName: bestResult.species?.commonNames?.[0] || 'Unknown',
        scientificName: bestResult.species?.scientificName || 'Unknown sp.',
        genus: bestResult.species?.genus?.scientificName || 'Unknown',
        family: bestResult.species?.family?.scientificName || 'Unknown',
        confidence: Math.round((bestResult.score || 0) * 100),
        description: `A plant from the ${bestResult.species?.family?.scientificName || 'Unknown'} family`,
        source: 'plantnet'
      };

      // Cache the result
      await this.cacheResult(base64Image, result);

      return result;

    } catch (error) {
      if (error instanceof Error) {
        logger.warn('⚠️ PlantNet identification failed', { message: error.message });
      } else {
        logger.warn('⚠️ PlantNet identification failed', { error: String(error) });
      }
      return null;
    }
  }

  /**
   * Fallback identification using Gemini
   * Requires gemini-proxy Edge Function
   */
  private async identifyViaGemini(base64Image: string): Promise<PlantIdentificationResult> {
    try {
      logger.info('🤖 Identifying via Gemini (fallback)...');

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          prompt: `Identify this plant image. Provide in JSON format:
          {
            "commonName": "...",
            "scientificName": "...",
            "genus": "...",
            "family": "...",
            "confidence": 75,
            "description": "..."
          }`,
          image: base64Image,
          type: 'image_identification'
        }
      });

      if (error || !data) {
        logger.warn('⚠️ Gemini identification failed:', error);
        return this.getDefaultResult();
      }

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      return {
        commonName: result.commonName || 'Unknown',
        scientificName: result.scientificName || 'Unknown sp.',
        genus: result.genus || 'Unknown',
        family: result.family || 'Unknown',
        confidence: result.confidence || 50,
        description: result.description || 'Plant identified by AI analysis',
        source: 'gemini'
      };

    } catch (error) {
      if (error instanceof Error) {
        logger.error('❌ Gemini identification failed', { message: error.message });
      } else {
        logger.error('❌ Gemini identification failed', { error: String(error) });
      }
      return this.getDefaultResult();
    }
  }

  /**
   * Check quota remaining for PlantNet
   * Silent fail for unauthenticated users
   */
  async checkQuotaRemaining(): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('plantnet_quota')
        .select('requests_used')
        .eq('date', today)
        .maybeSingle();

      if (error) {
        logger.debug('ℹ️ Quota check unavailable (unauthenticated), assuming full quota');
        return this.FREE_QUOTA;
      }

      if (!data) {
        return this.FREE_QUOTA;
      }

      const remaining = Math.max(0, this.FREE_QUOTA - (data.requests_used || 0));
      logger.info(`📊 PlantNet quota remaining: ${remaining}/${this.FREE_QUOTA}`);
      return remaining;

    } catch (error) {
      logger.debug('ℹ️ Quota check failed, assuming available', { error: String(error) });
      return this.FREE_QUOTA;
    }
  }

  /**
   * Cache identification result locally
   */
  private async cacheResult(base64Image: string, result: PlantIdentificationResult): Promise<void> {
    try {
      // Simple cache using timestamp-based key
      const cacheKey = `${this.CACHE_KEY_PREFIX}${Date.now()}`;

      // In a real app, you'd use AsyncStorage or SQLite
      // For now, just log that we would cache
      logger.debug('💾 Caching plant identification result', {
        plant: result.commonName,
        cacheKey
      });

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('⚠️ Failed to cache result:', { message: err.message });
      // Non-critical, continue anyway
    }
  }

  /**
   * Create a result from plant name when identification fails
   * Used as fallback for identifyPlantByName
   */
  private createResultFromName(plantName: string): PlantIdentificationResult {
    return {
      commonName: plantName,
      scientificName: `${plantName} sp.`,
      genus: plantName.split(/\s+/)[0], // Use first word as genus guess
      family: 'Unknown',
      confidence: 50,
      description: `Plant: ${plantName}. Please provide more details for accurate identification.`,
      source: 'cache'
    };
  }

  /**
   * Get default result when all methods fail
   */
  private getDefaultResult(): PlantIdentificationResult {
    return {
      commonName: 'Unknown Plant',
      scientificName: 'Unknown sp.',
      genus: 'Unknown',
      family: 'Unknown',
      confidence: 0,
      description: 'Unable to identify plant. Try again with a clearer photo.',
      source: 'cache'
    };
  }
}

/**
 * Factory function for creating PlantNet service instances
 * @param useCache - Enable caching (default: true)
 * Returns either cached proxy or raw service
 */
export const createPlantNetService = (useCache: boolean = true): IPlantNetService => {
  const rawService = new PlantNetService();

  if (useCache) {
    // Import here to avoid circular dependencies
    const { createCachedPlantNetProxy } = require('@lib/services/proxies');
    return createCachedPlantNetProxy(rawService);
  }

  return rawService;
};

/**
 * Default singleton instance
 * Uses caching by default to reduce API quota usage
 * Can be replaced with factory in tests: createPlantNetService(false)
 */
export const plantNetService = createPlantNetService(true);
