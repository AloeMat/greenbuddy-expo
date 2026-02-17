/**
 * Daily Notification Hook
 * Manages scheduling and state of daily check-in notifications
 */

import { useEffect, useState } from 'react';
import { logger } from '@/lib/services/logger';
import {
  scheduleDailyCheckInNotification,
  cancelDailyCheckInNotification,
  isDailyNotificationScheduled,
  rescheduleDailyNotification,
  addNotificationResponseListener,
  getPendingNotifications,
} from '@/features/gamification/services/dailyNotificationService';

interface DailyNotificationState {
  isScheduled: boolean;
  isLoading: boolean;
  notificationTime: string;
  error: Error | null;
}

/**
 * Hook to manage daily check-in notifications
 */
export function useDailyNotification() {
  const [state, setState] = useState<DailyNotificationState>({
    isScheduled: false,
    isLoading: true,
    notificationTime: '10:00',
    error: null,
  });

  /**
   * Initialize notification status on mount
   */
  useEffect(() => {
    initializeNotifications();

    // Add listener for notification responses (when user taps notification)
    const unsubscribe = addNotificationResponseListener((response) => {
      logger.debug('📲 Notification response:', response);
      // User tapped notification - navigate to check-in
      if (response.notification.request.content.data?.type === 'daily_checkin') {
        logger.debug('🔥 User tapped daily check-in notification');
        // Navigation will be handled by app router
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Check notification status on mount
   */
  const initializeNotifications = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const isScheduled = await isDailyNotificationScheduled();
      setState((prev) => ({
        ...prev,
        isScheduled,
        isLoading: false,
      }));
      logger.info(`✅ Notification initialized: ${isScheduled}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      logger.error('❌ Failed to initialize notifications:', err);
    }
  };

  /**
   * Enable daily notifications
   */
  const enableNotifications = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await scheduleDailyCheckInNotification();
      setState((prev) => ({
        ...prev,
        isScheduled: true,
        isLoading: false,
        error: null,
      }));
      logger.info('✅ Daily notifications enabled');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      logger.error('❌ Failed to enable notifications:', err);
    }
  };

  /**
   * Disable daily notifications
   */
  const disableNotifications = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await cancelDailyCheckInNotification();
      setState((prev) => ({
        ...prev,
        isScheduled: false,
        isLoading: false,
        error: null,
      }));
      logger.info('✅ Daily notifications disabled');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      logger.error('❌ Failed to disable notifications:', err);
    }
  };

  /**
   * Toggle notifications on/off
   */
  const toggleNotifications = async () => {
    if (state.isScheduled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  /**
   * Change notification time
   */
  const changeNotificationTime = async (hour: number) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      // Call with undefined as setup (optional parameter) and hour as second parameter
      await rescheduleDailyNotification(undefined, hour);
      setState((prev) => ({
        ...prev,
        notificationTime: `${hour}:00`,
        isLoading: false,
        error: null,
      }));
      logger.info(`✅ Notification time changed to ${hour}:00`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState((prev) => ({
        ...prev,
        error: err,
        isLoading: false,
      }));
      logger.error('❌ Failed to change notification time:', err);
    }
  };

  /**
   * Get pending notifications (for debugging)
   */
  const getPending = async () => {
    try {
      const pending = await getPendingNotifications();
      logger.info(`📋 Pending notifications: ${pending.length}`);
      return pending;
    } catch (error) {
      logger.error('❌ Failed to get pending notifications:', error);
      return [];
    }
  };

  return {
    ...state,
    enableNotifications,
    disableNotifications,
    toggleNotifications,
    changeNotificationTime,
    getPending,
  };
}
