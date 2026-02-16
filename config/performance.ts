/**
 * Performance Configuration
 * Centralized settings for optimization and monitoring
 */

export const PERFORMANCE_CONFIG = {
  // Monitoring
  monitoring: {
    enablePerformanceTracking: true,
    logScreenLoadTimes: true,
    logMemoryUsage: true,
    logFrameRates: false, // Disable in production (impacts performance)
  },

  // Animation
  animation: {
    reduceMotionEnabled: false, // Respect accessibility settings
    enableGPUAcceleration: true,
    maxParticles: 30, // Reduced from 60 for performance
    targetFPS: 60,
  },

  // Image Optimization
  image: {
    autoOptimize: true,
    maxWidth: 2048,
    maxHeight: 2048,
    compressionQuality: 0.8,
    cacheSize: 50 * 1024 * 1024, // 50MB
  },

  // Network
  network: {
    requestTimeout: 10000, // 10s
    retryAttempts: 3,
    cacheResponses: true,
  },

  // Memory
  memory: {
    maxMemoryMB: 150,
    enableMemoryProfiling: false, // Dev only
    clearCacheOnLowMemory: true,
  },

  // Bundle
  bundle: {
    enableCodeSplitting: true,
    enableTreeShaking: true,
    minifyCode: true,
  },
};

/**
 * Get performance config based on environment
 */
export function getPerformanceConfig() {
  const isDev = __DEV__;

  if (isDev) {
    return {
      ...PERFORMANCE_CONFIG,
      monitoring: {
        ...PERFORMANCE_CONFIG.monitoring,
        logMemoryUsage: true,
      },
      memory: {
        ...PERFORMANCE_CONFIG.memory,
        enableMemoryProfiling: true,
      },
    };
  }

  return PERFORMANCE_CONFIG;
}
