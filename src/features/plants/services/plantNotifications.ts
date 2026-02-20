/**
 * Notifications Service — Localized to Plants Feature
 * Moved from: lib/services/notifications.ts
 * 
 * Handles plant watering reminders and health alerts
 * Uses expo-notifications for mobile/PWA compatibility
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/lib/services/logger';
import { STORAGE_KEYS } from '@/lib/constants/storageKeys';

/**
 * expo-notifications configuration
 */
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Map to store plant ID → notification IDs for quick cancellation
 */
const plantNotificationMap = new Map<string, string[]>();

export const plantNotificationService = {
  /**
   * Initialize notifications system (call once on app startup)
   */
  async initialize() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('watering', {
          name: 'Watering Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10B981',
          enableLights: true,
          enableVibrate: true,
        });
      }

      // Restore notification map from storage
      await this._restoreNotificationMap();
      logger.info('✅ Plant notifications initialized');
    } catch (error) {
      logger.error('Failed to initialize plant notifications', error);
    }
  },

  /**
   * Schedule a watering reminder for a plant
   */
  async scheduleWateringReminder(plantId: string, daysUntilWatering: number) {
    try {
      const trigger = new Date();
      trigger.setDate(trigger.getDate() + daysUntilWatering);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌱 Time to water!',
          body: `Your plant is ready for watering`,
          data: { plantId },
        },
        trigger,
      });

      // Track notification ID for this plant
      if (!plantNotificationMap.has(plantId)) {
        plantNotificationMap.set(plantId, []);
      }
      plantNotificationMap.get(plantId)?.push(notificationId);

      // Persist to storage
      await this._persistNotificationMap();
      logger.info(`✅ Scheduled watering reminder for plant ${plantId}`);
    } catch (error) {
      logger.error(`Failed to schedule reminder for plant ${plantId}`, error);
    }
  },

  /**
   * Cancel all notifications for a plant
   */
  async cancelPlantNotifications(plantId: string) {
    try {
      const notificationIds = plantNotificationMap.get(plantId) ?? [];

      for (const notificationId of notificationIds) {
        await Notifications.cancelNotificationAsync(notificationId);
      }

      plantNotificationMap.delete(plantId);
      await this._persistNotificationMap();
      logger.info(`✅ Canceled notifications for plant ${plantId}`);
    } catch (error) {
      logger.error(`Failed to cancel notifications for ${plantId}`, error);
    }
  },

  /**
   * Private: Persist notification map to storage
   */
  async _persistNotificationMap() {
    try {
      const map = Object.fromEntries(plantNotificationMap);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PLANT_NOTIFICATIONS,
        JSON.stringify(map)
      );
    } catch (error) {
      logger.warn('Failed to persist notification map', error);
    }
  },

  /**
   * Private: Restore notification map from storage
   */
  async _restoreNotificationMap() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PLANT_NOTIFICATIONS);
      if (stored) {
        const map = JSON.parse(stored);
        Object.entries(map).forEach(([plantId, notificationIds]) => {
          plantNotificationMap.set(plantId, notificationIds as string[]);
        });
      }
    } catch (error) {
      logger.warn('Failed to restore notification map', error);
    }
  },
};
