/**
 * Sentry Error Monitoring Service for React Native
 * Captures and reports errors to Sentry for monitoring and debugging
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { logger } from '@/lib/services/logger';

/**
 * Initialize Sentry error monitoring
 * Should be called in app/_layout.tsx before app renders
 */
export function initializeSentry(): void {
  const dsn = Constants.expoConfig?.extra?.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN;

  // Skip if no DSN is configured (local development)
  if (!dsn) {
    logger.debug('[Sentry] No DSN configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    // Note: ReactNativeTracing may not be available in all Sentry RN versions
    // integrations: [
    //   new Sentry.ReactNativeTracing({
    //     enableNativeFramesTracking: true,
    //     tracingOrigins: ['localhost', /^\//],
    //   }),
    // ],

    // Tracing
    tracesSampleRate: __DEV__ ? 1 : 0.1,

    // Ignore certain errors
    ignoreErrors: [
      // Network errors that are expected
      'Network request failed',
      'XMLHttpRequest',

      // Redux
      'redux',
    ],

    // Capture breadcrumbs
    maxBreadcrumbs: 50,

    // Attach stack trace to all messages
    attachStacktrace: true,
  });

  logger.debug('[Sentry] Error monitoring initialized');
}

/**
 * Capture an exception manually
 * @param error - The error to capture
 * @param context - Additional context information
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * Capture a message
 * @param message - The message to capture
 * @param level - Severity level (fatal, error, warning, info, debug)
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error reporting
 * @param userId - User ID or null to clear
 * @param email - User email (optional)
 * @param username - Username (optional)
 */
export function setUserContext(userId?: string | null, email?: string, username?: string): void {
  if (userId) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for tracing user actions
 * @param message - Breadcrumb message
 * @param category - Category (e.g., 'user-action', 'api-call')
 * @param data - Additional data to attach
 */
export function addBreadcrumb(message: string, category: string = 'custom', data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Wrap an async function with error tracking
 * @param fn - Async function to wrap
 * @param operationName - Name of the operation
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    addBreadcrumb(`Starting ${operationName}`, 'operation');
    const result = await fn();
    addBreadcrumb(`Completed ${operationName}`, 'operation');
    return result;
  } catch (error) {
    captureException(
      error instanceof Error ? error : new Error(String(error)),
      { operation: operationName }
    );
    throw error;
  }
}
