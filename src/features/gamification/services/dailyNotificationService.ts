/**
 * Daily Check-In Notification Service
 * Manages scheduling and management of daily check-in reminders
 * Uses expo-notifications to trigger at customizable times
 * Integrates with PersonalizationService for user preferences
 *
 * Phase 4.2: Human Design Integration
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalizationService } from './personalizationService';
import type { HumanDesignSetup } from '@/types/humanDesign';
import { logger } from '@/lib/services/logger';

const NOTIFICATION_KEY = 'dailyCheckInNotificationId';
const NOTIFICATION_TIME_KEY = 'dailyNotificationTime';

/**
 * Schedule daily notification at customizable time
 * Automatically cancels previous notification if exists
 * @param setup - Optional human design setup for personalization
 * @param hour - Hour to schedule notification (0-23, default 10 AM)
 */
export async function scheduleDailyCheckInNotification(
  setup?: HumanDesignSetup,
  hour: number = 10
): Promise<string> {
  try {
    // Cancel previous notification if exists
    const previousId = await AsyncStorage.getItem(NOTIFICATION_KEY);
    if (previousId) {
      await Notifications.cancelScheduledNotificationAsync(previousId);
    }

    // Get personalized message if setup provided
    let title = '🔥 Check-in Quotidien';
    let body = 'Venez maintenir votre série et gagner +5 XP!';

    if (setup) {
      const message = PersonalizationService.getNotificationMessage(
        setup,
        'daily_checkin'
      );
      title = message.title;
      body = message.body;
    }

    // Create new notification with daily trigger
    // Use CalendarTrigger for daily scheduling (expo-notifications v0.32)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        subtitle: 'N\'oubliez pas votre check-in d\'aujourd\'hui',
        data: {
          type: 'daily_checkin',
          screen: 'home',
        },
        sound: 'default',
        badge: 1,
        color: '#10B981', // Green
      },
      trigger: {
        type: 'calendar',
        hour,
        minute: 0,
        repeats: true,
      } as any, // Cast to any to handle v0.32 compatibility
    });

    // Store notification ID and time for future reference
    await AsyncStorage.setItem(NOTIFICATION_KEY, notificationId);
    await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, `${hour}:00`);

    logger.info(`✅ Daily notification scheduled: ${notificationId}`);
    return notificationId;
  } catch (error) {
    logger.error('❌ Failed to schedule daily notification:', error);
    throw error;
  }
}

/**
 * Cancel daily check-in notification
 */
export async function cancelDailyCheckInNotification(): Promise<void> {
  try {
    const notificationId = await AsyncStorage.getItem(NOTIFICATION_KEY);
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(NOTIFICATION_KEY);
      await AsyncStorage.removeItem(NOTIFICATION_TIME_KEY);
      logger.info('✅ Daily notification cancelled');
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error('❌ Failed to cancel notification', { message: error.message });
    }
    throw error;
  }
}

/**
 * Check if daily notification is currently scheduled
 */
export async function isDailyNotificationScheduled(): Promise<boolean> {
  try {
    const notificationId = await AsyncStorage.getItem(NOTIFICATION_KEY);
    return !!notificationId;
  } catch (error) {
    logger.error('❌ Failed to check notification status:', error);
    return false;
  }
}

/**
 * Get all presented notifications
 * Note: getPendingNotificationsAsync doesn't exist in expo-notifications v0.32
 * Using getPresentedNotificationsAsync instead (notifications currently visible)
 */
export async function getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    // v0.32 API: getPresentedNotificationsAsync returns currently visible notifications
    const notifications = await Notifications.getPresentedNotificationsAsync() as any;
    return notifications || [];
  } catch (error) {
    if (error instanceof Error) {
      logger.error('❌ Failed to get pending notifications', { message: error.message });
    }
    return [];
  }
}

/**
 * Initialize notification handler
 * Call this in app startup (_layout.tsx)
 * Uses expo-notifications v0.32 compatible NotificationBehavior
 */
export function initializeNotificationHandler() {
  // Handle notification when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    } as any), // Cast to handle v0.32 compatibility
  });

  logger.info('✅ Notification handler initialized');
}

/**
 * Add listener for notification received
 * Returns unsubscribe function
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  const subscription = Notifications.addNotificationReceivedListener(callback);
  return () => subscription.remove();
}

/**
 * Add listener for notification response (user taps notification)
 * Returns unsubscribe function
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback);
  return () => subscription.remove();
}

/**
 * Send test notification immediately (for debugging)
 */
export async function sendTestCheckInNotification(): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Test: Check-in Quotidien',
        body: 'Ceci est une notification de test',
        data: {
          type: 'test_notification',
        },
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
    logger.info('✅ Test notification scheduled');
  } catch (error) {
    if (error instanceof Error) {
      logger.error('❌ Failed to send test notification', { message: error.message });
    }
    throw error;
  }
}

/**
 * Reschedule notification (useful when time preference or setup changes)
 * @param setup - Optional human design setup for personalization
 * @param hour - Hour to schedule notification (0-23, default 10 AM)
 */
export async function rescheduleDailyNotification(
  setup?: HumanDesignSetup,
  hour: number = 10
): Promise<string> {
  try {
    // Cancel old one
    await cancelDailyCheckInNotification();

    // Get personalized message if setup provided
    let title = '🔥 Check-in Quotidien';
    let body = 'Venez maintenir votre série et gagner +5 XP!';

    if (setup) {
      const message = PersonalizationService.getNotificationMessage(
        setup,
        'daily_checkin'
      );
      title = message.title;
      body = message.body;
    }

    // Schedule new one with CalendarTrigger (v0.32 compatible)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        subtitle: 'N\'oubliez pas votre check-in d\'aujourd\'hui',
        data: {
          type: 'daily_checkin',
          screen: 'home',
        },
        sound: 'default',
        badge: 1,
        color: '#10B981',
      },
      trigger: {
        type: 'calendar',
        hour,
        minute: 0,
        repeats: true,
      } as any, // Cast to any to handle v0.32 compatibility
    });

    await AsyncStorage.setItem(NOTIFICATION_KEY, notificationId);
    await AsyncStorage.setItem(NOTIFICATION_TIME_KEY, `${hour}:00`);

    logger.info(`✅ Notification rescheduled for ${hour}:00`);
    return notificationId;
  } catch (error) {
    if (error instanceof Error) {
      logger.error('❌ Failed to reschedule notification', { message: error.message });
    }
    throw error;
  }
}
