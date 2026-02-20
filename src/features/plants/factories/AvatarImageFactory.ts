/**
 * Avatar Image Factory - Flyweight Pattern Implementation
 * Shares avatar image instances across the app to reduce memory usage
 *
 * Problem: 100+ plants × 5 avatar personalities = potential for 100 image instances
 * Solution: Share 5 image instances across all plants
 *
 * Benefits:
 * - Memory savings: -95% (10 MB → 500 KB)
 * - Faster app startup: Images preloaded once
 * - Consistent visuals: All plants with same personality use same image
 * - Cache friendly: Reusing loaded images
 *
 * Memory Impact:
 * - Without Flyweight: 100 plants × 100KB/image = 10 MB
 * - With Flyweight: 5 personalities × 100KB = 500 KB
 * - Savings: -9.5 MB (-95%)
 */

import { Image, ImageSourcePropType } from 'react-native';
import { logger } from '@/lib/services/logger';
import { PlantPersonality } from '@/types';
import { avatarImages } from '@/lib/assets';

/**
 * Flyweight: Shared avatar image instance
 * Contains both the image and metadata about the personality
 */
export interface AvatarImage {
  personality: PlantPersonality;
  source: ImageSourcePropType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Statistics about factory usage
 */
export interface AvatarFactoryStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  poolSize: number;
  preloadedCount: number;
  failedPreloads: number;
}

/**
 * Avatar Image Factory - Singleton pattern
 * Manages a pool of shared avatar images
 * All plants with same personality share the same image instance
 */
