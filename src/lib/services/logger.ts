/**
 * Production-Safe Logging Service for React Native
 * Remplace console.log par Sentry en production
 *
 * Usage:
 *   import { logger } from './services/logger';
 *   logger.debug('Message de debug');
 *   logger.info('Info importante');
 *   logger.warn('Avertissement');
 *   logger.error('Erreur', error, { context });
 *
 * OPTIMIZATION: Sentry is conditionally imported
 * - Development: Not imported (saves ~300KB in dev bundle)
 * - Production: Imported and active
 */

/** Minimal Sentry interface for conditional import */
interface SentryLike {
  addBreadcrumb(breadcrumb: { message: string; level: string; data?: Record<string, unknown>; timestamp?: number }): void;
  captureMessage(message: string, options: { level: string; contexts?: Record<string, unknown>; tags?: Record<string, string> }): void;
  captureException(error: Error, options?: { contexts?: Record<string, unknown>; tags?: Record<string, string> }): void;
}

// Conditional Sentry import (optimization: -300KB dev bundle)
// Only load Sentry in production to reduce dev bundle size
let Sentry: SentryLike | null = null;
if (typeof __DEV__ !== 'undefined' && !__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require('@sentry/react-native') as SentryLike;
}

const isDev = typeof __DEV__ === 'undefined' ? true : __DEV__;
const isProd = typeof __DEV__ === 'undefined' ? false : !__DEV__;

/**
 * Converts an unknown error to a proper Error instance, or undefined if not provided
 */
function formatUnknownError(err: unknown): Error | undefined {
  if (err === undefined || err === null) return undefined;
  if (err instanceof Error) return err;
  if (typeof err === 'string') return new Error(err);
  if (typeof err === 'object') return new Error(JSON.stringify(err));
  return new Error(`Unknown error: ${typeof err}`);
}

/**
 * Service de logging sécurisé pour la production
 * - En développement : affiche dans la console
 * - En production : envoie à Sentry uniquement
 */
export const logger = {
  /**
   * Messages de debug (développement uniquement)
   * Ne sont PAS envoyés à Sentry en production
   */
  debug: (message: string, context?: Record<string, unknown>) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, context);
    }
    // Pas de Sentry pour debug (éviter le spam)
  },

  /**
   * Messages informatifs
   * Envoyés comme breadcrumb à Sentry
   */
  info: (message: string, context?: Record<string, unknown>) => {
    if (isDev) {
      console.log(`ℹ️ [INFO] ${message}`, context ? JSON.stringify(context).substring(0, 100) : '');
    }

    if (isProd && Sentry) {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: context,
        timestamp: Date.now() / 1000,
      });
    }
  },

  /**
   * Avertissements
   * Envoyés à Sentry avec niveau warning
   */
  warn: (message: string, context?: Record<string, unknown>) => {
    if (isDev) {
      console.warn(`⚠️ [WARN] ${message}`, context ? JSON.stringify(context).substring(0, 100) : '');
    }

    if (isProd && Sentry) {
      Sentry.captureMessage(message, {
        level: 'warning',
        contexts: { custom: context },
        tags: {
          environment: 'production',
        },
      });
    }
  },

  /**
   * Format unknown error to Error type
   * Used in catch blocks where error is unknown
   */
  formatError: (err: unknown): Error => {
    if (err instanceof Error) return err;
    if (typeof err === 'string') return new Error(err);
    if (typeof err === 'object' && err !== null) {
      return new Error(JSON.stringify(err));
    }
    return new Error('Unknown error occurred');
  },

  /**
   * Erreurs
   * Envoyées à Sentry avec niveau error
   * Accepts Error or unknown types (from catch blocks)
   */
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    // Format error to proper Error type
    const formattedError = formatUnknownError(error);

    if (isDev) {
      console.error(`❌ [ERROR] ${message}`, formattedError, context ? JSON.stringify(context).substring(0, 100) : '');
    }

    if (isProd && Sentry) {
      if (formattedError) {
        Sentry.captureException(formattedError, {
          contexts: {
            custom: {
              message,
              ...context,
            },
          },
          tags: {
            environment: 'production',
          },
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          contexts: { custom: context },
          tags: {
            environment: 'production',
          },
        });
      }
    }
  },

  /**
   * Logger spécifique pour les opérations critiques
   * (authentification, paiements, etc.)
   */
  critical: (message: string, context?: Record<string, unknown>) => {
    if (isDev) {
      console.error(`🔴 [CRITICAL] ${message}`, context ? JSON.stringify(context).substring(0, 100) : '');
    }

    // Toujours envoyer à Sentry en production
    if (Sentry) {
      Sentry.captureMessage(message, {
        level: 'fatal',
        contexts: { custom: context },
        tags: {
          environment: isDev ? 'development' : 'production',
          critical: 'true',
        },
      });
    }
  },
};

export default logger;
