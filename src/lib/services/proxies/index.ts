/**
 * Service Proxies
 * Implement Proxy Pattern for caching, logging, and cross-cutting concerns
 *
 * Available Proxies:
 * - CachedGeminiProxy: Caches Gemini AI analysis results (-80% API calls)
 * - CachedPlantNetProxy: Caches plant identification results (-50% quota usage)
 */

export { CachedGeminiProxy, createCachedGeminiProxy } from './CachedGeminiProxy';
export { CachedPlantNetProxy, createCachedPlantNetProxy } from './CachedPlantNetProxy';