export class AvatarImageFactory {
  private static instance: AvatarImageFactory;
  private readonly avatarPool: Map<PlantPersonality, AvatarImage> = new Map();
  private readonly preloadedImages: Map<PlantPersonality, boolean> = new Map();
  private readonly stats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    preloadedCount: 0,
    failedPreloads: 0
  };

  /**
   * Private constructor - prevents multiple instances
   * Initialize with all avatar images
   */
  private constructor() {
    this.initializeAvatarPool();
    logger.info('🎨 AvatarImageFactory initialized (singleton)', {
      avatarsLoaded: this.avatarPool.size
    });
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AvatarImageFactory {
    if (!AvatarImageFactory.instance) {
      AvatarImageFactory.instance = new AvatarImageFactory();
    }
    return AvatarImageFactory.instance;
  }

  /**
   * Initialize avatar pool with all personalities
   * Maps each personality to its image and metadata
   */
  private initializeAvatarPool(): void {
    // Personality 1: Succulente (hardy, low-maintenance)
    this.avatarPool.set('succulente', {
      personality: 'succulente',
      source: avatarImages.succulente,
      name: 'Succulent',
      description: 'Resilient and hardy',
      colors: { primary: '#A8D5BA', secondary: '#98C9A3', accent: '#7CB89F' }
    });

    // Personality 2: Orchidee (elegant, delicate)
    this.avatarPool.set('orchidee', {
      personality: 'orchidee',
      source: avatarImages.orchidee,
      name: 'Orchid',
      description: 'Elegant and refined',
      colors: { primary: '#FF6B6B', secondary: '#FFD93D', accent: '#FF8C42' }
    });

    // Personality 3: Monstera (bold, striking)
    this.avatarPool.set('monstera', {
      personality: 'monstera',
      source: avatarImages.monstera,
      name: 'Monstera',
      description: 'Bold and dramatic',
      colors: { primary: '#B3E5FC', secondary: '#81D4FA', accent: '#4DD0E1' }
    });

    // Personality 4: Fougere (delicate, feathery)
    this.avatarPool.set('fougere', {
      personality: 'fougere',
      source: avatarImages.fougere,
      name: 'Fern',
      description: 'Delicate and graceful',
      colors: { primary: '#C8E6C9', secondary: '#A5D6A7', accent: '#81C784' }
    });

    // Personality 5: Carnivore (exotic, unique)
    this.avatarPool.set('carnivore', {
      personality: 'carnivore',
      source: avatarImages.carnivore,
      name: 'Carnivore',
      description: 'Exotic and fascinating',
      colors: { primary: '#80DEEA', secondary: '#4DD0E1', accent: '#26C6DA' }
    });

    logger.info('✅ Avatar pool initialized', {
      personalities: Array.from(this.avatarPool.keys()),
      totalImages: this.avatarPool.size
    });
  }

  /**
   * Get avatar for a personality
   * Returns the shared instance (Flyweight)
   * All plants with same personality get the same image object
   */
  getAvatar(personality: PlantPersonality): AvatarImage {
    this.stats.totalRequests++;

    const avatar = this.avatarPool.get(personality);

    if (!avatar) {
      this.stats.cacheMisses++;
      logger.warn('⚠️ Avatar not found, returning default', { personality });

      // Fallback to succulente (always exists)
      const fallback = this.avatarPool.get('succulente');
      if (!fallback) {
        throw new Error('Default avatar (succulente) not found in pool');
      }
      return fallback;
    }

    this.stats.cacheHits++;
    return avatar;
  }

  /**
   * Get all avatars (for gallery, selector UI)
   */
  getAllAvatars(): AvatarImage[] {
    return Array.from(this.avatarPool.values());
  }

  /**
   * Get avatar by index (for cycling)
   */
  getAvatarByIndex(index: number): AvatarImage {
    const avatars = Array.from(this.avatarPool.values());
    const safeIndex = index % avatars.length;
    return avatars[safeIndex];
  }

  /**
   * Preload avatar images for faster rendering
   * Call this in app initialization to warm up the cache
   */
  async preloadAvatarImages(): Promise<void> {
    const personalities = Array.from(this.avatarPool.keys());

    logger.info('📦 Preloading avatar images...', {
      count: personalities.length
    });

    const preloadPromises = personalities.map(async (personality) => {
      try {
        const avatar = this.avatarPool.get(personality);
        if (!avatar) return;
        await Image.prefetch(this.resolveImageUri(avatar.source));
        this.preloadedImages.set(personality, true);
        this.stats.preloadedCount++;

        logger.debug(`✅ Preloaded ${personality} avatar`);
      } catch (error: unknown) {
        this.stats.failedPreloads++;
        logger.warn(`⚠️ Failed to preload ${personality} avatar`, { error: String(error) });
      }
    });

    await Promise.all(preloadPromises);

    logger.info('✅ Avatar preloading complete', {
      preloaded: this.stats.preloadedCount,
      failed: this.stats.failedPreloads
    });
  }

  /**
   * Resolve image URI from source
   */
  private resolveImageUri(source: ImageSourcePropType): string {
    if (typeof source === 'number') {
      // Local image
      return Image.resolveAssetSource(source).uri;
    }
    // Remote image or array
    const src = Array.isArray(source) ? source[0] : source;
    return src.uri || '';
  }

  /**
   * Get factory statistics
   * Useful for monitoring Flyweight effectiveness
   */
  getStats(): AvatarFactoryStats {
    const totalRequests = this.stats.totalRequests;
    const hitRate = totalRequests > 0
      ? ((this.stats.cacheHits / totalRequests) * 100).toFixed(1)
      : '0';

    return {
      totalRequests: this.stats.totalRequests,
      cacheHits: this.stats.cacheHits,
      cacheMisses: this.stats.cacheMisses,
      hitRate: Number.parseFloat(hitRate),
      poolSize: this.avatarPool.size,
      preloadedCount: this.stats.preloadedCount,
      failedPreloads: this.stats.failedPreloads
    };
  }

  /**
   * Get memory savings estimate
   * Compares with and without Flyweight pattern
   */
  getMemorySavingsEstimate(totalPlants: number = 100): {
    withoutFlyweight: string;
    withFlyweight: string;
    savings: string;
    savingsPercent: string;
  } {
    // Assume each avatar image is ~100KB
    const avatarSizeKb = 100;
    const poolSize = this.avatarPool.size;

    const withoutFlyweight = (totalPlants * avatarSizeKb) / 1024; // MB
    const withFlyweight = (poolSize * avatarSizeKb) / 1024; // MB
    const savings = withoutFlyweight - withFlyweight;
    const savingsPercent = ((savings / withoutFlyweight) * 100).toFixed(1);

    return {
      withoutFlyweight: `${withoutFlyweight.toFixed(2)} MB`,
      withFlyweight: `${withFlyweight.toFixed(2)} MB`,
      savings: `${savings.toFixed(2)} MB`,
      savingsPercent: `${savingsPercent}%`
    };
  }

  /**
   * Get summary for logging
   */
  getSummary(): string {
    const stats = this.getStats();
    return `Requests: ${stats.totalRequests}, HitRate: ${stats.hitRate}%, Preloaded: ${stats.preloadedCount}/${stats.poolSize}`;
  }
}

/**
 * Singleton instance exported for convenience
 * Use: avatarFactory.getAvatar('succulente')
 */
export const avatarFactory = AvatarImageFactory.getInstance();

/**
 * Factory function for dependency injection
 * Allows testing with mock factory
 */
export const createAvatarImageFactory = (): AvatarImageFactory => {
  return AvatarImageFactory.getInstance();
};
