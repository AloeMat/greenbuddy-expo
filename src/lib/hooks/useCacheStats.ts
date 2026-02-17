/**
 * Hook pour surveiller les statistiques du cache
 * Useful for debugging and monitoring cache effectiveness
 */

import { useCallback, useEffect, useState } from 'react';
import { geminiService } from '@/lib/services/gemini';
import { plantNetService } from '@/features/plants/services/plantnet';
import { CachedGeminiProxy } from '@/lib/services/proxies/CachedGeminiProxy';
import { CachedPlantNetProxy } from '@/lib/services/proxies/CachedPlantNetProxy';

export interface CacheStatsSnapshot {
  gemini: {
    hits: number;
    misses: number;
    hitRate: number;
    entriesCount: number;
    totalSize: string;
    summary: string;
  } | null;
  plantnet: {
    hits: number;
    misses: number;
    hitRate: number;
    entriesCount: number;
    totalSize: string;
    quotaSavedDaily: number;
    summary: string;
  } | null;
}

/**
 * Get current cache statistics from both services
 */
export const useCacheStats = (autoRefresh: number = 0) => {
  const [stats, setStats] = useState<CacheStatsSnapshot>({
    gemini: null,
    plantnet: null
  });

  const getStats = useCallback(() => {
    const newStats: CacheStatsSnapshot = {
      gemini: null,
      plantnet: null
    };

    // Get Gemini stats if it's a cached proxy
    if (geminiService instanceof CachedGeminiProxy) {
      const geminStats = geminiService.getStats();
      newStats.gemini = {
        ...geminStats,
        summary: geminiService.getCacheSummary()
      };
    }

    // Get PlantNet stats if it's a cached proxy
    if (plantNetService instanceof CachedPlantNetProxy) {
      const plantnetStats = plantNetService.getStats();
      newStats.plantnet = {
        ...plantnetStats,
        summary: plantNetService.getCacheSummary()
      };
    }

    setStats(newStats);
  }, []);

  // Auto-refresh if interval specified
  useEffect(() => {
    getStats();

    if (autoRefresh > 0) {
      const interval = setInterval(getStats, autoRefresh);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, getStats]);

  return {
    stats,
    refresh: getStats,
    geminiCacheHitRate: stats.gemini?.hitRate ?? 0,
    plantnetCacheHitRate: stats.plantnet?.hitRate ?? 0,
    totalCacheEntries: (stats.gemini?.entriesCount ?? 0) + (stats.plantnet?.entriesCount ?? 0)
  };
};

/**
 * Hook to clear cache for a specific service
 */
export const useClearCache = () => {
  const [isClearing, setIsClearing] = useState(false);

  const clearGeminiCache = useCallback(async () => {
    if (geminiService instanceof CachedGeminiProxy) {
      setIsClearing(true);
      try {
        await geminiService.clearCache();
      } finally {
        setIsClearing(false);
      }
    }
  }, []);

  const clearPlantNetCache = useCallback(async () => {
    if (plantNetService instanceof CachedPlantNetProxy) {
      setIsClearing(true);
      try {
        await plantNetService.clearCache();
      } finally {
        setIsClearing(false);
      }
    }
  }, []);

  const clearAllCache = useCallback(async () => {
    setIsClearing(true);
    try {
      await Promise.all([
        geminiService instanceof CachedGeminiProxy ? geminiService.clearCache() : Promise.resolve(),
        plantNetService instanceof CachedPlantNetProxy ? plantNetService.clearCache() : Promise.resolve()
      ]);
    } finally {
      setIsClearing(false);
    }
  }, []);

  return {
    isClearing,
    clearGeminiCache,
    clearPlantNetCache,
    clearAllCache
  };
};
