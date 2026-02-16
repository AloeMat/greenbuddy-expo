/**
 * Mock Notification Service for Testing
 * Provides interface and mock implementation
 */

/**
 * Interface for Notification Service
 */
export interface INotificationService {
  initialize(): Promise<void>;
  registerForPushNotificationsAsync(): Promise<void>;
  scheduleNotification(trigger: any, title: string, body: string): Promise<string>;
  cancelNotification(notificationId: string): Promise<void>;
  cancelPlantNotifications(plantId: string): Promise<void>;
}

export const createMockNotificationService = (overrides?: Partial<INotificationService>): INotificationService => {
  const mockNotifications = new Map<string, any>();

  return {
    async initialize(): Promise<void> {
      // Mock - no-op
    },

    async registerForPushNotificationsAsync(): Promise<void> {
      // Mock - no-op
    },

    async scheduleNotification(trigger: any, title: string, body: string): Promise<string> {
      const id = `mock-notif-${Date.now()}`;
      mockNotifications.set(id, { trigger, title, body });
      return id;
    },

    async cancelNotification(notificationId: string): Promise<void> {
      mockNotifications.delete(notificationId);
    },

    async cancelPlantNotifications(plantId: string): Promise<void> {
      // Mock - no-op
    },

    ...overrides,
  };
};

export const mockNotificationService = createMockNotificationService();
