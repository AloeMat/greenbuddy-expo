/**
 * useWateringReminders Hook
 * Automatically manages watering notification reminders based on plant watering schedule
 * Integrates with usePlants hook for reactive updates
 */

import { useEffect, useCallback } from 'react';
import { notificationService } from '@/lib/services/notifications';
import { logger } from '@/lib/services/logger';
import { Plant } from './usePlants';

export interface UseWateringRemindersOptions {
  enabled?: boolean;
  autoReschedule?: boolean;
}

/**
 * Hook to manage watering reminders for plants
 * Automatically schedules/cancels notifications when plants change
 */
export const useWateringReminders = (
  plants: Plant[],
  options: UseWateringRemindersOptions = {}
) => {
  const { enabled = true, autoReschedule = true } = options;

  /**
   * Schedule reminders for a single plant
   */
  const scheduleForPlant = useCallback(
    async (plant: Plant) => {
      if (!enabled || !plant.next_watering_at) return;

      try {
        const nextWatering = new Date(plant.next_watering_at);
        await notificationService.scheduleWateringReminder(
          plant.id,
          plant.nom_commun,
          nextWatering
        );
      } catch (error) {
        logger.error(`Failed to schedule reminder for ${plant.nom_commun}`, error);
      }
    },
    [enabled]
  );

  /**
   * Reschedule reminders for a plant (cancel old + schedule new)
   */
  const rescheduleForPlant = useCallback(
    async (plant: Plant) => {
      try {
        // Cancel old notifications
        await notificationService.cancelPlantNotifications(plant.id);

        // Schedule new notification
        await scheduleForPlant(plant);
      } catch (error) {
        logger.error(`Failed to reschedule reminder for ${plant.nom_commun}`, error);
      }
    },
    [scheduleForPlant]
  );

  /**
   * Schedule reminders for all plants
   */
  const scheduleAll = useCallback(async () => {
    if (!enabled) return;

    try {
      logger.info(`📅 Scheduling reminders for ${plants.length} plant(s)`);

      for (const plant of plants) {
        await scheduleForPlant(plant);
      }

      logger.info(`✅ Reminders scheduled for ${plants.length} plant(s)`);
    } catch (error) {
      logger.error('Failed to schedule all reminders', error);
    }
  }, [plants, scheduleForPlant, enabled]);

  /**
   * Auto-reschedule when plants change
   */
  useEffect(() => {
    if (!autoReschedule || !enabled) return;

    // Small delay to batch updates
    const timer = setTimeout(async () => {
      try {
        // Cancel all existing notifications
        await notificationService.cancelAllNotifications();

        // Schedule new ones for all plants
        await scheduleAll();
      } catch (error) {
        logger.error('Error auto-rescheduling notifications', error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [plants, autoReschedule, enabled, scheduleAll]);

  /**
   * Initialize notifications on component mount
   */
  useEffect(() => {
    const init = async () => {
      try {
        await notificationService.initialize();
        await notificationService.registerForPushNotificationsAsync();
      } catch (error) {
        logger.error('Failed to initialize notifications', error);
      }
    };

    init();
  }, []);

  return {
    scheduleForPlant,
    rescheduleForPlant,
    scheduleAll,
  };
};
