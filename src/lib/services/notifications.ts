import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

// Configuration par défaut : afficher l'alerte même si l'app est au premier plan
// v0.32 compatible: includes shouldShowBanner and shouldShowList
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

/**
 * Map to store plant ID → notification IDs for quick cancellation
 * Format: { plantId: [notificationId1, notificationId2, ...] }
 */
const plantNotificationMap = new Map<string, string[]>();

export const notificationService = {
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
      logger.info('✅ Notifications initialized');
    } catch (error) {
      logger.error('Failed to initialize notifications', error);
    }
  },

  /**
   * Request permission for notifications
   */
  async registerForPushNotificationsAsync() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('⚠️ Notification permission denied');
        return null;
      }

      logger.info('✅ Notification permission granted');
      return finalStatus;
    } catch (error) {
      logger.error('Error requesting notification permission', error);
      return null;
    }
  },

  /**
   * Schedule a watering reminder for a specific date/time
   */
  async scheduleWateringReminder(
    plantId: string,
    plantName: string,
    nextWateringDate: Date
  ) {
    try {
      const now = new Date();
      const secondsFromNow = Math.floor((nextWateringDate.getTime() - now.getTime()) / 1000);

      // Don't schedule if date is in the past
      if (secondsFromNow < 0) {
        logger.warn(`⚠️ Watering date in the past for ${plantName}`);
        return null;
      }

      // Don't schedule if more than 30 days away (Expo limitation)
      if (secondsFromNow > 30 * 24 * 60 * 60) {
        logger.info(`📅 Watering for ${plantName} too far away (${secondsFromNow}s), skipping`);
        return null;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Arrosage prévu',
          body: `${plantName} a besoin d'eau`,
          sound: true,
          badge: 1,
          data: { plantId },
        },
        trigger: {
          type: 'time',
          seconds: secondsFromNow,
          repeats: false,
        } as any, // Cast to handle v0.32 compatibility
      });

      // Track notification ID for this plant
      if (!plantNotificationMap.has(plantId)) {
        plantNotificationMap.set(plantId, []);
      }
      const notificationIds = plantNotificationMap.get(plantId);
      if (notificationIds) {
        notificationIds.push(id);
      }

      await this._saveNotificationMap();
      logger.info(`✅ Watering reminder scheduled for ${plantName} in ${Math.round(secondsFromNow / 3600)}h (ID: ${id})`);
      return id;
    } catch (error) {
      logger.error('Error scheduling watering reminder', error);
      return null;
    }
  },

  /**
   * Cancel all notifications for a specific plant
   */
  async cancelPlantNotifications(plantId: string) {
    try {
      const notificationIds = plantNotificationMap.get(plantId) || [];

      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }

      plantNotificationMap.delete(plantId);
      await this._saveNotificationMap();

      logger.info(`✅ Cancelled ${notificationIds.length} notification(s) for plant ${plantId}`);
    } catch (error) {
      logger.error('Error cancelling plant notifications', error);
    }
  },

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      plantNotificationMap.clear();
      await this._saveNotificationMap();
      logger.info('✅ All notifications cancelled');
    } catch (error) {
      logger.error('Error cancelling all notifications', error);
    }
  },

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Error getting scheduled notifications', error);
      return [];
    }
  },

  /**
   * Save notification map to AsyncStorage for persistence
   */
  async _saveNotificationMap() {
    try {
      const data = Object.fromEntries(plantNotificationMap);
      await AsyncStorage.setItem('plantNotificationMap', JSON.stringify(data));
    } catch (error) {
      logger.error('Error saving notification map', error);
    }
  },

  /**
   * Restore notification map from AsyncStorage
   */
  async _restoreNotificationMap() {
    try {
      const data = await AsyncStorage.getItem('plantNotificationMap');
      if (data) {
        const parsed = JSON.parse(data);
        plantNotificationMap.clear();
        Object.entries(parsed).forEach(([plantId, notificationIds]: [string, any]) => {
          plantNotificationMap.set(plantId, notificationIds);
        });
        logger.info(`✅ Restored ${plantNotificationMap.size} plant notification mappings`);
      }
    } catch (error) {
      logger.error('Error restoring notification map', error);
    }
  }
};