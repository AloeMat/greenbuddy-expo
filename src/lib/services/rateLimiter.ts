/**
 * Client-Side Rate Limiter — Token Bucket Algorithm
 *
 * Prevents abuse of expensive operations (AI scan, chat, watering spam).
 * Each bucket refills at a steady rate; requests are rejected when empty.
 *
 * Usage:
 *   import { rateLimiter } from '@/lib/services/rateLimiter';
 *   if (!rateLimiter.tryAcquire('gemini-scan')) {
 *     Alert.alert('Trop de requêtes', 'Veuillez patienter avant de réessayer.');
 *     return;
 *   }
 */

import { logger } from './logger';

interface BucketConfig {
  /** Maximum tokens in the bucket */
  maxTokens: number;
  /** Tokens added per second */
  refillRate: number;
}

interface BucketState {
  tokens: number;
  lastRefill: number;
}

/** Pre-configured rate limit profiles for different action types */
const RATE_LIMIT_PROFILES: Record<string, BucketConfig> = {
  /** AI image scan — expensive, 5 per minute */
  'gemini-scan': { maxTokens: 5, refillRate: 5 / 60 },
  /** AI chat message — moderate, 10 per minute */
  'gemini-chat': { maxTokens: 10, refillRate: 10 / 60 },
  /** Plant diagnosis — expensive, 3 per minute */
  'gemini-diagnosis': { maxTokens: 3, refillRate: 3 / 60 },
  /** Plant actions (water, fertilize) — 15 per minute */
  'plant-action': { maxTokens: 15, refillRate: 15 / 60 },
  /** Default fallback — 20 per minute */
  default: { maxTokens: 20, refillRate: 20 / 60 },
} as const;

class RateLimiter {
  private buckets = new Map<string, BucketState>();

  /**
   * Try to consume a token from the named bucket.
   * @returns true if the request is allowed, false if rate-limited.
   */
  tryAcquire(action: string): boolean {
    const config = RATE_LIMIT_PROFILES[action] ?? RATE_LIMIT_PROFILES.default;
    const now = Date.now();

    let bucket = this.buckets.get(action);
    if (!bucket) {
      bucket = { tokens: config.maxTokens, lastRefill: now };
      this.buckets.set(action, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + elapsed * config.refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      logger.warn(`[RateLimiter] Rate limit hit for "${action}"`, {
        tokens: bucket.tokens.toFixed(2),
      });
      return false;
    }

    bucket.tokens -= 1;
    return true;
  }

  /**
   * Get remaining tokens for a given action (for UI display).
   */
  getRemainingTokens(action: string): number {
    const bucket = this.buckets.get(action);
    if (!bucket) {
      const config = RATE_LIMIT_PROFILES[action] ?? RATE_LIMIT_PROFILES.default;
      return config.maxTokens;
    }
    return Math.floor(bucket.tokens);
  }

  /**
   * Reset all buckets (useful for testing or logout).
   */
  reset(): void {
    this.buckets.clear();
  }
}

/** Singleton rate limiter instance */
export const rateLimiter = new RateLimiter();
